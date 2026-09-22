from __future__ import annotations

import os

from fastapi import FastAPI, Header, HTTPException, Request
from loguru import logger

from bot.config import settings
from bot.db.database import async_session_factory, init_db
from bot.db.repository import UserRepository
from bot.max_handlers import callback, process_text
from bot.max_models import MaxCallback, MaxMessage, MaxUser

app = FastAPI(title="Progressors Learning MAX")


@app.on_event("startup")
async def startup() -> None:
    os.makedirs("data", exist_ok=True)
    await init_db()
    logger.info("MAX bot started")


@app.get("/health")
async def health() -> dict[str, bool]:
    return {"ok": True}


def _user(data: dict | None) -> MaxUser | None:
    if not data:
        return None
    user_id = data.get("user_id") or data.get("id")
    if user_id is None:
        return None
    return MaxUser(int(user_id), data.get("username"), data.get("first_name") or data.get("name"))


def _message(raw: dict | None, user: MaxUser | None = None) -> MaxMessage | None:
    if not raw:
        return None
    sender = _user(raw.get("sender")) or user
    if sender is None:
        return None
    body = raw.get("body") or {}
    text = body.get("text")
    mid = body.get("mid")
    return MaxMessage(sender, text, str(mid) if mid else None, raw)


@app.post("/webhook")
async def webhook(
    request: Request,
    x_max_bot_api_secret: str | None = Header(default=None, alias="X-Max-Bot-Api-Secret"),
):
    if settings.MAX_WEBHOOK_SECRET and x_max_bot_api_secret != settings.MAX_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="invalid webhook secret")

    update = await request.json()
    update_type = update.get("update_type")

    # MAX sends one Update object per webhook request.
    if update_type == "message_callback":
        callback_data = update.get("callback") or {}
        user = _user(callback_data.get("user"))
        message = _message(update.get("message"), user)
        if user and message:
            async with async_session_factory() as session:
                try:
                    await UserRepository(session).get_or_create(user.id, user.username, user.first_name)
                    await callback(
                        MaxCallback(
                            user=user,
                            payload=callback_data.get("payload") or "",
                            callback_id=callback_data.get("callback_id"),
                            message=message,
                        ),
                        session,
                    )
                except Exception:
                    logger.exception("MAX callback processing failed")
        return {"ok": True}

    if update_type in {"message_created", "bot_started"}:
        if update_type == "message_created":
            message = _message(update.get("message"))
            user = message.user if message else None
        else:
            user = _user(update.get("user"))
            message = None

        if user:
            async with async_session_factory() as session:
                try:
                    await UserRepository(session).get_or_create(user.id, user.username, user.first_name)
                    if update_type == "bot_started":
                        # bot_started is the MAX equivalent of the first /start action.
                        await process_text(MaxMessage(user, "/start", None, update), session)
                    elif message and message.text is not None:
                        await process_text(message, session)
                except Exception:
                    logger.exception("MAX message processing failed")
        return {"ok": True}

    return {"ok": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("bot.main:app", host="0.0.0.0", port=8000)
