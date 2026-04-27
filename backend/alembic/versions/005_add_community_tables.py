"""add community and workspace tables

Revision ID: 005
Revises: 004_add_totp_secret
Create Date: 2026-04-27 10:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '005'
down_revision = '004_add_totp_secret'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('badges',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('icon', sa.String(length=255), nullable=False, server_default=''),
        sa.Column('criteria', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table('forums',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False, server_default=''),
        sa.Column('created_by', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table('posts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('forum_id', sa.UUID(), nullable=False),
        sa.Column('author_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('upvotes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('downvotes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_pinned', sa.Boolean(), nullable=False, server_default='false'),
        sa.ForeignKeyConstraint(['author_id'], ['users.id']),
        sa.ForeignKeyConstraint(['forum_id'], ['forums.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table('comments',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('post_id', sa.UUID(), nullable=True),
        sa.Column('indicator_id', sa.UUID(), nullable=True),
        sa.Column('author_id', sa.UUID(), nullable=False),
        sa.Column('parent_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('upvotes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('downvotes', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['author_id'], ['users.id']),
        sa.ForeignKeyConstraint(['indicator_id'], ['indicators.id']),
        sa.ForeignKeyConstraint(['parent_id'], ['comments.id']),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table('user_badges',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('badge_id', sa.UUID(), nullable=False),
        sa.Column('awarded_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['badge_id'], ['badges.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table('votes',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('post_id', sa.UUID(), nullable=True),
        sa.Column('comment_id', sa.UUID(), nullable=True),
        sa.Column('vote_type', sa.String(length=10), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['comment_id'], ['comments.id']),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table('workspaces',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False, server_default=''),
        sa.Column('owner_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table('workspace_members',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('workspace_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='member'),
        sa.Column('joined_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table('workspace_indicators',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('workspace_id', sa.UUID(), nullable=False),
        sa.Column('indicator_id', sa.UUID(), nullable=False),
        sa.Column('added_by', sa.UUID(), nullable=False),
        sa.Column('added_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['added_by'], ['users.id']),
        sa.ForeignKeyConstraint(['indicator_id'], ['indicators.id']),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id']),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade():
    op.drop_table('workspace_indicators')
    op.drop_table('workspace_members')
    op.drop_table('workspaces')
    op.drop_table('votes')
    op.drop_table('user_badges')
    op.drop_table('comments')
    op.drop_table('posts')
    op.drop_table('forums')
    op.drop_table('badges')
