from io import BytesIO
from datetime import datetime
from urllib.parse import unquote
from uuid import uuid4

from tests.conftest import assert_message_in_response, login, signup
from app.extensions import db
from app.models import Comment, Prompt, User


def _create_user(name, email):
    user = User(username=f"user-{uuid4().hex[:8]}", display_name=name, email=email, password_hash="hash")
    db.session.add(user)
    db.session.commit()
    return user


def _create_prompt(author, title="Owned prompt"):
    prompt = Prompt(
        title=title,
        category="Writing",
        description="A useful prompt.",
        body="Write something useful.",
        author=author,
    )
    db.session.add(prompt)
    db.session.commit()
    return prompt


def _create_comment(author, prompt, body="Original comment"):
    comment = Comment(body=body, author=author, prompt=prompt)
    db.session.add(comment)
    db.session.commit()
    return comment


def _prompt_update_data(**overrides):
    data = {
        "prompt-title": "Updated prompt",
        "categories": ["Education", "Coding"],
        "prompt-description": "Updated description.",
        "prompt-body": "Updated body.",
        "prompt-output": "Updated output.",
    }
    data.update(overrides)
    return data


def test_submit_prompt_requires_login(client):
    response = client.get("/submit-prompt", follow_redirects=False)

    assert response.status_code == 302
    assert "/login" in response.location


def test_profile_requires_login(client):
    response = client.get("/profile/some-user", follow_redirects=False)

    assert response.status_code == 302
    assert "/login" in response.location


def test_add_comment_requires_login(client):
    response = client.post(
        "/prompt/1/comment",
        data={"comment": "Hello"},
        follow_redirects=False,
    )

    assert response.status_code == 302
    assert "/login" in response.location


def test_authenticated_user_can_access_submit_prompt(auth_client):
    response = auth_client.get("/submit-prompt", follow_redirects=False)

    assert response.status_code == 200


def test_authenticated_user_can_access_own_profile(auth_client, registered_user):
    response = auth_client.get(
        f"/profile/{registered_user.username}",
        follow_redirects=False,
    )

    assert response.status_code == 200


def test_recent_profile_shows_recent_join_label(auth_client, registered_user):
    response = auth_client.get(f"/profile/{registered_user.username}")

    assert response.status_code == 200
    assert b"Joined recently" in response.data
    assert b"New user" in response.data


def test_older_profile_shows_join_month(auth_client):
    older_user = _create_user("Older User", "older@example.com")
    older_user.created_at = datetime(2024, 1, 15)
    db.session.commit()

    response = auth_client.get(f"/profile/{older_user.username}")

    assert response.status_code == 200
    assert b"Joined Jan 2024" in response.data
    assert b"Member" in response.data


def test_user_can_upload_profile_avatar(app, auth_client, registered_user):
    response = auth_client.post(
        "/profile/avatar",
        data={"avatar": (BytesIO(b"fake png data"), "avatar.png")},
        content_type="multipart/form-data",
        follow_redirects=False,
    )

    db.session.refresh(registered_user)

    assert response.status_code == 302
    assert f"/profile/{registered_user.username}" in unquote(response.location)
    assert registered_user.avatar_filename.startswith(f"user-{registered_user.id}-")
    assert registered_user.avatar_filename.endswith(".png")
    assert (app.config["AVATAR_UPLOAD_FOLDER"] / registered_user.avatar_filename).exists()

    profile_response = auth_client.get(f"/profile/{registered_user.username}")
    assert f"uploads/avatars/{registered_user.avatar_filename}".encode() in profile_response.data


def test_avatar_upload_rejects_invalid_file_type(auth_client, registered_user):
    response = auth_client.post(
        "/profile/avatar",
        data={"avatar": (BytesIO(b"not an image"), "avatar.txt")},
        content_type="multipart/form-data",
        follow_redirects=False,
    )

    db.session.refresh(registered_user)

    assert response.status_code == 302
    assert registered_user.avatar_filename is None


def test_user_can_update_profile_information(auth_client, registered_user):
    original_user_code = registered_user.username

    response = auth_client.post(
        "/profile/update",
        data={
            "display_name": "Updated Name",
            "email": "updated@example.com",
            "location": "Perth, Australia",
            "bio": "Sharing practical prompts.",
        },
        follow_redirects=False,
    )

    db.session.refresh(registered_user)

    assert response.status_code == 302
    assert f"/profile/{original_user_code}" in unquote(response.location)
    assert registered_user.display_name == "Updated Name"
    assert registered_user.username == original_user_code
    assert registered_user.email == "updated@example.com"
    assert registered_user.location == "Perth, Australia"
    assert registered_user.bio == "Sharing practical prompts."

    profile_response = auth_client.get(f"/profile/{original_user_code}")
    assert b"Updated Name" in profile_response.data
    assert f"@{original_user_code}".encode() in profile_response.data


def test_profile_header_shows_saved_bio(auth_client, registered_user):
    registered_user.bio = "Sharing practical prompts."
    db.session.commit()

    response = auth_client.get(f"/profile/{registered_user.username}")

    assert response.status_code == 200
    assert b"Sharing practical prompts." in response.data
    assert b"Add a bio to introduce yourself." not in response.data


def test_profile_update_rejects_duplicate_email(auth_client, registered_user):
    _create_user("Other User", "other@example.com")

    response = auth_client.post(
        "/profile/update",
        data={
            "display_name": registered_user.display_label,
            "email": "other@example.com",
            "location": "",
            "bio": "",
        },
        follow_redirects=False,
    )

    db.session.refresh(registered_user)

    assert response.status_code == 302
    assert registered_user.email == "test@example.com"


def test_prompt_edit_requires_login(client, registered_user):
    prompt = _create_prompt(registered_user)

    response = client.post(
        f"/prompt/{prompt.id}/edit",
        data=_prompt_update_data(),
        follow_redirects=False,
    )

    assert response.status_code == 302
    assert "/login" in response.location


def test_prompt_owner_can_edit_prompt(auth_client, registered_user):
    prompt = _create_prompt(registered_user)

    response = auth_client.post(
        f"/prompt/{prompt.id}/edit",
        data=_prompt_update_data(),
        follow_redirects=False,
    )

    assert response.status_code == 302
    assert f"/prompt/{prompt.id}" in response.location

    updated_prompt = db.session.get(Prompt, prompt.id)
    assert updated_prompt.title == "Updated prompt"
    assert updated_prompt.category == "Education"
    assert updated_prompt.subcategory == "Coding"
    assert updated_prompt.description == "Updated description."
    assert updated_prompt.body == "Updated body."
    assert updated_prompt.output_preview == "Updated output."


def test_prompt_owner_can_access_edit_form(auth_client, registered_user):
    prompt = _create_prompt(registered_user)

    response = auth_client.get(f"/prompt/{prompt.id}/edit", follow_redirects=False)

    assert response.status_code == 200
    assert "Save Changes" in response.get_data(as_text=True)


def test_non_owner_cannot_access_prompt_edit_form(auth_client):
    other_user = _create_user("Other User", "other@example.com")
    prompt = _create_prompt(other_user)

    response = auth_client.get(f"/prompt/{prompt.id}/edit", follow_redirects=True)

    assert response.status_code == 200
    assert_message_in_response(response, "You can only edit your own prompts.")


def test_non_owner_cannot_edit_prompt(auth_client, registered_user):
    other_user = _create_user("Other User", "other@example.com")
    prompt = _create_prompt(other_user)

    response = auth_client.post(
        f"/prompt/{prompt.id}/edit",
        data=_prompt_update_data(),
        follow_redirects=True,
    )

    assert response.status_code == 200
    assert_message_in_response(response, "You can only edit your own prompts.")

    unchanged_prompt = db.session.get(Prompt, prompt.id)
    assert unchanged_prompt.title == "Owned prompt"
    assert unchanged_prompt.author_id == other_user.id


def test_prompt_owner_can_delete_prompt(auth_client, registered_user):
    prompt = _create_prompt(registered_user)

    response = auth_client.post(
        f"/prompt/{prompt.id}/delete",
        follow_redirects=False,
    )

    assert response.status_code == 302
    assert "/feed" in response.location
    assert db.session.get(Prompt, prompt.id) is None


def test_non_owner_cannot_delete_prompt(auth_client):
    other_user = _create_user("Other User", "other@example.com")
    prompt = _create_prompt(other_user)

    response = auth_client.post(
        f"/prompt/{prompt.id}/delete",
        follow_redirects=True,
    )

    assert response.status_code == 200
    assert_message_in_response(response, "You can only delete your own prompts.")
    assert db.session.get(Prompt, prompt.id) is not None


def test_comment_edit_requires_login(client, registered_user):
    prompt = _create_prompt(registered_user)
    comment = _create_comment(registered_user, prompt)

    response = client.post(
        f"/comment/{comment.id}/edit",
        data={"comment": "Updated comment"},
        follow_redirects=False,
    )

    assert response.status_code == 302
    assert "/login" in response.location


def test_comment_owner_can_edit_comment(auth_client, registered_user):
    prompt = _create_prompt(registered_user)
    comment = _create_comment(registered_user, prompt)

    response = auth_client.post(
        f"/comment/{comment.id}/edit",
        data={"comment": "Updated comment"},
        follow_redirects=False,
    )

    assert response.status_code == 302
    assert f"/prompt/{prompt.id}" in response.location
    assert db.session.get(Comment, comment.id).body == "Updated comment"


def test_non_owner_cannot_edit_comment(auth_client):
    other_user = _create_user("Other User", "other@example.com")
    prompt = _create_prompt(other_user)
    comment = _create_comment(other_user, prompt)

    response = auth_client.post(
        f"/comment/{comment.id}/edit",
        data={"comment": "Updated comment"},
        follow_redirects=True,
    )

    assert response.status_code == 200
    assert_message_in_response(response, "You can only edit your own comments.")
    assert db.session.get(Comment, comment.id).body == "Original comment"


def test_comment_owner_can_delete_comment(auth_client, registered_user):
    prompt = _create_prompt(registered_user)
    comment = _create_comment(registered_user, prompt)

    response = auth_client.post(
        f"/comment/{comment.id}/delete",
        follow_redirects=False,
    )

    assert response.status_code == 302
    assert f"/prompt/{prompt.id}" in response.location
    assert db.session.get(Comment, comment.id) is None


def test_non_owner_cannot_delete_comment(auth_client):
    other_user = _create_user("Other User", "other@example.com")
    prompt = _create_prompt(other_user)
    comment = _create_comment(other_user, prompt)

    response = auth_client.post(
        f"/comment/{comment.id}/delete",
        follow_redirects=True,
    )

    assert response.status_code == 200
    assert_message_in_response(response, "You can only delete your own comments.")
    assert db.session.get(Comment, comment.id) is not None
