import uuid
from datetime import date, datetime

from sqlalchemy import BigInteger, CheckConstraint, Enum, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Homework(TimestampMixin, Base):
    __tablename__ = "homeworks"
    __table_args__ = (
        Index("idx_homework_student", "student_id"),
        Index("idx_homework_tutor", "tutor_id"),
        Index("idx_homework_status", "status"),
        Index("idx_homework_due", "due_date"),
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    tutor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    type: Mapped[str] = mapped_column(
        Enum("text", "file", "mixed", name="homework_type"),
        nullable=False,
        server_default="text",
    )
    due_date: Mapped[date] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("pending", "submitted", "graded", "archived", name="homework_status"),
        nullable=False,
        server_default="pending",
    )
    grade: Mapped[str | None] = mapped_column(Text)

    student: Mapped["Student"] = relationship("Student", back_populates="homeworks")
    tutor: Mapped["User"] = relationship(
        "User", back_populates="homeworks_as_tutor", foreign_keys=[tutor_id]
    )
    files: Mapped[list["HomeworkFile"]] = relationship(
        "HomeworkFile", back_populates="homework", cascade="all, delete-orphan"
    )


class HomeworkFile(Base):
    __tablename__ = "homework_files"
    __table_args__ = (
        CheckConstraint("file_size > 0", name="ck_homeworkfile_size_positive"),
        Index("idx_homeworkfile_homework", "homework_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    homework_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("homeworks.id", ondelete="CASCADE"), nullable=False
    )
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())

    homework: Mapped["Homework"] = relationship("Homework", back_populates="files")
