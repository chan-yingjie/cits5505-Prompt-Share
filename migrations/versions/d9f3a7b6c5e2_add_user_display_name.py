"""Add user display name

Revision ID: d9f3a7b6c5e2
Revises: c2d8e6f4a1b3
Create Date: 2026-05-16 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd9f3a7b6c5e2'
down_revision = 'c2d8e6f4a1b3'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('display_name', sa.String(length=120), nullable=True))

    op.execute('UPDATE user SET display_name = username WHERE display_name IS NULL')


def downgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('display_name')
