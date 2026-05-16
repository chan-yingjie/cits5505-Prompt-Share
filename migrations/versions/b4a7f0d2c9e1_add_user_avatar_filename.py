"""Add user avatar filename

Revision ID: b4a7f0d2c9e1
Revises: 6d0f0a4c9a2b
Create Date: 2026-05-16 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b4a7f0d2c9e1'
down_revision = '6d0f0a4c9a2b'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('avatar_filename', sa.String(length=255), nullable=True))


def downgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('avatar_filename')
