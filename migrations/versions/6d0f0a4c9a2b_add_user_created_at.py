"""Add user created_at

Revision ID: 6d0f0a4c9a2b
Revises: 123ebe80933b
Create Date: 2026-05-15 15:48:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6d0f0a4c9a2b'
down_revision = '123ebe80933b'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('created_at', sa.DateTime(), server_default=sa.func.current_timestamp(), nullable=False))


def downgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('created_at')
