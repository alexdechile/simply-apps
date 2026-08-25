import sys
import os
import json
from buscadores.scraper import search_ddg, scrape_url


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 researcher.py 'tema' [profundidad] [categoria]")
        sys.exit(1)

    query = sys.argv[1]
    depth = sys.argv[2] if len(sys.argv) > 2 else "sencilla"
    category = sys.argv[3] if len(sys.argv) > 3 else None

    print(f"Iniciando investigación {depth} (categoría: {category}) para: {query}", file=sys.stderr)

    max_links = 5 if depth == "profunda" else 3
    prioritize = True  # Siempre priorizar basándonos en la categoría o fuentes generales
    
    links = search_ddg(query, max_links=max_links, prioritize=prioritize, category=category)

    if not links:
        result = {
            "full_report": f"# Resultado de la investigación\n\nNo se encontraron fuentes relevantes para '{query}'.",
            "links": []
        }
        print(json.dumps(result))
        return

    full_report = f"# Investigación: {query} ({depth.capitalize()})\n\n"
    successful_links = []

    for i, link in enumerate(links, 1):
        print(f"[{i}/{len(links)}] Investigando: {link['title']}...", file=sys.stderr)
        content = scrape_url(link["url"], char_limit=4000)
        if content:
            full_report += f"## Fuente {i}: {link['title']}\n"
            full_report += f"URL: {link['url']}\n\n"
            full_report += content + "\n\n---\n\n"
            successful_links.append({"title": link["title"], "url": link["url"]})
        else:
            full_report += f"## Fuente {i}: {link['title']} (Error al extraer)\n\n"

    result = {
        "full_report": full_report,
        "links": successful_links
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
