"""add email_verified to users

Revision ID: 003_email_verified
Revises: 002_token_version
Create Date: 2026-06-29

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "003_email_verified"
down_revision: str | None = "002_token_version"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("email_verified", sa.Boolean(), server_default="false", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("users", "email_verified")
