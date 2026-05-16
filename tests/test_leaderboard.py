from datetime import datetime, timedelta
from uuid import uuid4

from app.extensions import db
from app.models import Comment, Prompt, User


def _create_user(name, email):
    user = User(
        username=f"user-{uuid4().hex[:8]}",
        display_name=name,
        email=email,
        password_hash="hash",
    )
    db.session.add(user)
    db.session.commit()
    return user


def _create_prompt(author, title, created_at=None):
    prompt = Prompt(
        title=title,
        category="Writing",
        description=f"{title} description.",
        body="Write something useful.",
        author=author,
        created_at=created_at or datetime.now(),
    )
    db.session.add(prompt)
    db.session.commit()
    return prompt


def _add_comment(author, prompt, body="Useful prompt."):
    comment = Comment(body=body, author=author, prompt=prompt)
    db.session.add(comment)
    db.session.commit()
    return comment


def test_leaderboard_renders_real_prompt_rankings(client):
    author = _create_user("Prompt Author", "author@example.com")
    commenter = _create_user("Commenter", "commenter@example.com")
    quiet_prompt = _create_prompt(author, "Quiet Prompt", datetime.now() - timedelta(days=2))
    busy_prompt = _create_prompt(author, "Busy Prompt", datetime.now() - timedelta(days=3))
    _add_comment(commenter, busy_prompt, "First")
    _add_comment(commenter, busy_prompt, "Second")

    response = client.get("/leaderboard?mode=prompts&metric=comments")
    body = response.get_data(as_text=True)

    assert response.status_code == 200
    assert "Busy Prompt" in body
    assert "Quiet Prompt" in body
    assert body.index("Busy Prompt") < body.index("Quiet Prompt")
    assert "2</strong> comments" in body
    assert "Debug assistant for Python" not in body
    assert "prompt-data.js" not in body


def test_leaderboard_renders_real_user_rankings(client):
    top_user = _create_user("Top Publisher", "top@example.com")
    other_user = _create_user("Other Publisher", "other@example.com")
    _create_prompt(top_user, "Top First")
    _create_prompt(top_user, "Top Second")
    _create_prompt(other_user, "Other Only")

    response = client.get("/leaderboard?mode=users&metric=prompts")
    body = response.get_data(as_text=True)

    assert response.status_code == 200
    assert "Top Publisher" in body
    assert "Other Publisher" in body
    assert body.index("Top Publisher") < body.index("Other Publisher")
    assert "2</strong> prompts" in body
