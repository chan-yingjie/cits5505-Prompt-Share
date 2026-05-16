"""ORM models for the PromptShare application.

Each class maps to a database table. Relationships use cascade delete so that
removing a User automatically removes all their prompts and comments.
"""

from datetime import datetime

from flask_login import UserMixin

from .extensions import db


class User(UserMixin, db.Model):
    """Registered account. username is an internal code; display_name is shown in the UI."""

    id            = db.Column(db.Integer, primary_key=True)
    username      = db.Column(db.String(80),  unique=True, nullable=False)
    display_name  = db.Column(db.String(120), nullable=True)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at    = db.Column(db.DateTime,    nullable=False, default=datetime.utcnow)
    avatar_filename = db.Column(db.String(255), nullable=True)
    location      = db.Column(db.String(120), nullable=True)
    bio           = db.Column(db.Text,        nullable=True)

    prompts  = db.relationship("Prompt",  back_populates="author", cascade="all, delete-orphan")
    comments = db.relationship("Comment", back_populates="author", cascade="all, delete-orphan")

    @property
    def display_label(self):
        """Return display_name when set, falling back to the internal username code."""
        return self.display_name or self.username

    def __repr__(self):
        return f"<User id={self.id} username={self.username!r}>"


class Prompt(db.Model):
    """A prompt submitted by a user. Tracks engagement via views, likes, and bookmarks."""

    id            = db.Column(db.Integer,      primary_key=True)
    title         = db.Column(db.String(200),  nullable=False)
    category      = db.Column(db.String(80),   nullable=False)
    subcategory   = db.Column(db.String(80),   nullable=True)
    description   = db.Column(db.Text,         nullable=False)
    body          = db.Column(db.Text,         nullable=False)
    output_preview = db.Column(db.Text,        nullable=True)
    created_at    = db.Column(db.DateTime,     nullable=False, default=datetime.utcnow)
    author_id     = db.Column(db.Integer,      db.ForeignKey("user.id"), nullable=False)
    views         = db.Column(db.Integer,      nullable=False, default=0)
    likes         = db.Column(db.Integer,      nullable=False, default=0)
    bookmarks     = db.Column(db.Integer,      nullable=False, default=0)

    author   = db.relationship("User",    back_populates="prompts")
    comments = db.relationship("Comment", back_populates="prompt", cascade="all, delete-orphan")

    # Indexes on columns used heavily in WHERE / ORDER BY clauses.
    __table_args__ = (
        db.Index("ix_prompt_author_id",  "author_id"),
        db.Index("ix_prompt_created_at", "created_at"),
        db.Index("ix_prompt_category",   "category"),
    )

    def __repr__(self):
        return f"<Prompt id={self.id} title={self.title!r}>"


class UserLike(db.Model):
    """Records a single like from one user on one prompt.

    The composite primary key (user_id, prompt_id) enforces one-like-per-user.
    """

    __tablename__ = "user_like"
    user_id    = db.Column(db.Integer, db.ForeignKey("user.id"),   primary_key=True)
    prompt_id  = db.Column(db.Integer, db.ForeignKey("prompt.id"), primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"<UserLike user={self.user_id} prompt={self.prompt_id}>"


class UserBookmark(db.Model):
    """Records a single bookmark from one user on one prompt.

    Mirrors UserLike — composite primary key prevents duplicate bookmarks.
    """

    __tablename__ = "user_bookmark"
    user_id    = db.Column(db.Integer, db.ForeignKey("user.id"),   primary_key=True)
    prompt_id  = db.Column(db.Integer, db.ForeignKey("prompt.id"), primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"<UserBookmark user={self.user_id} prompt={self.prompt_id}>"


class Comment(db.Model):
    """A comment on a prompt. parent_id enables one level of threaded replies."""

    id         = db.Column(db.Integer, primary_key=True)
    body       = db.Column(db.Text,    nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id    = db.Column(db.Integer, db.ForeignKey("user.id"),    nullable=False)
    prompt_id  = db.Column(db.Integer, db.ForeignKey("prompt.id"),  nullable=False)
    # Nullable: top-level comments have no parent.
    parent_id  = db.Column(db.Integer, db.ForeignKey("comment.id"), nullable=True)

    author  = db.relationship("User",    back_populates="comments")
    prompt  = db.relationship("Prompt",  back_populates="comments")
    replies = db.relationship(
        "Comment",
        backref=db.backref("parent", remote_side="Comment.id"),
        lazy="dynamic",
        order_by="Comment.created_at",
    )

    __table_args__ = (
        db.Index("ix_comment_prompt_id", "prompt_id"),
        db.Index("ix_comment_user_id",   "user_id"),
    )

    def __repr__(self):
        return f"<Comment id={self.id} prompt={self.prompt_id} user={self.user_id}>"
