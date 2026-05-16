"""Selenium end-to-end tests.

These tests automatically start a live Flask server on port 5050, then drive a
headless Chrome browser against it.  Chrome must be installed; ChromeDriver is
downloaded automatically by webdriver-manager.

Run with:
    pytest tests/test_selenium.py -v
"""

import os
import tempfile
import threading
import time

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models import Prompt, User

BASE_URL = "http://127.0.0.1:5050"

# Temporary SQLite file — avoids in-memory DB which is not safe across threads.
_DB_PATH = os.path.join(tempfile.gettempdir(), "cits5505_selenium_test.db")

TEST_EMAIL    = "selenium@example.com"
TEST_PASSWORD = "seleniumpass"
TEST_NAME     = "Selenium Tester"
TEST_PROMPT   = "Test Selenium Prompt"


class _SeleniumConfig:
    TESTING = True
    WTF_CSRF_ENABLED = False
    SECRET_KEY = "selenium-test-secret"
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{_DB_PATH}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    AVATAR_STATIC_PREFIX = "uploads/avatars"
    AVATAR_UPLOAD_FOLDER = os.path.join(tempfile.gettempdir(), "selenium_avatars")
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_HTTPONLY = True


def _seed(app):
    """Create one user and one prompt so all tests have something to look at."""
    with app.app_context():
        db.create_all()
        if User.query.filter_by(email=TEST_EMAIL).first():
            return
        user = User(
            username="user-selenium1",
            display_name=TEST_NAME,
            email=TEST_EMAIL,
            password_hash=generate_password_hash(TEST_PASSWORD),
        )
        db.session.add(user)
        db.session.flush()
        db.session.add(Prompt(
            title=TEST_PROMPT,
            category="Education",
            description="A prompt created for Selenium testing.",
            body="Write a Selenium test step by step.",
            author=user,
        ))
        db.session.commit()


@pytest.fixture(scope="session")
def live_server():
    """Start a real Flask server on port 5050 once for the whole test session."""
    if os.path.exists(_DB_PATH):
        os.unlink(_DB_PATH)

    app = create_app(_SeleniumConfig)
    _seed(app)

    threading.Thread(
        target=lambda: app.run(port=5050, use_reloader=False, threaded=True),
        daemon=True,
    ).start()
    time.sleep(1.5)  # Give the server time to bind

    yield app

    if os.path.exists(_DB_PATH):
        os.unlink(_DB_PATH)


@pytest.fixture
def driver(live_server):
    """Provide a fresh headless Chrome session for each test."""
    opts = Options()
    # opts.add_argument("--headless")  # 注释掉此行可显示真实浏览器窗口
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1280,800")

    drv = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=opts,
    )
    drv.implicitly_wait(5)
    yield drv
    drv.quit()


def _wait(driver, by, value, timeout=8):
    """Block until the element is present in the DOM."""
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((by, value))
    )


# ---------------------------------------------------------------------------
# Selenium Tests
# ---------------------------------------------------------------------------

def test_homepage_loads_with_navigation(driver):
    """Landing page renders the site title and primary nav links."""
    driver.get(BASE_URL + "/")

    assert "Prompt Share" in driver.title
    nav = _wait(driver, By.CLASS_NAME, "topnav")
    assert "Explore" in nav.text
    assert "Leaderboard" in nav.text


def test_feed_page_shows_seeded_prompt(driver):
    """Feed page lists the prompt that was inserted before the test session."""
    driver.get(BASE_URL + "/feed")

    _wait(driver, By.CLASS_NAME, "prompt-card")
    assert TEST_PROMPT in driver.page_source


def test_leaderboard_page_loads_and_shows_content(driver):
    """Leaderboard page loads without error and contains ranking content."""
    driver.get(BASE_URL + "/leaderboard")

    _wait(driver, By.CLASS_NAME, "topnav")
    assert "Leaderboard" in driver.page_source
    assert TEST_PROMPT in driver.page_source


def test_login_valid_credentials_redirects_to_profile(driver):
    """Correct email and password log the user in and redirect to their profile."""
    driver.get(BASE_URL + "/login")

    driver.find_element(By.ID, "email").send_keys(TEST_EMAIL)
    driver.find_element(By.ID, "password").send_keys(TEST_PASSWORD)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    # Flask redirects to /profile/<username> on success.
    _wait(driver, By.CLASS_NAME, "topnav")
    assert "/profile/" in driver.current_url


def test_login_invalid_credentials_shows_error_message(driver):
    """Wrong password keeps the user on the login page and shows an error.

    Uses text_to_be_present_in_element to wait for the server response page to
    load, avoiding a race with the pre-existing empty #login-status div.
    """
    driver.get(BASE_URL + "/login")

    driver.find_element(By.ID, "email").send_keys(TEST_EMAIL)
    driver.find_element(By.ID, "password").send_keys("wrong-password")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    # Wait until the server's flash message text appears in the status div.
    WebDriverWait(driver, 8).until(
        EC.text_to_be_present_in_element((By.ID, "login-status"), "Invalid email or password")
    )
    status = driver.find_element(By.ID, "login-status")
    assert "is-error" in status.get_attribute("class")
    assert "Invalid email or password" in status.text


def test_signup_password_mismatch_shows_error_message(driver):
    """Mismatched passwords stay on the signup page and show a validation error.

    The interest checkboxes are styled with CSS (the <input> is visually hidden);
    JavaScript click is used to bypass the interactability restriction.
    """
    driver.get(BASE_URL + "/signup")

    driver.find_element(By.ID, "name").send_keys("New Tester")
    driver.find_element(By.ID, "email").send_keys("newtester@example.com")
    driver.find_element(By.ID, "password").send_keys("password123")
    driver.find_element(By.ID, "confirm").send_keys("different-password")
    # The checkbox is visually hidden by CSS; use JS click to select it.
    checkbox = driver.find_element(By.ID, "interest-writing")
    driver.execute_script("arguments[0].click();", checkbox)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    # Wait until the server's flash message text appears in the status div.
    WebDriverWait(driver, 8).until(
        EC.text_to_be_present_in_element((By.ID, "signup-status"), "Passwords do not match")
    )
    status = driver.find_element(By.ID, "signup-status")
    assert "is-error" in status.get_attribute("class")
    assert "Passwords do not match" in status.text
