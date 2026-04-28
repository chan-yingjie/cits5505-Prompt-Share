const signupForm = document.getElementById("signup-form");
const signupStatus = document.getElementById("signup-status");
const interestInputs = document.querySelectorAll('input[name="interests"]');
const passwordToggles = document.querySelectorAll(".password-toggle");

passwordToggles.forEach(function (button) {
  button.addEventListener("click", function () {
    const targetId = button.getAttribute("data-target");
    const input = document.getElementById(targetId);

    if (!input) {
      return;
    }

    input.type = input.type === "password" ? "text" : "password";
  });
});

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

if (signupForm) {
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

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
      signupStatus.textContent = "Please fill all fields.";
      return;
    }

    if (password !== confirm) {
      signupStatus.textContent = "Passwords do not match.";
      return;
    }

    if (selectedInterests.length === 0) {
      signupStatus.textContent = "Please select at least one interest.";
      return;
    }

    signupStatus.textContent = "Account created successfully!";
  });
}