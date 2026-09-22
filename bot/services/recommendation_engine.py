import json
import re
from pathlib import Path

from loguru import logger

from bot.config import settings
from bot.db.models import UserProfile

_LEVEL_ORDER = ["beginner", "elementary", "intermediate", "advanced"]

MAX_TOPICS_SCORE = 25


def level_gap(level_a: str, level_b: str) -> int:
    try:
        return abs(_LEVEL_ORDER.index(level_a) - _LEVEL_ORDER.index(level_b))
    except ValueError:
        return 3


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"[а-яёa-z]{3,}", text.lower()))


class RecommendationEngine:
    def __init__(self, db_path: str):
        self.resources: list[dict] = []
        self._load(db_path)

    def _load(self, path: str) -> None:
        try:
            p = Path(path)
            if p.exists():
                with p.open(encoding="utf-8") as f:
                    data = json.load(f)
                self.resources = data.get("resources", [])
                logger.info(f"[RecEngine] Loaded {len(self.resources)} resources from DB")
            else:
                logger.warning(f"[RecEngine] Resources DB not found at {path}")
        except Exception as e:
            logger.error(f"[RecEngine] Failed to load resources DB: {e}")

    def score_resource(
        self,
        resource: dict,
        sphere: str,
        specialization: str | None,
        level: str,
        step_topics: list[str],
        preferred_formats: list[str],
    ) -> int:
        score = 0

        if preferred_formats and resource.get("type") not in preferred_formats:
            return -1

        res_spheres = resource.get("sphere", [])
        if sphere in res_spheres:
            score += 40
        elif not res_spheres:
            score += 5

        res_specs = resource.get("specializations", [])
        if specialization and specialization in res_specs:
            score += 25
        elif res_specs and specialization:
            score += 0
        elif not res_specs:
            score += 5

        res_levels = resource.get("levels", [])
        best_level_score = 0
        for rl in res_levels:
            dist = level_gap(level, rl)
            if dist == 0:
                best_level_score = 30
                break
            elif dist == 1:
                best_level_score = max(best_level_score, 15)
        score += best_level_score

        res_topics = _tokenize(" ".join(resource.get("topics", [])))
        step_words = set()
        for t in step_topics:
            if isinstance(t, str):
                step_words.update(_tokenize(t))

        overlap = len(res_topics & step_words)
        score += min(MAX_TOPICS_SCORE, overlap * 5)

        return score

    def find_matching_resources(
        self,
        profile: UserProfile,
        step_topics: list[str],
        limit: int = 2,
    ) -> list[dict]:
        sphere = profile.sphere or "other"
        spec = profile.specialization
        level = profile.level or "beginner"
        formats = profile.get_preferred_formats() or ["video", "course", "article", "lecture"]

        scored = []
        for resource in self.resources:
            s = self.score_resource(resource, sphere, spec, level, step_topics, formats)
            if s > 0:
                scored.append((s, resource))

        scored.sort(key=lambda x: x[0], reverse=True)

        seen_titles: set[str] = set()
        result = []
        for _, r in scored:
            title_key = r.get("title", "").lower()[:40]
            if title_key not in seen_titles:
                seen_titles.add(title_key)
                result.append(r)
            if len(result) >= limit:
                break

        return result

    def resource_to_material(self, resource: dict) -> dict:
        return {
            "title": resource.get("title", ""),
            "url": "#",
            "type": resource.get("type", "video"),
            "platform": resource.get("platform", "YouTube"),
            "duration": resource.get("duration", ""),
            "difficulty": resource.get("difficulty", "beginner"),
            "why_this": resource.get("why_template", ""),
            "_search_query": resource.get("search_query", ""),
            "_from_db": True,
        }


_engine_singleton: RecommendationEngine | None = None


def get_recommendation_engine() -> RecommendationEngine:
    global _engine_singleton
    if _engine_singleton is None:
        _engine_singleton = RecommendationEngine(settings.RESOURCES_DB_PATH)
    return _engine_singleton
