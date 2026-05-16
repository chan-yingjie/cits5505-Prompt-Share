import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'instance' / 'app.db'}",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    AVATAR_UPLOAD_FOLDER = BASE_DIR / "app" / "static" / "uploads" / "avatars"
    AVATAR_STATIC_PREFIX = "uploads/avatars"
