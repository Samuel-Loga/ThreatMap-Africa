"""add user profile fields

Revision ID: 003_user_profile
Revises: 6d13beb40da3
Create Date: 2026-04-26 09:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_user_profile'
down_revision = '6d13beb40da3'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('org_type', sa.String(length=100), nullable=False, server_default=''))
    op.add_column('users', sa.Column('department', sa.String(length=255), nullable=False, server_default=''))
    op.add_column('users', sa.Column('experience_level', sa.String(length=100), nullable=False, server_default=''))
    op.add_column('users', sa.Column('interests', postgresql.ARRAY(sa.String()), nullable=False, server_default='{}'))
    op.add_column('users', sa.Column('phone_number', sa.String(length=50), nullable=False, server_default=''))
    op.add_column('users', sa.Column('email_notif', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('sms_notif', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('push_notif', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('update_frequency', sa.String(length=50), nullable=False, server_default='daily'))
    op.add_column('users', sa.Column('full_name', sa.String(length=255), nullable=False, server_default=''))
    op.add_column('users', sa.Column('profile_pic', sa.String(length=500), nullable=False, server_default=''))
    op.add_column('users', sa.Column('pgp_key', sa.Text(), nullable=False, server_default=''))
    op.add_column('users', sa.Column('two_factor_enabled', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('region_state', sa.String(length=255), nullable=False, server_default=''))
    op.add_column('users', sa.Column('city', sa.String(length=255), nullable=False, server_default=''))
    op.add_column('users', sa.Column('data_sharing_consent', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('trust_score', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('reputation_points', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('verification_level', sa.String(length=50), nullable=False, server_default='unverified'))


def downgrade():
    op.drop_column('users', 'verification_level')
    op.drop_column('users', 'reputation_points')
    op.drop_column('users', 'trust_score')
    op.drop_column('users', 'onboarding_completed')
    op.drop_column('users', 'data_sharing_consent')
    op.drop_column('users', 'city')
    op.drop_column('users', 'region_state')
    op.drop_column('users', 'two_factor_enabled')
    op.drop_column('users', 'pgp_key')
    op.drop_column('users', 'profile_pic')
    op.drop_column('users', 'full_name')
    op.drop_column('users', 'update_frequency')
    op.drop_column('users', 'push_notif')
    op.drop_column('users', 'sms_notif')
    op.drop_column('users', 'email_notif')
    op.drop_column('users', 'phone_number')
    op.drop_column('users', 'interests')
    op.drop_column('users', 'experience_level')
    op.drop_column('users', 'department')
    op.drop_column('users', 'org_type')
