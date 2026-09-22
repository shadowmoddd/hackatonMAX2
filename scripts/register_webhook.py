from __future__ import annotations

import asyncio

import httpx

from bot.config import settings


async def main() -> None:
    if not settings.MAX_WEBHOOK_URL:
        raise SystemExit("MAX_WEBHOOK_URL is empty. Set the public HTTPS /webhook URL in .env")
    if not settings.MAX_WEBHOOK_SECRET:
        raise SystemExit("MAX_WEBHOOK_SECRET is empty. Set a 5-256 character secret in .env")

    payload = {
        "url": settings.MAX_WEBHOOK_URL,
        "update_types": ["message_created", "message_callback", "bot_started"],
        "secret": settings.MAX_WEBHOOK_SECRET,
    }
    headers = {"Authorization": settings.BOT_TOKEN, "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{settings.MAX_API_BASE.rstrip('/')}/subscriptions",
            headers=headers,
            json=payload,
        )
    response.raise_for_status()
    print(response.json())


if __name__ == "__main__":
    asyncio.run(main())
