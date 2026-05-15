from tests.conftest import login, signup


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
