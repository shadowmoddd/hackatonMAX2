from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from bot.config import settings
from bot.db.models import Base
engine=create_async_engine(settings.DATABASE_URL,echo=settings.DEBUG)
async_session_factory=async_sessionmaker(engine,expire_on_commit=False)
async def init_db():
    async with engine.begin() as conn: await conn.run_sync(Base.metadata.create_all)
