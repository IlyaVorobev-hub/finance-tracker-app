import uuid

from sqlalchemy import Enum, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        Enum("super_admin", "admin", "tutor", "student", name="user_role"),
        nullable=False,
        server_default="tutor",
    )
    is_active: Mapped[bool] = mapped_column(nullable=False, server_default="true")

    profile: Mapped["UserProfile | None"] = relationship(
        "UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    finance_categories: Mapped[list["FinanceCategory"]] = relationship(
        "FinanceCategory", back_populates="user"
    )
    finance_transactions: Mapped[list["FinanceTransaction"]] = relationship(
        "FinanceTransaction", back_populates="user"
    )
    students: Mapped[list["Student"]] = relationship(
        "Student", back_populates="tutor", foreign_keys="Student.tutor_id"
    )
    lessons_as_tutor: Mapped[list["Lesson"]] = relationship(
        "Lesson", back_populates="tutor", foreign_keys="Lesson.tutor_id"
    )
    homeworks_as_tutor: Mapped[list["Homework"]] = relationship(
        "Homework", back_populates="tutor", foreign_keys="Homework.tutor_id"
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="user")

    __table_args__ = (
        Index("idx_user_email", "email"),
        Index("idx_user_role", "role"),
    )


class UserProfile(TimestampMixin, Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20))
    avatar_url: Mapped[str | None] = mapped_column(String(500))

    user: Mapped["User"] = relationship("User", back_populates="profile")
