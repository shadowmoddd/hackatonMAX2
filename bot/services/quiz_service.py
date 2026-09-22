from loguru import logger

from bot.services.ai_service import get_ai_service


async def generate_quiz(goal: str) -> list[dict]:
    ai = get_ai_service()
    try:
        return await ai.generate_quiz(goal)
    except Exception as e:
        logger.error(f"[Quiz] Generation failed: {e}")
        return []


async def evaluate_quiz(goal: str, qa_pairs: list[dict]) -> dict:
    ai = get_ai_service()
    try:
        return await ai.evaluate_quiz(goal, qa_pairs)
    except Exception as e:
        logger.error(f"[Quiz] Evaluation failed: {e}")
        return {"level": "beginner", "sphere": "other", "specialization": "none", "learning_gaps": [], "strong_points": []}
