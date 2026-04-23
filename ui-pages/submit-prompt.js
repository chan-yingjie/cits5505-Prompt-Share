const submitForm = document.getElementById("submit-prompt-form");
const categoryInputs = document.querySelectorAll('input[name="categories"]');
const categoryStatus = document.getElementById("category-status");
const submitStatus = document.getElementById("submit-status");

function updateCategoryStatus() {
    const selected = Array.from(categoryInputs).filter((input) => input.checked);

    if (categoryStatus) {
        categoryStatus.textContent = `${selected.length} of 3 selected`;
    }

    categoryInputs.forEach((input) => {
        if (!input.checked && selected.length >= 3) {
            input.disabled = true;
            return;
        }

        input.disabled = false;
    });
}

categoryInputs.forEach((input) => {
    input.addEventListener("change", updateCategoryStatus);
});

updateCategoryStatus();

if (submitForm) {
    submitForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = document.getElementById("prompt-title").value.trim();
        const description = document.getElementById("prompt-description").value.trim();
        const prompt = document.getElementById("prompt-body").value.trim();
        const selectedCategories = Array.from(categoryInputs)
            .filter((input) => input.checked)
            .map((input) => input.value);

        if (!title || !description || !prompt) {
            submitStatus.textContent = "Please complete all required fields.";
            return;
        }

        if (selectedCategories.length === 0) {
            submitStatus.textContent = "Please select at least 1 category.";
            return;
        }

        if (selectedCategories.length > 3) {
            submitStatus.textContent = "You can select up to 3 categories only.";
            return;
        }

        submitStatus.textContent = "Prompt submitted successfully.";
    });

    submitForm.addEventListener("reset", function () {
        window.setTimeout(() => {
            updateCategoryStatus();
            submitStatus.textContent = "";
        }, 0);
    });
}