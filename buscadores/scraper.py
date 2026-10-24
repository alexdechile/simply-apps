import os
import re
import sys
import json
import subprocess
import urllib.parse
import urllib.request
from scrapling.fetchers import Fetcher


def get_fuentes_path():
    return os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "archivos", "fuentes.md"
    )


def get_prioritized_domains(category=None, max_domains=100):
    domains = []
    path = get_fuentes_path()
    if not os.path.exists(path):
        return domains
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        if category:
            category = category.lower().strip()
            mappings = {
                "ciencia": "ciencia",
                "medicina": "ciencia",
                "derecho": "derecho",
                "politica": "derecho",
                "economia": "economía",
                "finanzas": "economía",
                "historia": "historia",
                "humanidades": "historia",
                "tecnologia": "tecnología",
                "ia": "tecnología",
                "datos": "datos",
                "estadisticas": "datos"
            }
            keyword = mappings.get(category)
            if keyword:
                sections = re.split(r'\n## ', '\n' + content)
                matched_content = ""
                for sec in sections:
                    lines = sec.strip().split('\n')
                    if lines:
                        title = lines[0].lower()
                        if keyword in title:
                            matched_content = '\n'.join(lines[1:])
                            break
                if matched_content:
                    content = matched_content
                    print(f"Filtrando fuentes.md por categoría: {category} (keyword: {keyword})", file=sys.stderr)

        matches = re.findall(r"\[.*?\]\((https?://.*?)\)", content)
        for url in matches:
            parsed = urllib.parse.urlparse(url)
            domain = parsed.netloc
            if domain:
                clean_domain = domain.lower()
                if clean_domain.startswith("www."):
                    clean_domain = clean_domain[4:]
                if clean_domain and clean_domain not in domains:
                    if not any(
                        x in clean_domain
                        for x in ["reddit.com", "wikipedia.org", "youtube.com", "quora.com"]
                    ):
                        domains.append(clean_domain)
    except Exception as e:
        print(f"Error parseando fuentes.md: {e}", file=sys.stderr)
    return domains[:max_domains]


def search_google(query, max_links=5):
    api_key = os.environ.get("GOOGLE_SEARCH_API_KEY")
    cx = os.environ.get("GOOGLE_SEARCH_CX")
    if not api_key or not cx:
        return []
    try:
        params = urllib.parse.urlencode({
            "key": api_key,
            "cx": cx,
            "q": query,
            "num": min(max_links, 10)
        })
        url = f"https://www.googleapis.com/customsearch/v1?{params}"
        req = urllib.request.Request(url, headers={"User-Agent": "SimplyApps/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        items = data.get("items", [])
        results = []
        for item in items:
            title = item.get("title", "")
            link = item.get("link", "")
            if link and title:
                results.append({"title": title, "url": link})
        if results:
            print(f"[Google Search] Encontrados {len(results)} resultados para: {query}", file=sys.stderr)
        return results
    except Exception as e:
        print(f"[Google Search] Advertencia o fallo ({e}), recurriendo a DuckDuckGo", file=sys.stderr)
        return []


def search_ddg(query, max_links=3, skip_ads=True, prioritize=False, category=None):
    # Intentar primero Google Search si hay API Key disponible
    google_limit = 10 if prioritize else max_links
    google_links = search_google(query, max_links=google_limit)
    if google_links:
        raw_links = google_links
    else:
        url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
        try:
            page = Fetcher.get(url)
            results = page.css(".result__a")
            raw_links = []
            
            # Si priorizamos, buscamos hasta 15 enlaces para poder filtrar mejor
            limit = 15 if prioritize else max_links
            
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
                raw_links.append({"title": title, "url": href})
                if len(raw_links) >= limit:
                    break
        except Exception as e:
            print(f"Error in search_ddg: {e}", file=sys.stderr)
            return []

    try:
                
        if prioritize:
            p_domains = get_prioritized_domains(category=category, max_domains=150)
            matched = []
            others = []
            for link in raw_links:
                parsed = urllib.parse.urlparse(link["url"])
                domain = (parsed.netloc or "").lower()
                if domain.startswith("www."):
                    domain = domain[4:]
                    
                is_prioritized = False
                for p_dom in p_domains:
                    if domain == p_dom or domain.endswith('.' + p_dom) or p_dom.endswith('.' + domain):
                        is_prioritized = True
                        break
                
                if is_prioritized:
                    matched.append(link)
                else:
                    others.append(link)
            
            if matched:
                print(f"Prioritizing {len(matched)} reliable sources!", file=sys.stderr)
                for m in matched:
                    print(f" -> {m['url']}", file=sys.stderr)
                    
            combined = matched + others
            return combined[:max_links]
        else:
            return raw_links[:max_links]
    except Exception as e:
        print(f"Error in search_ddg: {e}", file=sys.stderr)
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
