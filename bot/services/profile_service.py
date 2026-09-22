import json
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from bot.db.models import User, UserProfile
from bot.db.repository import ProfileRepository, UserRepository

SPHERE_LABELS = {
    "it": "IT / Программирование",
    "design": "Дизайн",
    "video_photo": "Обработка видео и фото",
}

LEVEL_LABELS = {
    "beginner": "Новичок (с нуля)",
    "elementary": "Есть база",
    "intermediate": "Средний",
    "advanced": "Продвинутый",
}

TIME_LABELS = {
    "lt1": "Меньше 1 часа в неделю",
    "1to2": "1–2 часа в неделю",
    "3to5": "3–5 часов в неделю",
    "gt5": "5+ часов в неделю",
}

TOTAL_HOURS_LABELS = {
    "10": "До 10 часов",
    "20": "10–20 часов",
    "40": "20–40 часов",
    "80": "40–80 часов",
    "80plus": "80+ часов",
}

TOTAL_HOURS_VALUES = {
    "10": "до 10 часов суммарно",
    "20": "10–20 часов суммарно",
    "40": "20–40 часов суммарно",
    "80": "40–80 часов суммарно",
    "80plus": "более 80 часов суммарно",
}

FORMAT_LABELS = {
    "video": "Видео",
    "article": "Статьи",
    "course": "Курсы",
    "lecture": "Лекции",
    "book": "Книги",
}

LEARN_STYLE_LABELS = {
    "theory_practice": "Теория + практика",
    "practice": "Только практика",
    "examples": "Примеры и повтор",
    "structured": "Структурированный курс",
}

LEARN_STYLE_VALUES = {
    "theory_practice": "совмещение теории и практики",
    "practice": "упор на практику, минимум теории",
    "examples": "изучение через примеры и повторение",
    "structured": "структурированный курс с заданиями и проверками",
}

async def get_or_create_user(session: AsyncSession, platform_user_id: int, username: Optional[str], first_name: Optional[str]) -> User:
    repo = UserRepository(session)
    return await repo.get_or_create(platform_user_id, username, first_name)


async def save_profile(session: AsyncSession, user_id: int, fsm_data: dict) -> UserProfile:
    repo = ProfileRepository(session)
    formats = fsm_data.get("formats", [])
    profile_data = {
        "goal": fsm_data.get("goal"),
        "sphere": fsm_data.get("sphere"),
        "specialization": fsm_data.get("specialization"),
        "level": fsm_data.get("level"),
        "time_per_week": fsm_data.get("time_per_week"),
        "total_hours": fsm_data.get("total_hours"),
        "preferred_formats": json.dumps(formats, ensure_ascii=False),
        "learn_style": fsm_data.get("learn_style"),
        "raw_answers": json.dumps(fsm_data, ensure_ascii=False),
    }
    return await repo.upsert(user_id, profile_data)


def format_profile_summary(data: dict) -> str:
    sphere_key = data.get("sphere", "")
    sphere = SPHERE_LABELS.get(sphere_key, sphere_key)

    level_key = data.get("level", "")
    level = LEVEL_LABELS.get(level_key, level_key)

    time_key = data.get("time_per_week", "")
    time_str = TIME_LABELS.get(time_key, time_key)

    hours_key = data.get("total_hours", "")
    hours_str = TOTAL_HOURS_LABELS.get(hours_key, hours_key) if hours_key else "не указано"

    formats = data.get("formats", [])
    formats_str = ", ".join(FORMAT_LABELS.get(f, f) for f in formats) if formats else "не указано"

    learn_style_key = data.get("learn_style", "")
    learn_style_str = LEARN_STYLE_LABELS.get(learn_style_key, "—")

    lines = [
        "📋 <b>Твой профиль:</b>\n",
        f"🎯 <b>Цель:</b> {data.get('goal', '—')}",
        f"📚 <b>Сфера:</b> {sphere}",
        *(
            [f"🎯 <b>Направление:</b> {data.get('specialization', '').replace('_', ' ').title()}"]
            if data.get("specialization")
            else []
        ),
        f"📊 <b>Уровень:</b> {level}",
        f"🎓 <b>Стиль обучения:</b> {learn_style_str}",
        f"⏰ <b>Время в неделю:</b> {time_str}",
        f"🕐 <b>Всего часов:</b> {hours_str}",
        f"🎬 <b>Форматы:</b> {formats_str}",
    ]
    return "\n".join(lines)
