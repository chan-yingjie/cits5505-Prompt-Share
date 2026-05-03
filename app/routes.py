from flask import Blueprint, flash, redirect, render_template, request, url_for
from werkzeug.security import generate_password_hash

from .extensions import db
from .models import User


main_bp = Blueprint("main", __name__)


@main_bp.route("/")
@main_bp.route("/index.html")
def index():
    return render_template("index.html")


@main_bp.route("/feed")
@main_bp.route("/feed.html")
def feed():
    return render_template("feed.html")


@main_bp.route("/leaderboard")
@main_bp.route("/leaderboard.html")
def leaderboard():
    return render_template("leaderboard.html")


@main_bp.route("/login")
@main_bp.route("/login.html")
def login():
    return render_template("login.html")


@main_bp.route("/signup", methods=["GET", "POST"])
@main_bp.route("/signup.html", methods=["GET", "POST"])
def signup():
    form_data = {
        "name": "",
        "email": "",
        "interests": [],
    }

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm = request.form.get("confirm", "")
        interests = request.form.getlist("interests")

        form_data = {
            "name": name,
            "email": email,
            "interests": interests,
        }

        if not name or not email or not password or not confirm:
            flash("Please fill all fields.", "error")
        elif password != confirm:
            flash("Passwords do not match.", "error")
        elif not interests:
            flash("Please select at least one interest.", "error")
        elif len(interests) > 3 and "All" not in interests:
            flash("You can select up to 3 interests only.", "error")
        elif User.query.filter_by(username=name).first():
            flash("That full name is already registered. Please use a different one.", "error")
        elif User.query.filter_by(email=email).first():
            flash("That email is already registered. Please log in instead.", "error")
        else:
            user = User(
                username=name,
                email=email,
                password_hash=generate_password_hash(password),
            )
            db.session.add(user)
            db.session.commit()
            flash("Account created successfully! You can now log in.", "success")
            return redirect(url_for("main.login"))

    return render_template("signup.html", form_data=form_data)


@main_bp.route("/profile")
@main_bp.route("/profile.html")
def profile():
    return render_template("profile.html")


@main_bp.route("/prompt-detail")
@main_bp.route("/prompt-detail.html")
def prompt_detail():
    return render_template("prompt-detail.html")


@main_bp.route("/submit-prompt")
@main_bp.route("/submit-prompt.html")
def submit_prompt():
    return render_template("submit-prompt.html")
