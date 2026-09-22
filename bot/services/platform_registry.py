from urllib.parse import urlparse

PLATFORM_DOMAINS: dict[str, str] = {
    "youtube.com": "YouTube",
    "youtu.be": "YouTube",
    "habr.com": "Habr",
    "rutube.ru": "RuTube",
    "vk.com": "VK Видео",
    "vk.ru": "VK Видео",
    "google.com": "Google",
    "tproger.ru": "Tproger",
}

PAID_PLATFORM_DOMAINS: frozenset[str] = frozenset({
    "skillbox.ru", "netology.ru", "geekbrains.ru",
    "productstar.ru", "gb.ru", "otus.ru", "openedu.ru",
    "stepik.org",
})

VIDEO_ONLY_PLATFORMS: frozenset[str] = frozenset({"YouTube", "RuTube", "VK Видео"})


def platform_from_url(url: str) -> str:
    try:
        host = urlparse(url).netloc.lower().removeprefix("www.")
        for domain, name in PLATFORM_DOMAINS.items():
            if host == domain or host.endswith("." + domain):
                return name
    except Exception:
        pass
    return "YouTube"
