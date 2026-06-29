import datetime
import uuid
from decimal import Decimal

from sqlalchemy import CheckConstraint, Enum, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Lesson(TimestampMixin, Base):
    __tablename__ = "lessons"
    __table_args__ = (
        CheckConstraint("end_time > start_time", name="ck_lesson_end_after_start"),
        CheckConstraint("price >= 0", name="ck_lesson_price_non_negative"),
        Index("idx_lesson_tutor_date", "tutor_id", "date"),
        Index("idx_lesson_student", "student_id"),
        Index("idx_lesson_status", "status"),
        Index("idx_lesson_payment", "payment_status"),
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    tutor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[datetime.date] = mapped_column(nullable=False)
    start_time: Mapped[datetime.time] = mapped_column(nullable=False)
    end_time: Mapped[datetime.time] = mapped_column(nullable=False)
    price: Mapped[Decimal] = mapped_column(nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        Enum("scheduled", "completed", "cancelled", name="lesson_status"),
        nullable=False,
        server_default="scheduled",
    )
    payment_status: Mapped[str] = mapped_column(
        Enum("paid", "unpaid", name="payment_status"),
        nullable=False,
        server_default="unpaid",
    )

    student: Mapped["Student"] = relationship("Student", back_populates="lessons")
    tutor: Mapped["User"] = relationship(
        "User", back_populates="lessons_as_tutor", foreign_keys=[tutor_id]
    )
    recurrence: Mapped["LessonRecurrence | None"] = relationship(
        "LessonRecurrence", back_populates="lesson", uselist=False, cascade="all, delete-orphan"
    )


class LessonRecurrence(TimestampMixin, Base):
    __tablename__ = "lesson_recurrences"
    __table_args__ = (
        CheckConstraint("total_occurrences > 0", name="ck_lessonrecurrence_total_positive"),
    )

    lesson_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    recurrence_type: Mapped[str] = mapped_column(
        Enum("daily", "weekly", "biweekly", "monthly", name="recurrence_type"),
        nullable=False,
    )
    end_date: Mapped[datetime.date] = mapped_column(nullable=False)
    total_occurrences: Mapped[int] = mapped_column(nullable=False)
    current_occurrence: Mapped[int] = mapped_column(nullable=False, server_default="1")

    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="recurrence")
