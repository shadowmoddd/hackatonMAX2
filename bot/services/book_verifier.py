from urllib.parse import quote

from loguru import logger

GOOGLE_SEARCH = "https://www.google.com/search?q={query}+pdf"


def _google_books_search_url(query: str) -> str:
    return GOOGLE_SEARCH.format(query=quote(query))


def _build_query(material: dict) -> str:
    search_query = (material.get("search_query") or "").strip()
    title = (material.get("title") or "").strip()
    author = (material.get("author") or "").strip()

    if search_query:
        return search_query
    if author:
        return f"{title} {author}"
    return title


def validate_book_data(material: dict) -> dict | None:
    title = (material.get("title") or "").strip()
    search_query = (material.get("search_query") or material.get("author") or "").strip()

    if not title or len(title) < 3:
        logger.warning("[BookVerify] No title — removed")
        return None

    if not search_query:
        logger.warning(f"[BookVerify] No search_query for '{title}' — removed")
        return None

    return material


async def process_books_in_roadmap(roadmap_data: dict) -> dict:
    count = 0
    for step in roadmap_data.get("steps", []):
        for mat in step.get("materials", []):
            if mat.get("type") != "book":
                continue

            query = _build_query(mat)
            if not query or len(mat.get("title", "")) < 3:
                step["materials"] = [m for m in step["materials"] if m is not mat]
                logger.warning("[BookSearch] Removed book with no data")
                continue

            mat["url"] = _google_books_search_url(query)
            mat["platform"] = "Google"
            count += 1
            logger.info(f"[BookSearch] '{mat.get('title')}' → {mat['url']}")

    logger.info(f"[BookSearch] Built Google search URLs for {count} books")
    return roadmap_data
