from urllib.parse import quote


def build_search_url(platform: str, m_type: str, title: str) -> str:
    p = platform.lower()
    q = quote(title)

    if m_type == "course":
        return f"https://www.youtube.com/results?search_query={q}+полный+курс"

    if "vk" in p:
        return f"https://vk.com/video?q={q}"

    if "coursera" in p:
        return f"https://www.coursera.org/search?query={q}&language=Russian"

    if m_type == "lecture":
        return f"https://www.youtube.com/results?search_query={q}+лекция"

    if m_type == "article":
        return f"https://www.google.com/search?q={q}+статья"

    return f"https://www.youtube.com/results?search_query={q}"
