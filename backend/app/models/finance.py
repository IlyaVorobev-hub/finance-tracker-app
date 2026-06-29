import datetime
import uuid
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Enum,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class FinanceCategory(TimestampMixin, Base):
    __tablename__ = "finance_categories"
    __table_args__ = (
        CheckConstraint(
            "(is_system = true AND user_id IS NULL) OR (is_system = false AND user_id IS NOT NULL)",
            name="ck_financecategory_system_user",
        ),
        Index("idx_financecategory_user_type", "user_id", "type"),
        Index("idx_financecategory_system", "is_system"),
    )

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(
        Enum("income", "expense", name="finance_type"), nullable=False
    )
    is_system: Mapped[bool] = mapped_column(nullable=False, server_default="false")
    is_active: Mapped[bool] = mapped_column(nullable=False, server_default="true")
    sort_order: Mapped[int] = mapped_column(nullable=False, server_default="0")

    user: Mapped["User | None"] = relationship("User", back_populates="finance_categories")
    transactions: Mapped[list["FinanceTransaction"]] = relationship(
        "FinanceTransaction", back_populates="category"
    )


class FinanceTransaction(TimestampMixin, Base):
    __tablename__ = "finance_transactions"
    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_financetransaction_amount_positive"),
        Index("idx_financetransaction_user_date", "user_id", "date"),
        Index("idx_financetransaction_user_type", "user_id", "type"),
        Index("idx_financetransaction_category", "category_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("finance_categories.id", ondelete="RESTRICT"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(nullable=False)
    type: Mapped[str] = mapped_column(
        Enum("income", "expense", name="finance_type"), nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text)
    date: Mapped[datetime.date] = mapped_column(server_default="CURRENT_DATE")

    user: Mapped["User"] = relationship("User", back_populates="finance_transactions")
    category: Mapped["FinanceCategory"] = relationship(
        "FinanceCategory", back_populates="transactions"
    )
