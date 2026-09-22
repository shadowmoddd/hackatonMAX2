import asyncio
import json
import re
from pathlib import Path

from groq import AsyncGroq
from loguru import logger

from bot.config import settings
from bot.db.models import Roadmap, RoadmapStep, UserProfile

PROMPTS_DIR = Path(__file__).parent.parent.parent / "prompts"
_REQUEST_TIMEOUT = 60.0
_MAX_RETRIES = 3


def _load_prompt(filename: str) -> str:
    return (PROMPTS_DIR / filename).read_text(encoding="utf-8")


def _extract_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        return json.loads(m.group())
    return json.loads(text)


class AIService:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL

    async def _generate(self, system: str, user: str, max_tokens: int = 3500) -> str:
        last_error: Exception | None = None
        for attempt in range(1, _MAX_RETRIES + 1):
            try:
                response = await asyncio.wait_for(
                    self.client.chat.completions.create(
                        model=self.model,
                        messages=[
                            {"role": "system", "content": system},
                            {"role": "user", "content": user},
                        ],
                        max_tokens=max_tokens,
                        temperature=0.7,
                    ),
                    timeout=_REQUEST_TIMEOUT,
                )
                return response.choices[0].message.content or ""
            except asyncio.TimeoutError:
                logger.warning(f"[AI] Timeout attempt {attempt}/{_MAX_RETRIES}")
                last_error = asyncio.TimeoutError()
                if attempt < _MAX_RETRIES:
                    await asyncio.sleep(2)
            except Exception as e:
                err_str = str(e)
                is_retryable = "429" in err_str or "503" in err_str or "rate" in err_str.lower()
                if is_retryable and attempt < _MAX_RETRIES:
                    wait = 3 * attempt
                    logger.warning(f"[AI] {err_str[:80]} — retry {attempt}/{_MAX_RETRIES} in {wait}s")
                    last_error = e
                    await asyncio.sleep(wait)
                else:
                    logger.error(f"[AI] Error: {e}")
                    raise
        raise last_error or RuntimeError("Groq API failed after retries")

    def _build_profile_context(self, profile: UserProfile) -> str:
        from bot.services.profile_service import LEARN_STYLE_VALUES, TOTAL_HOURS_VALUES, TIME_LABELS
        formats = profile.get_preferred_formats()
        raw = json.loads(profile.raw_answers or "{}") if profile.raw_answers else {}
        gaps = raw.get("learning_gaps", [])
        strengths = raw.get("strong_points", [])

        lines = [
            f"Цель: {profile.goal}",
            f"Уровень: {profile.level} | Сфера: {profile.sphere}" +
            (f" | Специализация: {profile.specialization}" if profile.specialization else ""),
            f"Время: {TIME_LABELS.get(profile.time_per_week or '', '?')}, "
            f"бюджет: {TOTAL_HOURS_VALUES.get(profile.total_hours or '', 'не указан')}",
            f"Форматы: {', '.join(formats) if formats else 'любые'}",
            f"Стиль: {LEARN_STYLE_VALUES.get(profile.learn_style or '', 'не указан')}",
        ]
        if gaps:
            lines.append(f"Пробелы знаний: {'; '.join(gaps)}")
        if strengths:
            lines.append(f"Уже знает: {'; '.join(strengths)}")
        return "\n".join(lines)

    async def generate_roadmap(self, profile: UserProfile) -> dict:
        system_prompt = _load_prompt("roadmap_generator.txt")
        user_message = f"ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:\n{self._build_profile_context(profile)}"
        try:
            raw_text = await self._generate(system_prompt, user_message)
            logger.info(f"[AI] Raw: {len(raw_text)} chars")
            result = _extract_json(raw_text)
            logger.info(f"[AI] Roadmap: '{result.get('title')}' {len(result.get('steps', []))} steps")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"[AI] JSON parse error: {e}")
            raise
        except Exception as e:
            logger.error(f"[AI] generate_roadmap error: {e}")
            raise

    async def adjust_roadmap(
        self, roadmap: Roadmap, steps: list[RoadmapStep], feedback_text: str, adjustment_type: str
    ) -> dict:
        system_prompt = _load_prompt("feedback_processor.txt")
        completed = [s.title for s in steps if s.status == "completed"]
        steps_data = [
            {"order": s.order_num, "title": s.title, "why": s.why,
             "skills": s.get_skills(), "career_relevance": s.career_relevance,
             "materials": s.get_materials(), "status": s.status}
            for s in steps
        ]
        user_message = (
            f"Маршрут:\n{json.dumps({'title': roadmap.title, 'description': roadmap.description, 'estimated_weeks': roadmap.estimated_weeks, 'steps': steps_data}, ensure_ascii=False)}\n\n"
            f"Тип: {adjustment_type}\nПричина: {feedback_text}\n"
            f"Завершены (не трогать): {completed if completed else 'нет'}"
        )
        try:
            raw_text = await self._generate(system_prompt, user_message, max_tokens=3000)
            result = _extract_json(raw_text)
            logger.info(f"[AI] Adjusted: {adjustment_type}")
            return result
        except Exception as e:
            logger.error(f"[AI] adjust_roadmap error: {e}")
            raise

    async def suggest_alternative_step(self, step: RoadmapStep, reason: str, profile: UserProfile) -> dict:
        system_prompt = _load_prompt("feedback_processor.txt")
        user_message = (
            f"Замени шаг на альтернативный.\n"
            f"Шаг: {step.title}\nНавыки: {step.get_skills()}\nПричина: {reason}\n"
            f"Профиль: уровень={profile.level}, сфера={profile.sphere}, форматы={profile.get_preferred_formats()}\n\n"
            f"Верни JSON: {{\"order\":{step.order_num},\"title\":\"...\",\"why\":\"...\",\"skills\":[...],\"career_relevance\":\"...\",\"materials\":[...]}}"
        )
        try:
            raw_text = await self._generate(system_prompt, user_message, max_tokens=1500)
            return _extract_json(raw_text)
        except Exception as e:
            logger.error(f"[AI] suggest_alternative_step error: {e}")
            raise

    async def refill_step_materials(
        self, order_num: int, title: str, skills: list[str], reason: str, profile: UserProfile
    ) -> dict:
        formats = profile.get_preferred_formats()
        user_message = (
            f"Подбери 2-3 материала для шага «{title}».\n"
            f"Навыки: {', '.join(skills)}\nФорматы: {', '.join(formats) if formats else 'любые'}\n"
            f"Уровень: {profile.level}\nПричина: {reason}\n\n"
            f"Только бесплатные русскоязычные. Верни JSON: {{\"materials\":[{{\"title\":\"...\",\"url\":\"#\",\"type\":\"...\",\"platform\":\"...\",\"duration\":\"...\",\"difficulty\":\"...\",\"why_this\":\"...\"}}]}}"
        )
        try:
            raw_text = await self._generate(
                "Ты образовательный советник. Только JSON.", user_message, max_tokens=800
            )
            return _extract_json(raw_text)
        except Exception as e:
            logger.error(f"[AI] refill error: {e}")
            raise

    async def generate_quiz(self, goal: str) -> list[dict]:
        user_message = (
            f"Цель: «{goal}». Создай 3 диагностических вопроса.\n"
            f"Вопрос 1: базовый, 2: средний, 3: продвинутый. Открытые, не да/нет.\n"
            f"Верни JSON: {{\"questions\":[{{\"q\":\"...\",\"hints\":[\"слово1\",\"слово2\"]}}]}}"
        )
        try:
            raw = await self._generate(
                "Ты педагог. Создаёшь диагностические тесты. Только JSON.", user_message, max_tokens=500
            )
            data = _extract_json(raw)
            return data.get("questions", [])[:3]
        except Exception as e:
            logger.error(f"[AI] generate_quiz error: {e}")
            return []

    async def evaluate_quiz(self, goal: str, qa_pairs: list[dict]) -> dict:
        qa = "\n".join(f"В: {p['q']}\nО: {p['a']} ({'верно' if p.get('correct') else 'неполно'})" for p in qa_pairs)
        user_message = (
            f"Цель: «{goal}»\n{qa}\n\n"
            f"Определи: level(beginner/elementary/intermediate/advanced), sphere(it/design/video_photo/other), "
            f"specialization(backend/frontend/ml/devops/ux/graphic/webdesign/none), "
            f"learning_gaps(список пробелов), strong_points(что знает).\n"
            f"Только JSON: {{\"level\":\"...\",\"sphere\":\"...\",\"specialization\":\"...\",\"learning_gaps\":[...],\"strong_points\":[...]}}"
        )
        try:
            raw = await self._generate(
                "Ты эксперт по оценке знаний. Только JSON.", user_message, max_tokens=250
            )
            return _extract_json(raw)
        except Exception as e:
            logger.error(f"[AI] evaluate_quiz error: {e}")
            return {"level": "beginner", "sphere": "other", "specialization": "none",
                    "learning_gaps": [], "strong_points": []}


_ai_singleton: AIService | None = None


def get_ai_service() -> AIService:
    global _ai_singleton
    if _ai_singleton is None:
        _ai_singleton = AIService()
    return _ai_singleton
