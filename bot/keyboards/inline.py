from bot.config import settings


def cb(text: str, payload: str) -> dict:
    return {"type": "callback", "text": text, "payload": payload}


def open_app(text: str = "🚀 Открыть приложение") -> dict:
    if settings.MAX_BOT_USERNAME:
        return {"type": "open_app", "text": text, "web_app": settings.MAX_BOT_USERNAME}
    return {"type": "link", "text": text, "url": settings.MINIAPP_URL}


def time_keyboard():
    return [[cb("⏱ Меньше 1 часа", "time_lt1"), cb("⏰ 1–2 часа", "time_1to2")], [cb("🕐 3–5 часов", "time_3to5"), cb("💪 5+ часов", "time_gt5")]]


def learn_style_keyboard():
    return [[cb("📖 Теория + практика вместе", "lstyle_theory_practice")], [cb("🛠 Только практика, минимум теории", "lstyle_practice")], [cb("👀 Смотрю примеры и повторяю", "lstyle_examples")], [cb("📝 Структурированный курс с заданиями", "lstyle_structured")]]


def total_hours_keyboard():
    return [[cb("⚡ До 10 часов", "hours_10"), cb("📘 10–20 часов", "hours_20")], [cb("🎯 20–40 часов", "hours_40"), cb("🔥 40–80 часов", "hours_80")], [cb("🚀 80+ часов", "hours_80plus")]]


def profile_confirm_keyboard():
    return [[cb("✅ Всё верно, строим маршрут!", "profile_confirm")], [cb("✏️ Изменить", "profile_edit")]]


def formats_keyboard(selected=None):
    selected = selected or []
    formats = [("📺 Видео", "video"), ("📰 Статьи", "article"), ("🎓 Курсы", "course"), ("🎙 Лекции", "lecture"), ("📚 Книги", "book")]
    rows = []
    for i in range(0, len(formats), 2):
        row = []
        for text, key in formats[i:i + 2]:
            row.append(cb(("✅ " if key in selected else "") + text, f"toggle_fmt_{key}"))
        rows.append(row)
    rows.append([cb("➡️ Далее", "formats_done")])
    return rows


def step_actions_keyboard(step_id: int, has_next=True):
    rows = [[cb("✅ Завершить шаг", f"step_complete_{step_id}")]]
    if has_next:
        rows[0].append(cb("📚 Следующий шаг", f"step_next_{step_id}"))
    rows.append([cb("👎 Не подходит", f"step_dislike_{step_id}"), cb("🔄 Изменить маршрут", "roadmap_adjust")])
    return rows


def feedback_reason_keyboard(step_id: int):
    return [[cb("😰 Слишком сложно", f"fb_hard_{step_id}"), cb("😴 Слишком просто", f"fb_easy_{step_id}")], [cb("📺 Другой формат", f"fb_format_{step_id}"), cb("✅ Уже прошёл", f"fb_done_{step_id}")], [cb("🎯 Изменить цель", "fb_change_goal"), cb("◀️ Назад", f"step_back_{step_id}")]]


def adjustment_keyboard():
    return [[cb("📈 Сделать сложнее", "adj_harder"), cb("📉 Сделать проще", "adj_easier")], [cb("🎬 Больше видео", "adj_more_video"), cb("📖 Больше статей", "adj_more_articles")], [cb("🎯 Изменить цель", "adj_change_goal"), cb("◀️ Отмена", "adj_cancel")]]


def roadmap_start_keyboard():
    return [[open_app()]]


def progress_keyboard(roadmap_id: int, next_step_title=""):
    label = f"▶️ {next_step_title[:28]}..." if len(next_step_title) > 28 else f"▶️ {next_step_title}" if next_step_title else "▶️ Продолжить"
    return [[cb("📊 Мой прогресс", f"progress_{roadmap_id}")], [cb(label, "roadmap_continue")]]
