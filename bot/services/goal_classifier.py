_RULES: list[tuple[list[str], str, list[str]]] = [
    (["машинное обучение", "машинного обучения", "data science", "датасаенс",
      "нейросет", "нейронн", "искусственный интеллект", "deep learning",
      "machine learning", "аналитик данных", "data analyst", "ml инженер",
      "компьютерное зрение", "nlp", "llm"],
     "it", ["ml"]),

    (["devops", "девопс", "kubernetes", "k8s", "linux администр",
      "сисадмин", "системный администратор", "облачная инфраструктур",
      "ci/cd", "ansible", "terraform"],
     "it", ["devops"]),

    (["фронтенд", "frontend", "javascript разработ", "js разработ",
      "react разработ", "vue разработ", "angular", "верстк"],
     "it", ["frontend"]),

    (["python", "пайтон", "бэкенд", "backend", "django", "flask",
      "fastapi", "api разработ", "серверная разработ"],
     "it", ["backend", "ml"]),

    (["веб разработ", "fullstack", "фуллстек", "сайт разработ",
      "создание сайт", "создать сайт", "делать сайт", "свой сайт"],
     "it", ["frontend", "backend"]),

    (["программирован", "разработчик", "разработка приложен",
      "программист", "кодинг", "it специалист", "айти специалист",
      "software engineer", "написать код"],
     "it", ["backend", "frontend", "ml", "devops"]),

    (["ui/ux", "ux/ui", "ui дизайн", "ux дизайн", "figma",
      "пользовательский интерфейс", "интерфейс дизайн",
      "wireframe", "прототип", "usability"],
     "design", ["ux"]),

    (["графический дизайн", "graphic design", "иллюстрац", "логотип",
      "брендинг", "adobe illustrator", "illustrator", "векторн"],
     "design", ["graphic"]),

    (["веб-дизайн", "веб дизайн", "web design", "дизайн сайт"],
     "design", ["webdesign"]),

    (["дизайн", "дизайнер"],
     "design", ["ux", "graphic", "webdesign"]),

    (["монтаж видео", "видеомонтаж", "монтировать видео",
      "premiere", "after effects", "davinci", "обработка видео",
      "обработка фото", "lightroom", "photoshop", "capcut",
      "видеограф", "фотограф", "ретуш"],
     "video_photo", []),
]


def classify_goal(goal: str) -> dict[str, str | list[str] | None]:
    text = goal.lower()
    for keywords, sphere, specs in _RULES:
        if any(kw in text for kw in keywords):
            return {"sphere": sphere, "specs": specs}
    return {"sphere": None, "specs": []}
