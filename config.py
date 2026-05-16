import os
from datetime import timedelta
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


class Config:
    # Session signing key — set SECRET_KEY in the environment for production.
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'instance' / 'app.db'}",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Prevent JavaScript from accessing the session cookie (mitigates XSS).
    SESSION_COOKIE_HTTPONLY = True
    # "Lax" blocks the cookie on cross-site POST requests (CSRF defence).
    SESSION_COOKIE_SAMESITE = "Lax"
    # Sessions expire after 7 days of inactivity.
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    AVATAR_UPLOAD_FOLDER  = BASE_DIR / "app" / "static" / "uploads" / "avatars"
    AVATAR_STATIC_PREFIX  = "uploads/avatars"
