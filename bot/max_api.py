from __future__ import annotations

from typing import Any

import httpx

from bot.config import settings


class MaxAPIError(RuntimeError):
    pass


class MaxAPI:
    def __init__(self) -> None:
        self.base = settings.MAX_API_BASE.rstrip("/")
        self.token = settings.BOT_TOKEN

    def _headers(self) -> dict[str, str]:
        return {"Authorization": self.token, "Content-Type": "application/json"}

    async def request(
        self,
        method: str,
        path: str,
        *,
        json: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.request(
                method,
                f"{self.base}{path}",
                headers=self._headers(),
                json=json,
                params=params,
            )
        if response.is_error:
            raise MaxAPIError(f"MAX API {response.status_code}: {response.text}")
        return response.json() if response.content else {}

    async def send_message(
        self,
        user_id: int,
        text: str,
        buttons: list[list[dict[str, Any]]] | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {"text": text}
        if buttons:
            payload["attachments"] = [
                {"type": "inline_keyboard", "payload": {"buttons": buttons}}
            ]
        return await self.request("POST", "/messages", params={"user_id": user_id}, json=payload)

    async def answer_callback(
        self,
        callback_id: str,
        notification: str | None = None,
        message: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {}
        if notification:
            payload["notification"] = notification
        if message is not None:
            payload["message"] = message
        return await self.request("POST", "/answers", params={"callback_id": callback_id}, json=payload)


max_api = MaxAPI()
