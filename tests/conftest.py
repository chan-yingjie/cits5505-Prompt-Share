"""Shared pytest fixtures and helper functions used across all test modules."""

import pytest

from app import create_app
from app.extensions import db
from app.models import Prompt, User


class TestConfig:
    """Flask configuration for the test environment — uses in-memory SQLite."""
    TESTING = True
    WTF_CSRF_ENABLED = False
    SECRET_KEY = "test-secret-key"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    AVATAR_STATIC_PREFIX = "uploads/avatars"


@pytest.fixture
def app(tmp_path):
    """Create a fresh Flask app with an empty in-memory database for each test."""
    application = create_app(TestConfig)
    application.config["AVATAR_UPLOAD_FOLDER"] = tmp_path / "avatars"

    with application.app_context():
        db.create_all()
        yield application
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Return a test client for the app."""
    return app.test_client()


def assert_message_in_response(response, message):
    """Assert that a flash message string appears in the response body."""
    body = response.get_data(as_text=True)
    assert message in body, f"Expected {message!r} in response body"


def signup(client, *, name="Test User", email="test@example.com", password="password123", interests=None):
    """Submit the signup form with the given data."""
    if interests is None:
        interests = ["Writing"]
    return client.post(
        "/signup",
        data={
            "name": name,
            "email": email,
            "password": password,
            "confirm": password,
            "interests": interests,
        },
        follow_redirects=False,
    )


def login(client, *, email="test@example.com", password="password123"):
    """Submit the login form with the given credentials."""
    return client.post(
        "/login",
        data={"email": email, "password": password},
        follow_redirects=False,
    )


@pytest.fixture
def registered_user(app, client):
    """Create a registered user via the signup form and return the User object."""
    response = signup(client)
    assert response.status_code == 302
    user = User.query.filter_by(email="test@example.com").one()
    return user


@pytest.fixture
def auth_client(client, registered_user):
    """Return a test client that is already logged in as the registered user."""
    response = login(client)
    assert response.status_code == 302
    return client
