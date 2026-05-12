import os
import re
import sys
import subprocess
import urllib.parse
from scrapling.fetchers import Fetcher


def get_fuentes_path():
    return os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "archivos", "fuentes.md"
    )


def get_prioritized_domains(max_domains=15):
    domains = []
    path = get_fuentes_path()
    if not os.path.exists(path):
        return domains
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        matches = re.findall(r"\[.*?\]\((https?://.*?)\)", content)
        for url in matches:
            parsed = urllib.parse.urlparse(url)
            domain = parsed.netloc
            if domain and domain not in domains:
                if not any(
                    x in domain
                    for x in ["reddit.com", "wikipedia.org", "youtube.com", "quora.com"]
                ):
                    domains.append(domain)
    except Exception as e:
        print(f"Error parseando fuentes.md: {e}", file=sys.stderr)
    return domains[:max_domains]


def search_ddg(query, max_links=3, skip_ads=True):
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    try:
        page = Fetcher.get(url)
        results = page.css(".result__a")
        links = []
        for res in results:
            title = res.text.strip()
            href = res.attrib.get("href")
            if href and "uddg=" in href:
                href = urllib.parse.unquote(href.split("uddg=")[1].split("&")[0])
            if not title or not href:
                continue
            if href.startswith("//"):
                href = "https:" + href
            if skip_ads and ("y.js" in href or "aclick" in href or "ad_domain" in href):
                continue
            links.append({"title": title, "url": href})
            if len(links) >= max_links:
                break
        return links
    except Exception:
        return []


def scrape_url(url, char_limit=4000):
    scrapling_bin = os.path.join(os.path.dirname(sys.executable), "scrapling")
    temp_file = f"temp_scrape_{os.getpid()}.md"
    try:
        cmd = [
            scrapling_bin,
            "extract",
            "get",
            url,
            temp_file,
            "--ai-targeted",
            "--timeout",
            "20",
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        if os.path.exists(temp_file):
            with open(temp_file, "r", encoding="utf-8") as f:
                content = f.read()
            os.remove(temp_file)
            if len(content) > char_limit:
                content = content[:char_limit] + "..."
            return content
        return ""
    except Exception:
        if os.path.exists(temp_file):
            os.remove(temp_file)
        return ""
