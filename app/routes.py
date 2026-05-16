import re
from datetime import datetime, timedelta
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from .models import Comment, Prompt, User
from .extensions import db



main_bp = Blueprint("main", __name__)

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ALLOWED_AVATAR_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def _prompt_form_data_from_request():
    return {
        "title": request.form.get("prompt-title", "").strip(),
        "categories": request.form.getlist("categories"),
        "description": request.form.get("prompt-description", "").strip(),
        "body": request.form.get("prompt-body", "").strip(),
        "output_preview": request.form.get("prompt-output", "").strip(),
    }


def _prompt_form_data_from_prompt(prompt):
    categories = [prompt.category]
    if prompt.subcategory:
        categories.append(prompt.subcategory)

    return {
        "title": prompt.title,
        "categories": categories,
        "description": prompt.description,
        "body": prompt.body,
        "output_preview": prompt.output_preview or "",
    }


def _validate_prompt_form(form_data):
    if not form_data["title"] or not form_data["description"] or not form_data["body"]:
        return "Please complete all required fields."
    if not form_data["categories"]:
        return "Please select at least 1 category."
    if len(form_data["categories"]) > 3:
        return "You can select up to 3 categories only."
    return None


def _current_user_owns_prompt(prompt):
    return current_user.is_authenticated and prompt.author_id == current_user.id


def _current_user_owns_comment(comment):
    return current_user.is_authenticated and comment.user_id == current_user.id


def _profile_join_label(user):
    if user.created_at is None:
        return "Joined recently"

    if datetime.now() - user.created_at <= timedelta(days=30):
        return "Joined recently"

    return f"Joined {user.created_at.strftime('%b %Y')}"


def _profile_badge_label(user):
    if user.created_at is None:
        return "New user"

    if datetime.now() - user.created_at <= timedelta(days=30):
        return "New user"

    return "Member"


def _avatar_static_path(user):
    if user.avatar_filename:
        static_prefix = current_app.config.get("AVATAR_STATIC_PREFIX", "uploads/avatars")
        return f"{static_prefix}/{user.avatar_filename}"

    return "images/pic3.png"


def _allowed_avatar_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_AVATAR_EXTENSIONS


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
        prompts=prompts,
        join_label=_profile_join_label(profile_user),
        badge_label=_profile_badge_label(profile_user),
        avatar_static_path=_avatar_static_path(profile_user),
    )


@main_bp.route("/profile/avatar", methods=["POST"])
@login_required
def update_avatar():
    avatar = request.files.get("avatar")

    if avatar is None or not avatar.filename:
        flash("Please choose an image to upload.", "error")
        return redirect(url_for("main.profile", user=current_user.username))

    original_filename = secure_filename(avatar.filename)
    if not _allowed_avatar_file(original_filename):
        flash("Please upload a PNG, JPG, GIF, or WebP image.", "error")
        return redirect(url_for("main.profile", user=current_user.username))

    extension = original_filename.rsplit(".", 1)[1].lower()
    filename = f"user-{current_user.id}-{uuid4().hex}.{extension}"
    upload_folder = Path(current_app.config["AVATAR_UPLOAD_FOLDER"])
    upload_folder.mkdir(parents=True, exist_ok=True)
    avatar.save(upload_folder / filename)

    if current_user.avatar_filename:
        previous_avatar = upload_folder / current_user.avatar_filename
        if previous_avatar.exists():
            previous_avatar.unlink()

    current_user.avatar_filename = filename
    db.session.commit()

    flash("Profile photo updated.", "success")
    return redirect(url_for("main.profile", user=current_user.username))


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
    prompt = db.get_or_404(Prompt, prompt_id)
    comments = Comment.query.filter_by(prompt_id=prompt.id).order_by(Comment.created_at.asc()).all()
    return render_template("prompt-detail.html", prompt=prompt, comments=comments)

@main_bp.route("/prompt/<int:prompt_id>/comment", methods=["POST"])
@login_required
def add_comment(prompt_id):
    prompt = db.get_or_404(Prompt, prompt_id)
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


@main_bp.route("/comment/<int:comment_id>/edit", methods=["POST"])
@login_required
def edit_comment(comment_id):
    comment = db.get_or_404(Comment, comment_id)

    if not _current_user_owns_comment(comment):
        flash("You can only edit your own comments.", "error")
        return redirect(url_for("main.prompt_detail", prompt_id=comment.prompt_id))

    body = (request.form.get("comment") or request.form.get("body") or "").strip()

    if not body:
        flash("Comment cannot be empty.", "error")
        return redirect(url_for("main.prompt_detail", prompt_id=comment.prompt_id))

    comment.body = body
    db.session.commit()

    flash("Comment updated successfully.", "success")
    return redirect(url_for("main.prompt_detail", prompt_id=comment.prompt_id))


@main_bp.route("/comment/<int:comment_id>/delete", methods=["POST"])
@login_required
def delete_comment(comment_id):
    comment = db.get_or_404(Comment, comment_id)
    prompt_id = comment.prompt_id

    if not _current_user_owns_comment(comment):
        flash("You can only delete your own comments.", "error")
        return redirect(url_for("main.prompt_detail", prompt_id=prompt_id))

    db.session.delete(comment)
    db.session.commit()

    flash("Comment deleted successfully.", "success")
    return redirect(url_for("main.prompt_detail", prompt_id=prompt_id))

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
        form_data = _prompt_form_data_from_request()
        validation_error = _validate_prompt_form(form_data)

        if validation_error:
            flash(validation_error, "error")
        else:
            prompt = Prompt(
                title=form_data["title"],
                category=form_data["categories"][0],
                subcategory=form_data["categories"][1] if len(form_data["categories"]) > 1 else None,
                description=form_data["description"],
                body=form_data["body"],
                output_preview=form_data["output_preview"] or None,
                author=current_user,
            )
            db.session.add(prompt)
            db.session.commit()
            flash("Prompt published successfully.", "success")
            return redirect(url_for("main.submit_prompt"))

    return render_template("submit-prompt.html", form_data=form_data)


@main_bp.route("/prompt/<int:prompt_id>/edit", methods=["GET", "POST"])
@login_required
def edit_prompt(prompt_id):
    prompt = db.get_or_404(Prompt, prompt_id)

    if not _current_user_owns_prompt(prompt):
        flash("You can only edit your own prompts.", "error")
        return redirect(url_for("main.prompt_detail", prompt_id=prompt.id))

    form_data = _prompt_form_data_from_prompt(prompt)

    if request.method == "POST":
        form_data = _prompt_form_data_from_request()
        validation_error = _validate_prompt_form(form_data)

        if validation_error:
            flash(validation_error, "error")
        else:
            prompt.title = form_data["title"]
            prompt.category = form_data["categories"][0]
            prompt.subcategory = form_data["categories"][1] if len(form_data["categories"]) > 1 else None
            prompt.description = form_data["description"]
            prompt.body = form_data["body"]
            prompt.output_preview = form_data["output_preview"] or None
            db.session.commit()

            flash("Prompt updated successfully.", "success")
            return redirect(url_for("main.prompt_detail", prompt_id=prompt.id))

    return render_template(
        "submit-prompt.html",
        form_data=form_data,
        form_action=url_for("main.edit_prompt", prompt_id=prompt.id),
        form_title="Edit Prompt",
        hero_title="Edit this prompt",
        submit_label="Save Changes",
    )


@main_bp.route("/prompt/<int:prompt_id>/delete", methods=["POST"])
@login_required
def delete_prompt(prompt_id):
    prompt = db.get_or_404(Prompt, prompt_id)

    if not _current_user_owns_prompt(prompt):
        flash("You can only delete your own prompts.", "error")
        return redirect(url_for("main.prompt_detail", prompt_id=prompt.id))

    db.session.delete(prompt)
    db.session.commit()

    flash("Prompt deleted successfully.", "success")
    return redirect(url_for("main.feed"))


@main_bp.route("/logout", methods=["POST"])
def logout():
    logout_user()
    flash("You have been logged out.", "success")
    return redirect(url_for("main.login"))
