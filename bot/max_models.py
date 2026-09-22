from dataclasses import dataclass, field
from typing import Any

@dataclass
class MaxUser:
    id: int
    username: str | None = None
    first_name: str | None = None

@dataclass
class MaxMessage:
    user: MaxUser
    text: str | None
    message_id: str | None = None
    raw: dict[str, Any] = field(default_factory=dict)

@dataclass
class MaxCallback:
    user: MaxUser
    payload: str
    callback_id: str | None
    message: MaxMessage
