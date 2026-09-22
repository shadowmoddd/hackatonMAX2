import asyncio
from urllib.parse import urlparse

from ddgs import DDGS
from loguru import logger

from bot.services.platform_registry import (
    PAID_PLATFORM_DOMAINS,
    VIDEO_ONLY_PLATFORMS,
    platform_from_url,
)

DDG_DELAY = 1.5
DDG_TIMEOUT = 12.0
DDG_CONCURRENCY = 2


def _build_query(platform: str, m_type: str, title: str) -> str:
    p = platform.lower()
    t = title.strip()

    if "habr" in p or (m_type == "article" and not p):
        return f"{t} habr статья"
    if "rutube" in p:
        return f"{t} rutube"
    if m_type == "course":
        return f"{t} полный курс youtube"
    if m_type == "article":
        return f"{t} статья"
    if m_type == "lecture":
        return f"{t} лекция youtube"
    return t


def _sync_search(query: str) -> list[dict]:
    with DDGS() as ddgs:
        return list(ddgs.text(query, region="ru-ru", max_results=3))


async def find_real_url(platform: str, m_type: str, title: str) -> tuple[str, str] | None:
    query = _build_query(platform, m_type, title)
    try:
        loop = asyncio.get_running_loop()
        results = await asyncio.wait_for(
            loop.run_in_executor(None, _sync_search, query),
            timeout=DDG_TIMEOUT,
        )
        if results:
            url = results[0].get("href", "")
            if url.startswith("http"):
                pname = platform_from_url(url)
                host = urlparse(url).netloc.lower().replace("www.", "")

                if m_type == "course" and pname not in VIDEO_ONLY_PLATFORMS:
                    logger.warning(f"[DDG] Course filtered (not video platform): {url}")
                elif any(host == d or host.endswith("." + d) for d in PAID_PLATFORM_DOMAINS):
                    logger.warning(f"[DDG] Paid platform filtered: {url}")
                else:
                    logger.info(f"[DDG] '{title[:50]}' → {url}")
                    return url, pname
    except asyncio.TimeoutError:
        logger.warning(f"[DDG] Timeout: '{title[:50]}'")
    except Exception as e:
        msg = str(e).lower()
        if "ratelimit" in msg or "202" in msg:
            logger.warning(f"[DDG] Rate limited: '{title[:50]}'")
        else:
            logger.warning(f"[DDG] Error for '{title[:50]}': {e}")
    return None
