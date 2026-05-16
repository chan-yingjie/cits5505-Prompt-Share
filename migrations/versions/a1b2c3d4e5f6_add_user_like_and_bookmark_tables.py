"""add user_like and user_bookmark tables

Revision ID: a1b2c3d4e5f6
Revises: 6ddf038e6d48
Create Date: 2026-05-16 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'a1b2c3d4e5f6'
down_revision = '6ddf038e6d48'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user_like',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('prompt_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['prompt_id'], ['prompt.id']),
        sa.ForeignKeyConstraint(['user_id'], ['user.id']),
        sa.PrimaryKeyConstraint('user_id', 'prompt_id'),
    )
    op.create_table(
        'user_bookmark',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('prompt_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['prompt_id'], ['prompt.id']),
        sa.ForeignKeyConstraint(['user_id'], ['user.id']),
        sa.PrimaryKeyConstraint('user_id', 'prompt_id'),
    )


def downgrade():
    op.drop_table('user_bookmark')
    op.drop_table('user_like')
