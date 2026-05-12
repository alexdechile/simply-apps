import sys
import os
from buscadores.scraper import search_ddg, scrape_url, get_prioritized_domains


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 researcher.py 'tema' [profundidad]")
        sys.exit(1)

    query = sys.argv[1]
    depth = sys.argv[2] if len(sys.argv) > 2 else "sencilla"

    print(f"Iniciando investigación {depth} para: {query}", file=sys.stderr)

    max_links = 5 if depth == "profunda" else 3
    links = search_ddg(query, max_links=max_links)

    if not links:
        print(
            f"# Resultado de la investigación\n\nNo se encontraron fuentes relevantes para '{query}'."
        )
        return

    full_report = f"# Investigación: {query} ({depth.capitalize()})\n\n"

    for i, link in enumerate(links, 1):
        print(f"[{i}/{len(links)}] Investigando: {link['title']}...", file=sys.stderr)
        content = scrape_url(link["url"], char_limit=4000)
        if content:
            full_report += f"## Fuente {i}: {link['title']}\n"
            full_report += f"URL: {link['url']}\n\n"
            full_report += content + "\n\n---\n\n"
        else:
            full_report += f"## Fuente {i}: {link['title']} (Error al extraer)\n\n"

    print(full_report)


if __name__ == "__main__":
    main()
