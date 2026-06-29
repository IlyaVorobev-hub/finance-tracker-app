"""add token_version to users

Revision ID: 002_token_version
Revises: 001_initial
Create Date: 2026-06-29

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "002_token_version"
down_revision: str | None = "001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("token_version", sa.Integer(), server_default="0", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("users", "token_version")
