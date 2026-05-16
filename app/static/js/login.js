/**
 * login.js
 * Client-side behaviour for the login page:
 *   - Password show/hide toggle
 *   - Basic field validation before form submission (email format, empty fields)
 */

document.querySelectorAll(".password-input").forEach((wrapper) => {
  const input = wrapper.querySelector("input");
  const toggle = wrapper.querySelector(".password-toggle");
  const eye = wrapper.querySelector(".icon-eye");
  const eyeOff = wrapper.querySelector(".icon-eye-off");

  if (!input || !toggle || !eye || !eyeOff) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";
    toggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");

    eye.style.display = isHidden ? "block" : "none";
    eyeOff.style.display = isHidden ? "none" : "block";
  });
});

const loginForm = document.getElementById("login-form");
const loginStatus = document.querySelector(".auth-card .auth-status");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    // Block submission and show inline error if fields are empty or email is invalid.
    if (!email || !password) {
      event.preventDefault();

      if (loginStatus) {
        loginStatus.textContent = "Please enter both email and password.";
        loginStatus.className = "auth-status is-error";
      }
      return;
    }

    if (!emailPattern.test(email)) {
      event.preventDefault();

      if (loginStatus) {
        loginStatus.textContent = "Please enter a valid email address.";
        loginStatus.className = "auth-status is-error";
      }
    }
  });
}
