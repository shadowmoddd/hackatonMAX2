import asyncio
import re

from loguru import logger

from bot.services.link_finder import build_search_url
from bot.services.platform_registry import platform_from_url

_TYPE_PHRASES = re.compile(
    r"^(эта статья|эта лекция|этот курс|это видео|данный курс|данная статья|данное видео)\s*",
    re.IGNORECASE,
)


def _clean_why(text: str) -> str:
    return _TYPE_PHRASES.sub("", text).strip().capitalize()


def is_russian_text(text: str) -> bool:
    letters = re.findall(r"[a-zA-Zа-яёА-ЯЁ]", text)
    if len(letters) <= 3:
        return True
    cyrillic = sum(1 for c in letters if "Ѐ" <= c <= "ӿ")
    return (cyrillic / len(letters)) >= 0.3


def filter_non_russian(roadmap_data: dict) -> dict:
    removed_total = 0
    for step in roadmap_data.get("steps", []):
        kept = []
        for m in step.get("materials", []):
            title = m.get("title", "")
            why = m.get("why_this", "")
            if is_russian_text(f"{title} {why}"):
                kept.append(m)
            else:
                removed_total += 1
                logger.warning(f"[LangFilter] Non-Russian removed: '{title}'")
                step.setdefault("removed_materials", []).append(m)
        step["materials"] = kept

    if removed_total:
        logger.info(f"[LangFilter] Removed {removed_total} non-Russian materials")
    return roadmap_data


async def resolve_urls(roadmap_data: dict) -> dict:
    from bot.services.ddg_search import DDG_CONCURRENCY, DDG_DELAY, find_real_url

    semaphore = asyncio.Semaphore(DDG_CONCURRENCY)
    counts = {"found": 0, "fallback": 0}

    async def process(material: dict) -> None:
        if material.get("type") == "book":
            return

        platform = material.get("platform", "")
        m_type = material.get("type", "")
        title = material.get("_search_query") or material.get("title", "")

        async with semaphore:
            result = await find_real_url(platform, m_type, title)
            await asyncio.sleep(DDG_DELAY)

        if result:
            url, pname = result
            material["url"] = url
            material["platform"] = pname
            counts["found"] += 1
        else:
            url = build_search_url(platform, m_type, material.get("title", title))
            material["url"] = url
            material["platform"] = platform_from_url(url)
            counts["fallback"] += 1

        material.pop("_search_query", None)
        material.pop("_from_db", None)

        if material.get("why_this"):
            material["why_this"] = _clean_why(material["why_this"])

    tasks = [
        process(m)
        for step in roadmap_data.get("steps", [])
        for m in step.get("materials", [])
    ]
    await asyncio.gather(*tasks)
    logger.info(f"[URLs] DDG: {counts['found']} direct links, {counts['fallback']} search fallbacks")
    return roadmap_data
