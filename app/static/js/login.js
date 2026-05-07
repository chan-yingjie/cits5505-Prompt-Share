const toggle = document.getElementById("toggle");
const passwordToggles = document.querySelectorAll(".password-toggle");
document.querySelectorAll(".password-input").forEach((wrapper) => {
  const input = wrapper.querySelector("input");
  const toggle = wrapper.querySelector(".password-toggle");
  const eye = wrapper.querySelector(".icon-eye");
  const eyeOff = wrapper.querySelector(".icon-eye-off");

  toggle.addEventListener("click", () => {
    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";

    eye.style.display = isHidden ? "block" : "none";
    eyeOff.style.display = isHidden ? "none" : "block";
  });
});
const forgotBtn = document.getElementById("forgot-password-btn");
const resetModal = document.getElementById("reset-modal");
const closeResetModal = document.getElementById("close-reset-modal");
const sendCodeBtn = document.getElementById("send-code-btn");
const resetEmail = document.getElementById("reset-email");
const resetStatus = document.getElementById("reset-status");
const loginForm = document.getElementById("login-form");
const loginStatus = document.querySelector(".auth-card .auth-status");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (forgotBtn && resetModal) {
  forgotBtn.addEventListener("click", function () {
    resetModal.classList.add("show");
    resetStatus.textContent = "";
  });
}

if (closeResetModal && resetModal) {
  closeResetModal.addEventListener("click", function () {
    resetModal.classList.remove("show");
  });
}

if (sendCodeBtn) {
  sendCodeBtn.addEventListener("click", function () {
    const email = resetEmail.value.trim();

    if (!email) {
      resetStatus.textContent = "Please enter your email address.";
      return;
    }

    resetStatus.textContent = "Verification code sent to your email.";
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

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
