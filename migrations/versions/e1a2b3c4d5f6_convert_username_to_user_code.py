"""Convert username to user code

Revision ID: e1a2b3c4d5f6
Revises: d9f3a7b6c5e2
Create Date: 2026-05-16 00:00:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'e1a2b3c4d5f6'
down_revision = 'd9f3a7b6c5e2'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("UPDATE user SET display_name = username WHERE display_name IS NULL OR display_name = ''")
    op.execute("UPDATE user SET username = 'user-' || printf('%06d', id)")


def downgrade():
    op.execute("UPDATE user SET username = 'legacy-' || printf('%06d', id)")
