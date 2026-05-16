from app.models import User

from tests.conftest import assert_message_in_response, signup


def test_signup_success_creates_user_and_redirects_to_login(client):
    response = signup(client, name="Ada Lovelace", email="ada@example.com")

    assert response.status_code == 302
    assert "/login" in response.location

    user = User.query.filter_by(email="ada@example.com").one()
    assert user.username == "Ada Lovelace"
    assert user.display_name == "Ada Lovelace"
    assert user.password_hash
    assert user.password_hash != "password123"


def test_signup_validation_missing_fields(client):
    response = signup(
        client,
        name="",
        email="",
        password="",
        interests=[],
    )

    assert response.status_code == 200
    assert User.query.count() == 0
    assert_message_in_response(response, "Please fill all fields.")


def test_signup_validation_invalid_email(client):
    response = signup(client, email="not-an-email")

    assert response.status_code == 200
    assert User.query.count() == 0
    assert_message_in_response(response, "Please enter a valid email address.")


def test_signup_validation_password_mismatch(client):
    response = client.post(
        "/signup",
        data={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
            "confirm": "different",
            "interests": ["Writing"],
        },
        follow_redirects=False,
    )

    assert response.status_code == 200
    assert User.query.count() == 0
    assert_message_in_response(response, "Passwords do not match.")


def test_signup_validation_no_interests(client):
    response = signup(client, interests=[])

    assert response.status_code == 200
    assert User.query.count() == 0
    assert_message_in_response(response, "Please select at least one interest.")


def test_signup_validation_duplicate_email(client):
    signup(client, email="dup@example.com")
    assert User.query.count() == 1

    response = signup(client, name="Other Name", email="dup@example.com")

    assert response.status_code == 200
    assert User.query.count() == 1
    assert_message_in_response(response, "That email is already registered. Please log in instead.")
