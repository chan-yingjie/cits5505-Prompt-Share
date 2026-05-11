import re

from flask import Blueprint, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash
from .models import Comment, Prompt, User
from .extensions import db



main_bp = Blueprint("main", __name__)

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@main_bp.route("/")
@main_bp.route("/index.html")
def index():
    return render_template("index.html")


@main_bp.route("/feed")
@main_bp.route("/feed.html")
def feed():
    prompts = Prompt.query.order_by(Prompt.created_at.desc()).all()
    return render_template("feed.html", prompts=prompts)


@main_bp.route("/leaderboard")
@main_bp.route("/leaderboard.html")
def leaderboard():
    return render_template("leaderboard.html")


@main_bp.route("/login", methods=["GET", "POST"])
@main_bp.route("/login.html", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.profile", user=current_user.username))

    form_data = {
        "email": "",
        "next": request.args.get("next", ""),
    }

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        next_page = request.form.get("next", "").strip()

        form_data["email"] = email
        form_data["next"] = next_page

        if not email or not password:
            flash("Please enter both email and password.", "error")
        elif not EMAIL_PATTERN.match(email):
            flash("Please enter a valid email address.", "error")
        else:
            user = User.query.filter_by(email=email).first()

            if user is None or not check_password_hash(user.password_hash, password):
                flash("Invalid email or password.", "error")
            else:
                login_user(user)
                flash("Logged in successfully.", "success")
                if next_page.startswith("/"):
                    return redirect(next_page)
                return redirect(url_for("main.profile", user=user.username))

    return render_template("login.html", form_data=form_data)


@main_bp.route("/signup", methods=["GET", "POST"])
@main_bp.route("/signup.html", methods=["GET", "POST"])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for("main.profile", user=current_user.username))

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
        elif not EMAIL_PATTERN.match(email):
            flash("Please enter a valid email address.", "error")
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
                password_hash=generate_password_hash(password, method="pbkdf2:sha256"),
            )
            db.session.add(user)
            db.session.commit()
            flash("Account created successfully! You can now log in.", "success")
            return redirect(url_for("main.login"))

    return render_template("signup.html", form_data=form_data)

@main_bp.route("/profile/<string:user>")
@login_required
def profile(user):

    profile_user = User.query.filter_by(username=user).first_or_404()

    prompts = Prompt.query.filter_by(author=profile_user)\
        .order_by(Prompt.created_at.desc())\
        .all()

    return render_template(
        "profile.html",
        profile_user=profile_user,
        prompts=prompts
    )
@main_bp.route("/profile")
@main_bp.route("/profile.html")
@login_required
def profile_redirect():
    username = request.args.get("user") or current_user.username
    return redirect(url_for("main.profile", user=username))


@main_bp.route("/prompt-detail")
@main_bp.route("/prompt-detail.html")
def prompt_detail_redirect():
    prompt_id = request.args.get("prompt", type=int)

    if prompt_id is None:
        return redirect(url_for("main.feed"))

    return redirect(url_for("main.prompt_detail", prompt_id=prompt_id))

@main_bp.route("/prompt/<int:prompt_id>")
def prompt_detail(prompt_id):
    prompt = Prompt.query.get_or_404(prompt_id)
    comments = Comment.query.filter_by(prompt_id=prompt.id).order_by(Comment.created_at.asc()).all()
    return render_template("prompt-detail.html", prompt=prompt, comments=comments)

@main_bp.route("/prompt/<int:prompt_id>/comment", methods=["POST"])
@login_required
def add_comment(prompt_id):
    prompt = Prompt.query.get_or_404(prompt_id)
    body = request.form.get("comment", "").strip()

    if not body:
        flash("Comment cannot be empty.", "error")
        return redirect(url_for("main.prompt_detail", prompt_id=prompt.id))

    comment = Comment(
        body=body,
        author=current_user,
        prompt=prompt,
    )

    db.session.add(comment)
    db.session.commit()

    flash("Comment added successfully.", "success")
    return redirect(url_for("main.prompt_detail", prompt_id=prompt.id))

@main_bp.route("/submit-prompt", methods=["GET", "POST"])
@main_bp.route("/submit-prompt.html", methods=["GET", "POST"])
@login_required
def submit_prompt():
    form_data = {
        "title": "",
        "categories": [],
        "description": "",
        "body": "",
        "output_preview": "",
    }

    if request.method == "POST":
        title = request.form.get("prompt-title", "").strip()
        categories = request.form.getlist("categories")
        description = request.form.get("prompt-description", "").strip()
        body = request.form.get("prompt-body", "").strip()
        output_preview = request.form.get("prompt-output", "").strip()

        form_data = {
            "title": title,
            "categories": categories,
            "description": description,
            "body": body,
            "output_preview": output_preview,
        }

        if not title or not description or not body:
            flash("Please complete all required fields.", "error")
        elif not categories:
            flash("Please select at least 1 category.", "error")
        elif len(categories) > 3:
            flash("You can select up to 3 categories only.", "error")
        else:
            prompt = Prompt(
                title=title,
                category=categories[0],
                subcategory=categories[1] if len(categories) > 1 else None,
                description=description,
                body=body,
                output_preview=output_preview or None,
                author=current_user,
            )
            db.session.add(prompt)
            db.session.commit()
            flash("Prompt published successfully.", "success")
            return redirect(url_for("main.submit_prompt"))

    return render_template("submit-prompt.html", form_data=form_data)


@main_bp.route("/logout", methods=["POST"])
def logout():
    logout_user()
    flash("You have been logged out.", "success")
    return redirect(url_for("main.login"))
