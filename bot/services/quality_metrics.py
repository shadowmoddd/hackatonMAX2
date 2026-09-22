import re

from bot.db.models import UserProfile

_LEVEL_MATCH = {
    "beginner":     {"beginner", "elementary"},
    "elementary":   {"beginner", "elementary", "intermediate"},
    "intermediate": {"intermediate", "beginner", "elementary"},
    "advanced":     {"advanced", "intermediate"},
}


def _tokens(text: str) -> set[str]:
    return set(re.findall(r"[а-яёa-z]{3,}", text.lower()))


def score_material(material: dict, profile: UserProfile) -> int:
    title = material.get("title", "")
    why_this = material.get("why_this", "")
    material_tokens = _tokens(f"{title} {why_this}")

    goal_tokens = _tokens(profile.goal or "")
    sphere_tokens = _tokens(profile.sphere or "")
    profile_tokens = goal_tokens | sphere_tokens

    if profile_tokens and material_tokens:
        overlap = len(profile_tokens & material_tokens) / len(profile_tokens)
        base = int(overlap * 50)
    else:
        base = 50

    level_bonus = 20 if material.get("difficulty", "") in _LEVEL_MATCH.get(profile.level or "", set()) else 0
    preferred = set(profile.get_preferred_formats())
    format_bonus = 30 if material.get("type", "") in preferred else 0

    return min(100, base + level_bonus + format_bonus)


def score_label(score: int) -> str:
    if score >= 80:
        return "🎯 Отлично подходит"
    if score >= 60:
        return "✅ Хорошо подходит"
    if score >= 40:
        return "👍 Подходит"
    return "💡 Может быть полезно"


def annotate_roadmap(roadmap_data: dict, profile: UserProfile) -> dict:
    for step in roadmap_data.get("steps", []):
        for material in step.get("materials", []):
            material["_score"] = score_material(material, profile)
    return roadmap_data
