"""initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-06-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ENUM types
    user_role = sa.Enum("super_admin", "admin", "tutor", "student", name="user_role")
    user_role.create(op.get_bind(), checkfirst=True)

    finance_type = sa.Enum("income", "expense", name="finance_type")
    finance_type.create(op.get_bind(), checkfirst=True)

    student_status = sa.Enum("active", "paused", "finished", name="student_status")
    student_status.create(op.get_bind(), checkfirst=True)

    lesson_status = sa.Enum("scheduled", "completed", "cancelled", name="lesson_status")
    lesson_status.create(op.get_bind(), checkfirst=True)

    payment_status = sa.Enum("paid", "unpaid", name="payment_status")
    payment_status.create(op.get_bind(), checkfirst=True)

    recurrence_type = sa.Enum("daily", "weekly", "biweekly", "monthly", name="recurrence_type")
    recurrence_type.create(op.get_bind(), checkfirst=True)

    homework_type = sa.Enum("text", "file", "mixed", name="homework_type")
    homework_type.create(op.get_bind(), checkfirst=True)

    homework_status = sa.Enum("pending", "submitted", "graded", "archived", name="homework_status")
    homework_status.create(op.get_bind(), checkfirst=True)

    # users
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", user_role, nullable=False, server_default="tutor"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("idx_user_email", "users", ["email"])
    op.create_index("idx_user_role", "users", ["role"])

    # user_profiles
    op.create_table(
        "user_profiles",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("phone", sa.String(20)),
        sa.Column("avatar_url", sa.String(500)),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # finance_categories
    op.create_table(
        "finance_categories",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
        ),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("type", finance_type, nullable=False),
        sa.Column("is_system", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.CheckConstraint(
            "(is_system = true AND user_id IS NULL) OR (is_system = false AND user_id IS NOT NULL)",
            name="ck_financecategory_system_user",
        ),
    )
    op.create_index("idx_financecategory_user_type", "finance_categories", ["user_id", "type"])
    op.create_index("idx_financecategory_system", "finance_categories", ["is_system"])

    # finance_transactions
    op.create_table(
        "finance_transactions",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "category_id",
            sa.Uuid(),
            sa.ForeignKey("finance_categories.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("type", finance_type, nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("date", sa.Date(), server_default=sa.func.current_date()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.CheckConstraint("amount > 0", name="ck_financetransaction_amount_positive"),
    )
    op.create_index(
        "idx_financetransaction_user_date", "finance_transactions", ["user_id", "date"]
    )
    op.create_index(
        "idx_financetransaction_user_type", "finance_transactions", ["user_id", "type"]
    )
    op.create_index(
        "idx_financetransaction_category", "finance_transactions", ["category_id"]
    )

    # students
    op.create_table(
        "students",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "tutor_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255)),
        sa.Column("phone", sa.String(20)),
        sa.Column("subject", sa.String(100), nullable=False),
        sa.Column("lesson_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("notes", sa.Text()),
        sa.Column("status", student_status, nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.CheckConstraint("lesson_price >= 0", name="ck_student_lesson_price_non_negative"),
    )
    op.create_index("idx_student_tutor", "students", ["tutor_id"])
    op.create_index("idx_student_tutor_status", "students", ["tutor_id", "status"])

    # lessons
    op.create_table(
        "lessons",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "student_id",
            sa.Uuid(),
            sa.ForeignKey("students.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "tutor_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("comment", sa.Text()),
        sa.Column("status", lesson_status, nullable=False, server_default="scheduled"),
        sa.Column("payment_status", payment_status, nullable=False, server_default="unpaid"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.CheckConstraint("end_time > start_time", name="ck_lesson_end_after_start"),
        sa.CheckConstraint("price >= 0", name="ck_lesson_price_non_negative"),
    )
    op.create_index("idx_lesson_tutor_date", "lessons", ["tutor_id", "date"])
    op.create_index("idx_lesson_student", "lessons", ["student_id"])
    op.create_index("idx_lesson_status", "lessons", ["status"])
    op.create_index("idx_lesson_payment", "lessons", ["payment_status"])

    # lesson_recurrences
    op.create_table(
        "lesson_recurrences",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "lesson_id",
            sa.Uuid(),
            sa.ForeignKey("lessons.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("recurrence_type", recurrence_type, nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("total_occurrences", sa.Integer(), nullable=False),
        sa.Column("current_occurrence", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.CheckConstraint("total_occurrences > 0", name="ck_lessonrecurrence_total_positive"),
    )

    # homeworks
    op.create_table(
        "homeworks",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "student_id",
            sa.Uuid(),
            sa.ForeignKey("students.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "tutor_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("type", homework_type, nullable=False, server_default="text"),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("status", homework_status, nullable=False, server_default="pending"),
        sa.Column("grade", sa.Text()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("idx_homework_student", "homeworks", ["student_id"])
    op.create_index("idx_homework_tutor", "homeworks", ["tutor_id"])
    op.create_index("idx_homework_status", "homeworks", ["status"])
    op.create_index("idx_homework_due", "homeworks", ["due_date"])

    # homework_files
    op.create_table(
        "homework_files",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "homework_id",
            sa.Uuid(),
            sa.ForeignKey("homeworks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("file_url", sa.String(500), nullable=False),
        sa.Column("file_name", sa.String(255), nullable=False),
        sa.Column("file_type", sa.String(50), nullable=False),
        sa.Column("file_size", sa.BigInteger(), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("file_size > 0", name="ck_homeworkfile_size_positive"),
    )
    op.create_index("idx_homeworkfile_homework", "homework_files", ["homework_id"])

    # audit_logs
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", sa.Uuid()),
        sa.Column("details", sa.JSON()),
        sa.Column("ip_address", sa.String(45)),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_auditlog_user", "audit_logs", ["user_id"])
    op.create_index("idx_auditlog_entity", "audit_logs", ["entity_type", "entity_id"])
    op.create_index("idx_auditlog_created", "audit_logs", ["created_at"])
    op.create_index("idx_auditlog_action", "audit_logs", ["action"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("homework_files")
    op.drop_table("homeworks")
    op.drop_table("lesson_recurrences")
    op.drop_table("lessons")
    op.drop_table("students")
    op.drop_table("finance_transactions")
    op.drop_table("finance_categories")
    op.drop_table("user_profiles")
    op.drop_table("users")

    sa.Enum(name="homework_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="homework_type").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="recurrence_type").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="payment_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="lesson_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="student_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="finance_type").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="user_role").drop(op.get_bind(), checkfirst=True)
