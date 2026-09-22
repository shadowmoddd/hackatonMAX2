import enum
import json
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    BigInteger, Boolean, DateTime, ForeignKey, Integer, String, Text, func
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class StepStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class RoadmapStatus(str, enum.Enum):
    ACTIVE = "active"
    ABANDONED = "abandoned"


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    platform_user_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    username: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    first_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    last_active_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    profile: Mapped[Optional["UserProfile"]] = relationship(back_populates="user", uselist=False)
    roadmaps: Mapped[list["Roadmap"]] = relationship(back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    goal: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sphere: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    specialization: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    time_per_week: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    total_hours: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    preferred_formats: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    goal_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    learn_style: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    raw_answers: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="profile")

    def get_preferred_formats(self) -> list[str]:
        if self.preferred_formats:
            return json.loads(self.preferred_formats)
        return []

    def set_preferred_formats(self, formats: list[str]) -> None:
        self.preferred_formats = json.dumps(formats, ensure_ascii=False)


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    total_steps: Mapped[int] = mapped_column(Integer, default=0)
    estimated_weeks: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default=RoadmapStatus.ACTIVE)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="roadmaps")
    steps: Mapped[list["RoadmapStep"]] = relationship(back_populates="roadmap", order_by="RoadmapStep.order_num")


class RoadmapStep(Base):
    __tablename__ = "roadmap_steps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    roadmap_id: Mapped[int] = mapped_column(Integer, ForeignKey("roadmaps.id"), nullable=False)
    order_num: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    why: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    skills_gained: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    career_relevance: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    materials: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default=StepStatus.PENDING)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    roadmap: Mapped["Roadmap"] = relationship(back_populates="steps")

    def get_skills(self) -> list[str]:
        if self.skills_gained:
            return json.loads(self.skills_gained)
        return []

    def get_materials(self) -> list[dict]:
        if self.materials:
            return json.loads(self.materials)
        return []

    def get_feedback(self) -> dict:
        if self.feedback:
            return json.loads(self.feedback)
        return {}
