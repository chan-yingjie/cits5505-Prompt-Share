"""Unit tests for the login route (/login)."""

from urllib.parse import unquote

from tests.conftest import assert_message_in_response, login


def test_login_success_redirects_to_profile(client, registered_user):
    """Correct credentials should redirect the user to their profile page."""
    response = login(client)

    assert response.status_code == 302
    assert f"/profile/{registered_user.username}" in unquote(response.location)

    with client.session_transaction() as session:
        assert "_user_id" in session


def test_login_invalid_credentials_unknown_email(client):
    """An unregistered email should return an error and not set a session."""
    response = login(client, email="missing@example.com", password="password123")

    assert response.status_code == 200
    assert_message_in_response(response, "Invalid email or password.")

    with client.session_transaction() as session:
        assert "_user_id" not in session


def test_login_invalid_credentials_wrong_password(client, registered_user):
    """A wrong password should return an error and not set a session."""
    response = login(client, password="wrong-password")

    assert response.status_code == 200
    assert_message_in_response(response, "Invalid email or password.")

    with client.session_transaction() as session:
        assert "_user_id" not in session


def test_login_validation_missing_fields(client):
    """Submitting an empty form should show a validation error."""
    response = client.post("/login", data={"email": "", "password": ""}, follow_redirects=False)

    assert response.status_code == 200
    assert_message_in_response(response, "Please enter both email and password.")


def test_login_validation_invalid_email(client):
    """A malformed email address should show a validation error."""
    response = login(client, email="bad-email", password="password123")

    assert response.status_code == 200
    assert_message_in_response(response, "Please enter a valid email address.")


def test_login_redirects_authenticated_user(client, registered_user):
    """A user who is already logged in should be redirected away from the login page."""
    login(client)

    response = client.get("/login", follow_redirects=False)

    assert response.status_code == 302
    assert f"/profile/{registered_user.username}" in unquote(response.location)
