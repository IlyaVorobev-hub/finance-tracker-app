import uuid
from decimal import Decimal

from sqlalchemy import CheckConstraint, Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Student(TimestampMixin, Base):
    __tablename__ = "students"
    __table_args__ = (
        CheckConstraint("lesson_price >= 0", name="ck_student_lesson_price_non_negative"),
        Index("idx_student_tutor", "tutor_id"),
        Index("idx_student_tutor_status", "tutor_id", "status"),
    )

    tutor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(20))
    subject: Mapped[str] = mapped_column(String(100), nullable=False)
    lesson_price: Mapped[Decimal] = mapped_column(nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        Enum("active", "paused", "finished", name="student_status"),
        nullable=False,
        server_default="active",
    )

    tutor: Mapped["User"] = relationship("User", back_populates="students", foreign_keys=[tutor_id])
    lessons: Mapped[list["Lesson"]] = relationship("Lesson", back_populates="student")
    homeworks: Mapped[list["Homework"]] = relationship("Homework", back_populates="student")
