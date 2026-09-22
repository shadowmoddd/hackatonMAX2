from __future__ import annotations
from collections import defaultdict
import asyncio

class StateStore:
    def __init__(self):
        self._states = {}
        self._data = defaultdict(dict)
        self._lock = asyncio.Lock()
    async def get_state(self, user_id): return self._states.get(user_id)
    async def set_state(self, user_id, state): self._states[user_id]=state
    async def update(self, user_id, **data): self._data[user_id].update(data)
    async def get_data(self, user_id): return dict(self._data[user_id])
    async def clear(self, user_id): self._states.pop(user_id,None); self._data.pop(user_id,None)

state_store = StateStore()
