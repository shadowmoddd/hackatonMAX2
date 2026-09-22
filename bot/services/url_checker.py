import asyncio
from urllib.parse import urlparse

import aiohttp
from loguru import logger

TIMEOUT = aiohttp.ClientTimeout(total=8)
MAX_CONCURRENT = 10

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

TRUSTED_PLATFORMS = {"youtube.com", "youtu.be", "google.com"}


def _is_valid_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False


def _is_trusted(url: str) -> bool:
    try:
        host = urlparse(url).netloc.lower().replace("www.", "")
        return any(host == p or host.endswith("." + p) for p in TRUSTED_PLATFORMS)
    except Exception:
        return False


async def _check_url(session: aiohttp.ClientSession, url: str) -> tuple[str, bool]:
    if not _is_valid_url(url):
        return url, False
    if _is_trusted(url):
        return url, True
    try:
        async with session.head(url, allow_redirects=True, timeout=TIMEOUT, headers=HEADERS) as resp:
            if resp.status < 400:
                return url, True
            if resp.status == 405:
                async with session.get(url, allow_redirects=True, timeout=TIMEOUT, headers=HEADERS) as resp2:
                    return url, resp2.status < 400
            return url, False
    except Exception as e:
        logger.debug(f"URL check failed for {url}: {e}")
        return url, False


async def check_urls(urls: list[str]) -> dict[str, bool]:
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)

    async def guarded(session: aiohttp.ClientSession, url: str) -> tuple[str, bool]:
        async with semaphore:
            return await _check_url(session, url)

    connector = aiohttp.TCPConnector(ssl=False)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [guarded(session, url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    outcome: dict[str, bool] = {}
    for r in results:
        if isinstance(r, tuple):
            url, ok = r
            outcome[url] = ok
    for url in urls:
        if url not in outcome:
            outcome[url] = True
    return outcome


def filter_materials(materials: list[dict], url_status: dict[str, bool]) -> tuple[list[dict], list[dict]]:
    valid, invalid = [], []
    for m in materials:
        url = m.get("url", "")
        if url_status.get(url, True):
            valid.append(m)
        else:
            logger.warning(f"Dead link filtered: {url}")
            invalid.append(m)
    return valid, invalid
