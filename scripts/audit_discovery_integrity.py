"""Crawl every sitemap URL and check discovery integrity.

Checks status, redirects, canonical self-reference, robots noindex,
JSON-LD presence and meta description presence. Read-only.

Usage:
  curl -s https://churnisdead.com/sitemap.xml | grep -oE "<loc>[^<]+" \\
    | sed "s/<loc>//" > urls.txt && python3 scripts/audit_discovery_integrity.py
"""
import re, sys, json
from concurrent.futures import ThreadPoolExecutor
import urllib.request

UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
urls = [u.strip() for u in open('urls.txt') if u.strip()]

def check(u):
    r = {"url": u}
    try:
        req = urllib.request.Request(u, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as resp:
            r["status"] = resp.status
            r["final"] = resp.geturl()
            html = resp.read().decode("utf-8", "replace")
    except Exception as e:
        r["status"] = f"ERR {e}"
        return r
    m = re.search(r'<link rel="canonical" href="([^"]*)"', html)
    r["canonical"] = m.group(1) if m else None
    r["canonical_ok"] = (r["canonical"] or "").rstrip("/") == u.rstrip("/")
    rob = re.search(r'<meta name="robots" content="([^"]*)"', html, re.I)
    r["robots"] = rob.group(1) if rob else None
    r["noindex"] = bool(rob and "noindex" in rob.group(1).lower())
    r["jsonld"] = len(re.findall(r'application/ld\+json', html))
    ttl = re.search(r'<title>([^<]*)</title>', html)
    r["title"] = (ttl.group(1) if ttl else "")[:70]
    desc = re.search(r'<meta name="description" content="([^"]*)"', html)
    r["desc_len"] = len(desc.group(1)) if desc else 0
    r["redirected"] = r["final"].rstrip("/") != u.rstrip("/")
    return r

with ThreadPoolExecutor(max_workers=6) as ex:
    res = list(ex.map(check, urls))

json.dump(res, open("audit.json","w"), indent=1)
bad_status = [r for r in res if r["status"] != 200]
bad_canon  = [r for r in res if r["status"]==200 and not r["canonical_ok"]]
noindex    = [r for r in res if r.get("noindex")]
no_jsonld  = [r for r in res if r["status"]==200 and r["jsonld"]==0]
redir      = [r for r in res if r.get("redirected")]
no_desc    = [r for r in res if r["status"]==200 and r["desc_len"]==0]

print(f"checked {len(res)} URLs")
print(f"  non-200:            {len(bad_status)}")
print(f"  redirected:         {len(redir)}")
print(f"  canonical mismatch: {len(bad_canon)}")
print(f"  noindex:            {len(noindex)}")
print(f"  no JSON-LD:         {len(no_jsonld)}")
print(f"  no meta description:{len(no_desc)}")
for label, rows in (("NON-200",bad_status),("REDIRECT",redir),("CANONICAL MISMATCH",bad_canon),("NOINDEX",noindex),("NO JSON-LD",no_jsonld)):
    if rows:
        print(f"\n{label}:")
        for r in rows[:12]:
            print(f"  {r['url'].replace('https://churnisdead.com','')}  status={r['status']} canonical={(r.get('canonical') or '').replace('https://churnisdead.com','')}")
