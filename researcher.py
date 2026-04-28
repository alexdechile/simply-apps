import sys
import json
import subprocess
import os
import re
from scrapling.fetchers import Fetcher
import urllib.parse

# Configuración
PYTHON_BIN = sys.executable
SCRAPLING_BIN = os.path.join(os.path.dirname(sys.executable), 'scrapling')
FUENTES_MD_PATH = os.path.join(os.path.dirname(__file__), 'archivos', 'fuentes.md')

def get_prioritized_domains():
    """Extrae dominios de nivel 1 y 2 de fuentes.md"""
    domains = []
    if not os.path.exists(FUENTES_MD_PATH):
        return domains
    
    try:
        with open(FUENTES_MD_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
            # Buscar URLs en formato [Nombre](https://dominio.com)
            matches = re.findall(r'\[.*?\]\((https?://.*?)\)', content)
            for url in matches:
                parsed = urllib.parse.urlparse(url)
                domain = parsed.netloc
                if domain and domain not in domains:
                    # Evitar dominios demasiado generales o de nivel 3 si es posible
                    if not any(x in domain for x in ['reddit.com', 'wikipedia.org', 'youtube.com', 'quora.com']):
                        domains.append(domain)
    except Exception as e:
        print(f"Error parseando fuentes.md: {e}", file=sys.stderr)
    
    return domains[:15] # Limitar a los 15 más relevantes para no saturar la query

def search_ddg(query, depth="sencilla"):
    domains = []
    if depth == "profunda":
        domains = get_prioritized_domains()
    
    # Construir query con dominios si es profunda
    final_query = query
    if domains:
        site_query = " OR ".join([f"site:{d}" for d in domains[:5]]) # Usar los primeros 5 para la primera pasada
        final_query = f"({site_query}) {query}"
    
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(final_query)}"
    
    def fetch_links(search_url):
        try:
            page = Fetcher.get(search_url)
            results = page.css('.result__a')
            links = []
            max_links = 5 if depth == "profunda" else 3
            for res in results[:max_links]:
                title = res.text.strip()
                href = res.attrib.get('href')
                if href and 'uddg=' in href:
                    href = urllib.parse.unquote(href.split('uddg=')[1].split('&')[0])
                if title and href:
                    if href.startswith('//'): href = 'https:' + href
                    links.append({'title': title, 'url': href})
            return links
        except Exception:
            return []

    links = fetch_links(url)
    
    # Fallback si la búsqueda restringida no dio resultados
    if depth == "profunda" and not links:
        print(f"Búsqueda prioritaria sin resultados, intentando general...", file=sys.stderr)
        url_general = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
        links = fetch_links(url_general)
        
    return links

def scrape_url(url):
    try:
        temp_file = "temp_research.md"
        cmd = [SCRAPLING_BIN, "extract", "get", url, temp_file, "--ai-targeted", "--timeout", "20"]
        subprocess.run(cmd, check=True, capture_output=True)
        
        if os.path.exists(temp_file):
            with open(temp_file, 'r', encoding='utf-8') as f:
                content = f.read()
            os.remove(temp_file)
            limit = 4000 # Más capacidad en el scrape
            return content[:limit] + "..." if len(content) > limit else content
        return ""
    except Exception:
        return ""

def main():
    if len(sys.argv) < 2:
        print("Uso: python3 researcher.py 'tema' [profundidad]")
        sys.exit(1)

    query = sys.argv[1]
    depth = sys.argv[2] if len(sys.argv) > 2 else "sencilla"
    
    print(f"Iniciando investigación {depth} para: {query}", file=sys.stderr)
    links = search_ddg(query, depth)
    
    if not links:
        print(f"# Resultado de la investigación\n\nNo se encontraron fuentes relevantes para '{query}'.")
        return

    full_report = f"# Investigación: {query} ({depth.capitalize()})\n\n"
    
    for i, link in enumerate(links, 1):
        print(f"[{i}/{len(links)}] Investigando: {link['title']}...", file=sys.stderr)
        content = scrape_url(link['url'])
        if content:
            full_report += f"## Fuente {i}: {link['title']}\n"
            full_report += f"URL: {link['url']}\n\n"
            full_report += content + "\n\n---\n\n"
        else:
            full_report += f"## Fuente {i}: {link['title']} (Error al extraer)\n\n"

    print(full_report)

if __name__ == "__main__":
    main()
