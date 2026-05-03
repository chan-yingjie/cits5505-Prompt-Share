from flask import Flask
from pathlib import Path

from config import Config

from .extensions import csrf, db, login_manager, migrate
from .models import User
from .routes import main_bp


def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)

    Path(app.instance_path).mkdir(parents=True, exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    csrf.init_app(app)

    login_manager.login_view = "main.login"

    app.register_blueprint(main_bp)

    return app


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))
