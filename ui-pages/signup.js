const form = document.getElementById("signup-form");
const status = document.getElementById("signup-status");

if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirm = document.getElementById("confirm").value;

        const selectedInterests = Array.from(
            document.querySelectorAll('input[name="interests"]:checked')
        ).map((item) => item.value);

        if (!name || !email || !password || !confirm) {
            status.textContent = "Please fill all fields.";
            return;
        }

        if (password !== confirm) {
            status.textContent = "Passwords do not match.";
            return;
        }

        if (selectedInterests.length === 0) {
            status.textContent = "Please select at least one prompt interest.";
            return;
        }

        console.log("Selected interests:", selectedInterests);
        status.textContent = "Account created successfully!";
    });
}