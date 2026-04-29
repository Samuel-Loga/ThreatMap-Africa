"""add totp_secret to users

Revision ID: 004_add_totp_secret
Revises: 003_user_profile
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '004_add_totp_secret'
down_revision = '003_user_profile'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('totp_secret', sa.String(64), nullable=False, server_default=''))


def downgrade():
    op.drop_column('users', 'totp_secret')
