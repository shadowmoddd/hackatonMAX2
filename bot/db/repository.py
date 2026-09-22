import json
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from bot.db.models import Roadmap, RoadmapStep, User, UserProfile


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create(self, platform_user_id: int, username: Optional[str], first_name: Optional[str]) -> User:
        result = await self.session.execute(select(User).where(User.platform_user_id == platform_user_id))
        user = result.scalar_one_or_none()
        if not user:
            user = User(platform_user_id=platform_user_id, username=username, first_name=first_name)
            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)
        return user

    async def get_by_platform_user_id(self, platform_user_id: int) -> Optional[User]:
        result = await self.session.execute(
            select(User).where(User.platform_user_id == platform_user_id).options(selectinload(User.profile))
        )
        return result.scalar_one_or_none()

    async def update_last_active(self, platform_user_id: int) -> None:
        await self.session.execute(
            update(User)
            .where(User.platform_user_id == platform_user_id)
            .values(last_active_at=datetime.now(timezone.utc))
        )
        await self.session.commit()


class ProfileRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_user_id(self, user_id: int) -> Optional[UserProfile]:
        result = await self.session.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        return result.scalar_one_or_none()

    async def upsert(self, user_id: int, data: dict) -> UserProfile:
        profile = await self.get_by_user_id(user_id)
        if profile:
            for key, value in data.items():
                setattr(profile, key, value)
        else:
            profile = UserProfile(user_id=user_id, **data)
            self.session.add(profile)
        await self.session.commit()
        await self.session.refresh(profile)
        return profile


class RoadmapRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, user_id: int, title: str, description: str, total_steps: int, estimated_weeks: int) -> Roadmap:
        roadmap = Roadmap(
            user_id=user_id,
            title=title,
            description=description,
            total_steps=total_steps,
            estimated_weeks=estimated_weeks,
        )
        self.session.add(roadmap)
        await self.session.commit()
        await self.session.refresh(roadmap)
        return roadmap

    async def get_active(self, user_id: int) -> Optional[Roadmap]:
        result = await self.session.execute(
            select(Roadmap)
            .where(Roadmap.user_id == user_id, Roadmap.status == "active")
            .options(selectinload(Roadmap.steps))
            .order_by(Roadmap.created_at.desc())
            .limit(1)
        )
        return result.scalars().first()

    async def get_with_steps(self, roadmap_id: int) -> Optional[Roadmap]:
        result = await self.session.execute(
            select(Roadmap).where(Roadmap.id == roadmap_id).options(selectinload(Roadmap.steps))
        )
        return result.scalar_one_or_none()

    async def abandon_active(self, user_id: int) -> None:
        await self.session.execute(
            update(Roadmap)
            .where(Roadmap.user_id == user_id, Roadmap.status == "active")
            .values(status="abandoned")
        )
        await self.session.commit()


class StepRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, roadmap_id: int, step_data: dict, order_num: int) -> RoadmapStep:
        step = RoadmapStep(
            roadmap_id=roadmap_id,
            order_num=order_num,
            title=step_data.get("title", ""),
            description=step_data.get("description", ""),
            why=step_data.get("why", ""),
            skills_gained=json.dumps(step_data.get("skills", []), ensure_ascii=False),
            career_relevance=step_data.get("career_relevance", ""),
            materials=json.dumps(step_data.get("materials", []), ensure_ascii=False),
        )
        self.session.add(step)
        await self.session.commit()
        await self.session.refresh(step)
        return step

    async def create_bulk(self, roadmap_id: int, steps_data: list[dict]) -> list[RoadmapStep]:
        steps = []
        for i, step_data in enumerate(steps_data, 1):
            step = RoadmapStep(
                roadmap_id=roadmap_id,
                order_num=i,
                title=step_data.get("title", ""),
                description=step_data.get("description", ""),
                why=step_data.get("why", ""),
                skills_gained=json.dumps(step_data.get("skills", []), ensure_ascii=False),
                career_relevance=step_data.get("career_relevance", ""),
                materials=json.dumps(step_data.get("materials", []), ensure_ascii=False),
            )
            self.session.add(step)
            steps.append(step)
        await self.session.commit()
        for step in steps:
            await self.session.refresh(step)
        return steps

    async def get_by_id(self, step_id: int) -> Optional[RoadmapStep]:
        result = await self.session.execute(select(RoadmapStep).where(RoadmapStep.id == step_id))
        return result.scalar_one_or_none()

    async def update_status(self, step_id: int, status: str, feedback_data: Optional[dict] = None) -> None:
        values: dict = {"status": status}
        if feedback_data:
            values["feedback"] = json.dumps(feedback_data, ensure_ascii=False)
        await self.session.execute(update(RoadmapStep).where(RoadmapStep.id == step_id).values(**values))
        await self.session.commit()

    async def get_current_step(self, roadmap_id: int) -> Optional[RoadmapStep]:
        result = await self.session.execute(
            select(RoadmapStep)
            .where(RoadmapStep.roadmap_id == roadmap_id, RoadmapStep.status.in_(["pending", "in_progress"]))
            .order_by(RoadmapStep.order_num)
        )
        return result.scalars().first()
