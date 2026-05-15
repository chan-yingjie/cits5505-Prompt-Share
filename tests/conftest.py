import pytest

from app import create_app
from app.extensions import db
from app.models import Prompt, User


class TestConfig:
    TESTING = True
    WTF_CSRF_ENABLED = False
    SECRET_KEY = "test-secret-key"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False


@pytest.fixture
def app():
    application = create_app(TestConfig)

    with application.app_context():
        db.create_all()
        yield application
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def assert_message_in_response(response, message):
    """Flash messages are consumed when templates render; check the response body."""
    body = response.get_data(as_text=True)
    assert message in body, f"Expected {message!r} in response body"


def signup(client, *, name="Test User", email="test@example.com", password="password123", interests=None):
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
    return client.post(
        "/login",
        data={"email": email, "password": password},
        follow_redirects=False,
    )


@pytest.fixture
def registered_user(app, client):
    response = signup(client)
    assert response.status_code == 302
    user = User.query.filter_by(email="test@example.com").one()
    return user


@pytest.fixture
def auth_client(client, registered_user):
    response = login(client)
    assert response.status_code == 302
    return client
