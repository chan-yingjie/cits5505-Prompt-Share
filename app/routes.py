from flask import Blueprint, render_template


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


@main_bp.route("/signup")
@main_bp.route("/signup.html")
def signup():
    return render_template("signup.html")


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
