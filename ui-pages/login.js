const toggle = document.getElementById("toggle");
const password = document.getElementById("password");

if (toggle && password) {
  toggle.addEventListener("click", function () {
    const isPassword = password.type === "password";
    password.type = isPassword ? "text" : "password";
    toggle.textContent = isPassword ? "Hide" : "Show";
  });
}