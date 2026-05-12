import sys
import os
import json
import re
import urllib.request
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from buscadores.scraper import search_ddg, scrape_url


def _wiki_search_full(query):
    try:
        params = urllib.parse.urlencode(
            {
                "action": "query",
                "list": "search",
                "srsearch": f'"{query}" song',
                "format": "json",
                "srlimit": 3,
            }
        )
        url = f"https://en.wikipedia.org/w/api.php?{params}"
        req = urllib.request.Request(url, headers={"User-Agent": "SimplyApps/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
        pages = data.get("query", {}).get("search", [])

        if not pages:
            params = urllib.parse.urlencode(
                {
                    "action": "query",
                    "list": "search",
                    "srsearch": query,
                    "format": "json",
                    "srlimit": 3,
                }
            )
            url = f"https://en.wikipedia.org/w/api.php?{params}"
            req = urllib.request.Request(url, headers={"User-Agent": "SimplyApps/1.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read())
            pages = data.get("query", {}).get("search", [])

        if not pages:
            return None

        title = pages[0]["title"]

        # Get detailed extract (up to 8000 chars)
        params = urllib.parse.urlencode(
            {
                "action": "query",
                "prop": "extracts",
                "explaintext": 1,
                "titles": title,
                "format": "json",
                "exlimit": 1,
                "exchars": 8000,
            }
        )
        url = f"https://en.wikipedia.org/w/api.php?{params}"
        req = urllib.request.Request(url, headers={"User-Agent": "SimplyApps/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
        pages_extract = data.get("query", {}).get("pages", {})
        extract = ""
        for page_id, page_data in pages_extract.items():
            if page_id != "-1":
                extract = page_data.get("extract", "")
                break

        # Get summary for structured data
        summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title)}"
        req = urllib.request.Request(
            summary_url, headers={"User-Agent": "SimplyApps/1.0"}
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            summary_data = json.loads(resp.read())

        return {
            "title": summary_data.get("title", title),
            "extract": extract or summary_data.get("extract", ""),
            "url": summary_data.get("content_urls", {})
            .get("desktop", {})
            .get("page", ""),
            "thumbnail": summary_data.get("thumbnail", {}).get("source", ""),
        }
    except Exception as e:
        return {"error": str(e)}


def _archive_search(query):
    try:
        params = urllib.parse.urlencode(
            {
                "q": query,
                "fl[]": ["title", "creator", "description", "identifier"],
                "rows": 3,
                "page": 1,
                "output": "json",
            },
            doseq=True,
        )
        url = f"https://archive.org/advancedsearch.php?{params}"
        req = urllib.request.Request(url, headers={"User-Agent": "SimplyApps/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
        docs = data.get("response", {}).get("docs", [])
        results = []
        for doc in docs[:3]:
            results.append(
                {
                    "title": doc.get("title", ""),
                    "creator": doc.get("creator", ""),
                    "description": (doc.get("description", "") or "")[:500],
                    "url": f"https://archive.org/details/{doc.get('identifier', '')}",
                }
            )
        return results if results else None
    except Exception as e:
        return [{"error": str(e)}]


SITIOS_ENTREVISTAS = [
    "songfacts.com",
    "rollingstone.com",
    "nme.com",
    "theguardian.com",
    "bbc.co.uk",
    "bbc.com",
    "gq.com",
    "pitchfork.com",
    "spin.com",
    "stereogum.com",
    "consequence.net",
    "faroutmagazine.co.uk",
    "uncut.co.uk",
    "mojo4music.com",
    "clashmusic.com",
    "recordcollectormag.com",
    "vulture.com",
    "billboard.com",
    "americansongwriter.com",
    "loudwire.com",
    "ultimateclassicrock.com",
    "genius.com",
    "allmusic.com",
    "pastemagazine.com",
    "thequietus.com",
    "revolvermag.com",
    "kerrang.com",
    "variety.com",
    "nytimes.com",
]


def _buscar_entrevistas(query):
    queries = [
        f'{query} interview "said" "song"',
        f'{query} "talking about"',
        f"{query} behind the song interview",
        f"{query} story behind the song",
    ]
    all_links = []
    seen_urls = set()
    for q in queries:
        links = search_ddg(q, max_links=4)
        for link in links:
            url = link["url"]
            domain = urllib.parse.urlparse(url).netloc.lower()
            domain = re.sub(r"^www\.", "", domain)
            if any(site in domain for site in SITIOS_ENTREVISTAS):
                if url not in seen_urls:
                    seen_urls.add(url)
                    all_links.append(link)
        if len(all_links) >= 4:
            break

    results = []
    for link in all_links[:4]:
        content = scrape_url(link["url"], char_limit=3000)
        if content and len(content) > 200:
            results.append(
                {
                    "title": link["title"],
                    "url": link["url"],
                    "snippet": content[:1500],
                }
            )
    return results if results else None


def _generar_youtube_music_url(query):
    q = urllib.parse.quote(query)
    return f"https://music.youtube.com/search?q={q}"


def buscar_datos(query):
    if not query or not query.strip():
        return {"error": "No query provided"}

    datos = {"query": query}

    try:
        datos["wikipedia"] = _wiki_search_full(query)
    except Exception as e:
        datos["wikipedia"] = {"error": str(e)}

    try:
        datos["internet_archive"] = _archive_search(query)
    except Exception as e:
        datos["internet_archive"] = None

    try:
        datos["entrevistas"] = _buscar_entrevistas(query)
    except Exception as e:
        datos["entrevistas"] = None

    datos["youtube_music"] = _generar_youtube_music_url(query)

    return datos


def main():
    if len(sys.argv) < 2:
        print(
            json.dumps(
                {"error": 'Uso: python3 buscadores/cancion.py "artista - canción"'}
            ),
            file=sys.stderr,
        )
        sys.exit(1)

    query = " ".join(sys.argv[1:])
    print(f"Recopilando datos para: {query}", file=sys.stderr)
    datos = buscar_datos(query)
    print(json.dumps(datos, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
