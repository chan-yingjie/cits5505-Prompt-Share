"""add indexes for common queries

Revision ID: d1e2f3a4b5c6
Revises: b2c3d4e5f6a7
Create Date: 2026-05-16 20:00:00.000000

Adds indexes on columns that appear frequently in WHERE and ORDER BY clauses:
  - prompt.author_id   (profile page: all prompts by a user)
  - prompt.created_at  (feed / leaderboard ordering)
  - prompt.category    (feed category filtering)
  - comment.prompt_id  (prompt detail: all comments for a prompt)
  - comment.user_id    (profile activity: all comments by a user)
"""
from alembic import op


revision = 'd1e2f3a4b5c6'
down_revision = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade():
    op.create_index("ix_prompt_author_id",  "prompt",  ["author_id"])
    op.create_index("ix_prompt_created_at", "prompt",  ["created_at"])
    op.create_index("ix_prompt_category",   "prompt",  ["category"])
    op.create_index("ix_comment_prompt_id", "comment", ["prompt_id"])
    op.create_index("ix_comment_user_id",   "comment", ["user_id"])


def downgrade():
    op.drop_index("ix_comment_user_id",   table_name="comment")
    op.drop_index("ix_comment_prompt_id", table_name="comment")
    op.drop_index("ix_prompt_category",   table_name="prompt")
    op.drop_index("ix_prompt_created_at", table_name="prompt")
    op.drop_index("ix_prompt_author_id",  table_name="prompt")
