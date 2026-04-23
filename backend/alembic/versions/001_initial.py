"""initial schema

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("username", sa.String(100), nullable=False),
        sa.Column("hashed_password", sa.Text(), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default="Viewer"),
        sa.Column("organization", sa.String(255), nullable=False, server_default=""),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_username", "users", ["username"])

    op.create_table(
        "indicators",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("indicator_type", sa.String(50), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("tlp", sa.String(10), nullable=False, server_default="GREEN"),
        sa.Column("confidence", sa.Integer(), nullable=False, server_default="50"),
        sa.Column("country_codes", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("sectors", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("attack_categories", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("first_seen", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("last_seen", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("enrichment_data", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("submitted_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("stix_id", sa.Text(), nullable=False, server_default=""),
        sa.Column("status", sa.String(50), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["submitted_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_indicators_indicator_type", "indicators", ["indicator_type"])
    op.create_index("ix_indicators_tlp", "indicators", ["tlp"])
    op.create_index("ix_indicators_status", "indicators", ["status"])

    op.create_table(
        "enrichment_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("indicator_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source", sa.String(100), nullable=False),
        sa.Column("raw_response", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("malicious_votes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("country", sa.String(100), nullable=False, server_default=""),
        sa.Column("asn", sa.String(200), nullable=False, server_default=""),
        sa.Column("enriched_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["indicator_id"], ["indicators.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_enrichment_results_indicator_id", "enrichment_results", ["indicator_id"])


def downgrade() -> None:
    op.drop_table("enrichment_results")
    op.drop_table("indicators")
    op.drop_table("users")
