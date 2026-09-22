from datetime import datetime, timezone

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from bot.db.models import Roadmap, RoadmapStep, User, UserProfile
from bot.db.repository import RoadmapRepository, StepRepository
from bot.services.ai_service import get_ai_service
from bot.services.book_verifier import process_books_in_roadmap
from bot.services.content_verifier import filter_non_russian, resolve_urls
from bot.services.quality_metrics import annotate_roadmap

DIFFICULTY_EMOJI = {
    "beginner": "🌱",
    "intermediate": "🌿",
    "advanced": "🚀",
}

TYPE_EMOJI = {
    "video": "📺",
    "course": "🎓",
    "article": "📰",
    "lecture": "🎙",
    "book": "📚",
}

_GOOGLE_TYPE_LABELS = {
    "book": "🔍 Найти книгу (Google)",
    "article": "🔍 Найти статью (Google)",
    "course": "🔍 Найти курс (Google)",
}


def _enrich_with_db_resources(roadmap_data: dict, profile: UserProfile) -> dict:
    from bot.services.recommendation_engine import get_recommendation_engine
    engine = get_recommendation_engine()

    if not engine.resources:
        return roadmap_data

    for step in roadmap_data.get("steps", []):
        step_topics = step.get("skills", []) + [step.get("title", "")]
        db_resources = engine.find_matching_resources(profile, step_topics, limit=2)

        if not db_resources:
            continue

        existing_titles = {m.get("title", "").lower()[:40] for m in step.get("materials", [])}
        new_materials = []
        for r in db_resources:
            mat = engine.resource_to_material(r)
            if mat["title"].lower()[:40] not in existing_titles:
                new_materials.append(mat)

        if new_materials:
            step["materials"] = new_materials + step.get("materials", [])[:2]
            logger.debug(f"[RecEngine] Enriched step '{step.get('title')}' with {len(new_materials)} DB resources")

    return roadmap_data


def _filter_by_formats(roadmap_data: dict, selected_formats: list[str]) -> dict:
    fmt_set = set(selected_formats)
    for step in roadmap_data.get("steps", []):
        original = step.get("materials", [])
        filtered = [m for m in original if m.get("type", "") in fmt_set]
        removed = [m for m in original if m.get("type", "") not in fmt_set]
        step["materials"] = filtered
        if removed:
            step.setdefault("removed_materials", []).extend(removed)
            logger.debug(f"Format filter removed {len(removed)} materials from step '{step.get('title')}'")
    return roadmap_data


async def _refill_empty_steps(ai, profile: UserProfile, roadmap_data: dict) -> dict:
    empty_steps = [s for s in roadmap_data.get("steps", []) if not s.get("materials")]
    if not empty_steps:
        return roadmap_data

    logger.info(f"[Refill] {len(empty_steps)} steps have no materials — requesting alternatives from AI")
    for step in empty_steps:
        try:
            removed = step.pop("removed_materials", [])
            removed_titles = [m.get("title", "") for m in removed]
            reason = f"Предыдущие материалы оказались нерелевантны или недоступны: {', '.join(removed_titles)}. Подбери замену."

            logger.info(f"[Refill] Requesting alternative for step '{step.get('title')}'")
            alternative = await ai.refill_step_materials(
                order_num=step.get("order", 0),
                title=step.get("title", ""),
                skills=step.get("skills", []),
                reason=reason,
                profile=profile,
            )
            new_materials = alternative.get("materials", [])
            logger.info(f"[Refill] Got {len(new_materials)} new materials")

            from bot.services.url_checker import check_urls, filter_materials
            new_urls = [m.get("url", "") for m in new_materials if m.get("url")]
            if new_urls:
                url_status = await check_urls(new_urls)
                new_materials, _ = filter_materials(new_materials, url_status)
            step["materials"] = new_materials
        except Exception as e:
            logger.error(f"[Refill] Failed for step '{step.get('title')}': {e}")

    return roadmap_data


async def create_roadmap_from_profile(session: AsyncSession, user_id: int, profile: UserProfile) -> tuple[Roadmap, list[RoadmapStep]]:
    ai = get_ai_service()
    roadmap_repo = RoadmapRepository(session)
    step_repo = StepRepository(session)

    await roadmap_repo.abandon_active(user_id)

    logger.info(f"[Pipeline] AI generation for user_id={user_id} | goal='{profile.goal}'")
    roadmap_data = await ai.generate_roadmap(profile)
    logger.info(f"[Pipeline] Generated: '{roadmap_data.get('title')}' ({len(roadmap_data.get('steps', []))} steps)")

    roadmap_data = _enrich_with_db_resources(roadmap_data, profile)

    selected_formats = profile.get_preferred_formats()
    if selected_formats:
        roadmap_data = _filter_by_formats(roadmap_data, selected_formats)

    roadmap_data = filter_non_russian(roadmap_data)

    roadmap_data = await process_books_in_roadmap(roadmap_data)

    roadmap_data = await resolve_urls(roadmap_data)

    roadmap_data = annotate_roadmap(roadmap_data, profile)

    roadmap_data = await _refill_empty_steps(ai, profile, roadmap_data)

    if selected_formats:
        roadmap_data = _filter_by_formats(roadmap_data, selected_formats)

    logger.info("[Pipeline] Saving to DB")
    roadmap = await roadmap_repo.create(
        user_id=user_id,
        title=roadmap_data["title"],
        description=roadmap_data.get("description", ""),
        total_steps=len(roadmap_data["steps"]),
        estimated_weeks=roadmap_data.get("estimated_weeks", 0),
    )
    steps = await step_repo.create_bulk(roadmap.id, roadmap_data["steps"])
    logger.info(f"[Pipeline] Saved roadmap id={roadmap.id} with {len(steps)} steps")
    return roadmap, steps


def format_roadmap_overview(roadmap: Roadmap) -> str:
    weeks = roadmap.estimated_weeks or "?"
    lines = [
        f"🗺 <b>{roadmap.title}</b>\n",
        f"{roadmap.description}\n",
        f"📊 Шагов: <b>{roadmap.total_steps}</b>",
        f"⏳ Примерное время: <b>{weeks} недель</b>",
        "\nГотов начать? Вот твой первый шаг 👇",
    ]
    return "\n".join(lines)


def format_step_card(step: RoadmapStep, total_steps: int) -> str:
    skills = step.get_skills()
    skills_str = " • ".join(skills) if skills else "—"

    lines = [
        f"<b>Шаг {step.order_num}/{total_steps}: {step.title}</b>\n",
        f"💡 <b>Зачем:</b> {step.why}\n",
        f"🧠 <b>Навыки:</b> {skills_str}\n",
        f"💼 <b>Карьера:</b> {step.career_relevance}\n",
        "📚 <b>Материалы:</b>",
    ]
    return "\n".join(lines)


def format_material_card(material: dict, index: int) -> str:
    from html import escape
    from bot.services.quality_metrics import score_label

    m_type = material.get("type", "")
    emoji = TYPE_EMOJI.get(m_type, "📌")
    diff_emoji = DIFFICULTY_EMOJI.get(material.get("difficulty", ""), "")
    platform = escape(material.get("platform", ""))
    duration = escape(material.get("duration", ""))
    why_this = escape(material.get("why_this", ""))
    title = escape(material.get("title", "Без названия"))
    url = material.get("url", "#")
    score = material.get("_score")

    if not url.startswith(("http://", "https://")):
        url = "#"
    safe_url = url.replace('"', "%22").replace("'", "%27")

    if "google.com" in url and m_type in _GOOGLE_TYPE_LABELS:
        link_label = _GOOGLE_TYPE_LABELS[m_type]
    else:
        link_label = f"🔍 Найти на {platform}" if platform else "🔍 Найти"

    lines = [
        f"{emoji} <b>{index}. {title}</b>",
        f"<a href=\"{safe_url}\">{link_label}</a> {diff_emoji}",
    ]
    if duration:
        lines.append(f"⏱ {duration}")
    if why_this:
        lines.append(f"✨ {why_this}")
    if score is not None:
        lines.append(f"<i>{score_label(score)}</i>")
    return "\n".join(lines)


def format_progress_card(roadmap: Roadmap, steps: list[RoadmapStep], user: User | None = None) -> str:
    total = len(steps)
    completed = sum(1 for s in steps if s.status == "completed")
    skipped = sum(1 for s in steps if s.status == "skipped")
    remaining = total - completed - skipped
    percent = int((completed / total) * 100) if total > 0 else 0

    filled = round(percent / 10)
    bar = "🟩" * filled + "⬜" * (10 - filled)

    if percent == 0:
        motivation = "Начни первый шаг — это самое главное! 🚀"
    elif percent < 30:
        motivation = "Отличное начало, продолжай в том же духе! 💪"
    elif percent < 60:
        motivation = "Ты на полпути — не останавливайся! 🔥"
    elif percent < 100:
        motivation = "Почти у цели, осталось совсем немного! ⭐"
    else:
        motivation = "Маршрут пройден! Ты справился! 🏆"

    STATUS_ICON = {
        "completed": "✅",
        "in_progress": "▶️",
        "skipped": "⏭",
        "pending": "⬜",
    }
    step_lines = []
    for s in sorted(steps, key=lambda x: x.order_num):
        icon = STATUS_ICON.get(s.status, "⬜")
        current = " <i>← сейчас</i>" if s.status == "in_progress" else ""
        step_lines.append(f"  {icon} {s.order_num}. {s.title}{current}")

    weeks_left = None
    if roadmap.estimated_weeks and total > 0:
        weeks_left = round(roadmap.estimated_weeks * remaining / total)

    lines = [
        f"🗺 <b>{roadmap.title}</b>\n",
        f"{bar}  <b>{percent}%</b>\n",
        "<b>Шаги:</b>",
        *step_lines,
        "",
        f"✅ Завершено: <b>{completed}</b> из <b>{total}</b>",
    ]
    if skipped:
        lines.append(f"⏭ Пропущено: <b>{skipped}</b>")
    if remaining and weeks_left is not None:
        lines.append(f"⏳ Осталось: примерно <b>{weeks_left} нед.</b>")
    lines += ["", motivation]

    if user and user.created_at:
        now = datetime.now(timezone.utc)
        created = user.created_at.replace(tzinfo=timezone.utc) if user.created_at.tzinfo is None else user.created_at
        days = max(1, (now - created).days + 1)
        streak_emoji = "🔥" if days >= 3 else "📅"
        lines.append(f"\n{streak_emoji} Обучаешься уже <b>{days} {_days_word(days)}</b>!")

    return "\n".join(lines)


def _days_word(n: int) -> str:
    if 11 <= n % 100 <= 19:
        return "дней"
    r = n % 10
    if r == 1:
        return "день"
    if 2 <= r <= 4:
        return "дня"
    return "дней"
