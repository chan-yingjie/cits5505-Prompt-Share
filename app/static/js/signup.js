/**
 * signup.js
 * Client-side behaviour for the signup page:
 *   - Password show/hide toggle for both password fields
 *   - Interest checkbox logic (max 3, "All" is mutually exclusive)
 *   - Form validation before submission (empty fields, email format,
 *     password match, interest selection)
 */

const signupForm = document.getElementById("signup-form");
const signupStatus = document.getElementById("signup-status");
const interestInputs = document.querySelectorAll('input[name="interests"]');
const passwordToggles = document.querySelectorAll(".password-toggle");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password show/hide toggle for each password field.
passwordToggles.forEach(function (button) {
  button.addEventListener("click", function () {
    const targetId = button.getAttribute("data-target");
    const input = document.getElementById(targetId);

    if (!input) {
      return;
    }

    const eyeIcon = button.querySelector(".icon-eye");
    const eyeOffIcon = button.querySelector(".icon-eye-off");

    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    button.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");

    if (eyeIcon && eyeOffIcon) {
      eyeIcon.style.display = isHidden ? "block" : "none";
      eyeOffIcon.style.display = isHidden ? "none" : "block";
    }
  });
});

// Interest checkbox logic: selecting "All" deselects others; max 3 non-All interests.
interestInputs.forEach(function (input) {
  input.addEventListener("change", function () {
    const allOption = document.querySelector('input[name="interests"][value="All"]');

    if (input.value === "All" && input.checked) {
      interestInputs.forEach(function (item) {
        if (item !== input) {
          item.checked = false;
        }
      });

      signupStatus.textContent = "";
      return;
    }

    if (input.value !== "All" && allOption) {
      allOption.checked = false;
    }

    const selected = Array.from(interestInputs).filter(function (item) {
      return item.checked;
    });

    if (selected.length > 3) {
      input.checked = false;
      signupStatus.textContent = "You can select up to 3 interests only.";
      return;
    }

    signupStatus.textContent = "";
  });
});

// Form submission validation.
if (signupForm) {
  signupForm.addEventListener("submit", function (event) {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;

    const selectedInterests = Array.from(interestInputs)
      .filter(function (item) {
        return item.checked;
      })
      .map(function (item) {
        return item.value;
      });

    if (!name || !email || !password || !confirm) {
      event.preventDefault();
      signupStatus.textContent = "Please fill all fields.";
      signupStatus.className = "auth-status is-error";
      return;
    }

    if (!emailPattern.test(email)) {
      event.preventDefault();
      signupStatus.textContent = "Please enter a valid email address.";
      signupStatus.className = "auth-status is-error";
      return;
    }

    if (password !== confirm) {
      event.preventDefault();
      signupStatus.textContent = "Passwords do not match.";
      signupStatus.className = "auth-status is-error";
      return;
    }

    if (selectedInterests.length === 0) {
      event.preventDefault();
      signupStatus.textContent = "Please select at least one interest.";
      signupStatus.className = "auth-status is-error";
      return;
    }

    signupStatus.textContent = "";
    signupStatus.className = "auth-status";
  });
}
