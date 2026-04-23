const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("login-password");
const passwordToggle = document.getElementById("password-toggle");
const loginStatus = document.getElementById("login-status");

if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", function () {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        passwordToggle.textContent = isPassword ? "🙈" : "👁";
        passwordToggle.setAttribute(
            "aria-label",
            isPassword ? "Hide password" : "Show password"
        );
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            loginStatus.textContent = "Please enter both email and password.";
            return;
        }

        loginStatus.textContent = "Login submitted successfully.";
    });
}