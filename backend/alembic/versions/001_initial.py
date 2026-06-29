"""initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-06-13

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    conn = op.get_bind()

    enums = {
        "user_role": ("super_admin", "admin", "tutor", "student"),
        "finance_type": ("income", "expense"),
        "student_status": ("active", "paused", "finished"),
        "lesson_status": ("scheduled", "completed", "cancelled"),
        "payment_status": ("paid", "unpaid"),
        "recurrence_type": ("daily", "weekly", "biweekly", "monthly"),
        "homework_type": ("text", "file", "mixed"),
        "homework_status": ("pending", "submitted", "graded", "archived"),
    }
    for name, values in enums.items():
        vals = ", ".join(f"'{v}'" for v in values)
        conn.execute(sa.text(
            f"DO $$ BEGIN CREATE TYPE {name} AS ENUM ({vals}); "
            f"EXCEPTION WHEN duplicate_object THEN NULL; END $$"
        ))

    op.execute(sa.text("""
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role user_role NOT NULL DEFAULT 'tutor',
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )
    """))
    op.create_index("idx_user_email", "users", ["email"])
    op.create_index("idx_user_role", "users", ["role"])

    op.execute(sa.text("""
        CREATE TABLE user_profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            avatar_url VARCHAR(500),
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )
    """))

    op.execute(sa.text("""
        CREATE TABLE finance_categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            name VARCHAR(100) NOT NULL,
            type finance_type NOT NULL,
            is_system BOOLEAN NOT NULL DEFAULT false,
            is_active BOOLEAN NOT NULL DEFAULT true,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            CONSTRAINT ck_financecategory_system_user CHECK (
                (is_system = true AND user_id IS NULL) OR (is_system = false AND user_id IS NOT NULL)
            )
        )
    """))
    op.create_index("idx_financecategory_user_type", "finance_categories", ["user_id", "type"])
    op.create_index("idx_financecategory_system", "finance_categories", ["is_system"])

    op.execute(sa.text("""
        CREATE TABLE finance_transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            category_id UUID NOT NULL REFERENCES finance_categories(id) ON DELETE RESTRICT,
            amount NUMERIC(12,2) NOT NULL,
            type finance_type NOT NULL,
            description TEXT,
            date DATE DEFAULT CURRENT_DATE,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            CONSTRAINT ck_financetransaction_amount_positive CHECK (amount > 0)
        )
    """))
    op.create_index("idx_financetransaction_user_date", "finance_transactions", ["user_id", "date"])
    op.create_index("idx_financetransaction_user_type", "finance_transactions", ["user_id", "type"])
    op.create_index("idx_financetransaction_category", "finance_transactions", ["category_id"])

    op.execute(sa.text("""
        CREATE TABLE students (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(20),
            subject VARCHAR(100) NOT NULL,
            lesson_price NUMERIC(10,2) NOT NULL,
            notes TEXT,
            status student_status NOT NULL DEFAULT 'active',
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            CONSTRAINT ck_student_lesson_price_non_negative CHECK (lesson_price >= 0)
        )
    """))
    op.create_index("idx_student_tutor", "students", ["tutor_id"])
    op.create_index("idx_student_tutor_status", "students", ["tutor_id", "status"])

    op.execute(sa.text("""
        CREATE TABLE lessons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            price NUMERIC(10,2) NOT NULL,
            comment TEXT,
            status lesson_status NOT NULL DEFAULT 'scheduled',
            payment_status payment_status NOT NULL DEFAULT 'unpaid',
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            CONSTRAINT ck_lesson_end_after_start CHECK (end_time > start_time),
            CONSTRAINT ck_lesson_price_non_negative CHECK (price >= 0)
        )
    """))
    op.create_index("idx_lesson_tutor_date", "lessons", ["tutor_id", "date"])
    op.create_index("idx_lesson_student", "lessons", ["student_id"])
    op.create_index("idx_lesson_status", "lessons", ["status"])
    op.create_index("idx_lesson_payment", "lessons", ["payment_status"])

    op.execute(sa.text("""
        CREATE TABLE lesson_recurrences (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
            recurrence_type recurrence_type NOT NULL,
            end_date DATE NOT NULL,
            total_occurrences INTEGER NOT NULL,
            current_occurrence INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            CONSTRAINT ck_lessonrecurrence_total_positive CHECK (total_occurrences > 0)
        )
    """))

    op.execute(sa.text("""
        CREATE TABLE homeworks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            type homework_type NOT NULL DEFAULT 'text',
            due_date DATE NOT NULL,
            status homework_status NOT NULL DEFAULT 'pending',
            grade TEXT,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        )
    """))
    op.create_index("idx_homework_student", "homeworks", ["student_id"])
    op.create_index("idx_homework_tutor", "homeworks", ["tutor_id"])
    op.create_index("idx_homework_status", "homeworks", ["status"])
    op.create_index("idx_homework_due", "homeworks", ["due_date"])

    op.execute(sa.text("""
        CREATE TABLE homework_files (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            homework_id UUID NOT NULL REFERENCES homeworks(id) ON DELETE CASCADE,
            file_url VARCHAR(500) NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_type VARCHAR(50) NOT NULL,
            file_size BIGINT NOT NULL,
            uploaded_at TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT ck_homeworkfile_size_positive CHECK (file_size > 0)
        )
    """))
    op.create_index("idx_homeworkfile_homework", "homework_files", ["homework_id"])

    op.execute(sa.text("""
        CREATE TABLE audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            action VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id UUID,
            details JSONB,
            ip_address VARCHAR(45),
            created_at TIMESTAMP NOT NULL DEFAULT now()
        )
    """))
    op.create_index("idx_auditlog_user", "audit_logs", ["user_id"])
    op.create_index("idx_auditlog_entity", "audit_logs", ["entity_type", "entity_id"])
    op.create_index("idx_auditlog_created", "audit_logs", ["created_at"])
    op.create_index("idx_auditlog_action", "audit_logs", ["action"])


def downgrade() -> None:
    op.execute(sa.text("DROP TABLE IF EXISTS audit_logs CASCADE"))
    op.execute(sa.text("DROP TABLE IF EXISTS homework_files CASCADE"))
    op.execute(sa.text("DROP TABLE IF EXISTS homeworks CASCADE"))
    op.execute(sa.text("DROP TABLE IF EXISTS lesson_recurrences CASCADE"))
    op.execute(sa.text("DROP TABLE IF EXISTS lessons CASCADE"))
    op.execute(sa.text("DROP TABLE IF EXISTS students CASCADE"))
    op.execute(sa.text("DROP TABLE IF EXISTS finance_transactions CASCADE"))
    op.execute(sa.text("DROP TABLE IF EXISTS finance_categories CASCADE"))
    op.execute(sa.text("DROP TABLE IF EXISTS user_profiles CASCADE"))
    op.execute(sa.text("DROP TABLE IF EXISTS users CASCADE"))

    conn = op.get_bind()
    for name in ["homework_status", "homework_type", "recurrence_type", "payment_status",
                  "lesson_status", "student_status", "finance_type", "user_role"]:
        conn.execute(sa.text(f"DROP TYPE IF EXISTS {name}"))
