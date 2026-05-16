const submitForm     = document.getElementById("submit-prompt-form");
const categoryInputs = document.querySelectorAll('input[name="categories"]');
const categoryStatus = document.getElementById("category-status");
const submitStatus   = document.getElementById("submit-status");
const categoryField  = document.getElementById("submit-category-field");

const titleInput    = document.getElementById("prompt-title");
const descInput     = document.getElementById("prompt-description");
const bodyInput     = document.getElementById("prompt-body");
const outputInput   = document.getElementById("prompt-output");
const skipOutputBtn = document.getElementById("skip-output-btn");

// Category validation
function updateCategoryStatus() {
    const selected = Array.from(categoryInputs).filter((i) => i.checked);
    if (categoryStatus) categoryStatus.textContent = `${selected.length} of 3 selected`;
    categoryInputs.forEach((input) => {
        input.disabled = !input.checked && selected.length >= 3;
    });
}

categoryInputs.forEach((input) => input.addEventListener("change", updateCategoryStatus));
updateCategoryStatus();

// Step progress
const stepCards  = Array.from(document.querySelectorAll(".submit-tip-card"));
const stepNums   = ['01', '02', '03', '04', '05'];

let outputSkipped = false;

function focusField(field, targetInput) {
    const target = targetInput || field;

    if (!target) {
        return;
    }

    target.scrollIntoView({
        behavior: "smooth",
        block: "center",
    });

    target.classList.remove("is-invalid");
    window.requestAnimationFrame(() => {
        target.classList.add("is-invalid");
    });

    window.setTimeout(() => {
        target.classList.remove("is-invalid");
    }, 1800);

    if (targetInput) {
        targetInput.focus({ preventScroll: true });
    }
}

function isStepDone(index) {
    switch (index) {
        case 0: return titleInput.value.trim().length > 0;
        case 1: return Array.from(categoryInputs).some((i) => i.checked);
        case 2: return descInput.value.trim().length > 0;
        case 3: return bodyInput.value.trim().length > 0;
        case 4: return outputSkipped || (outputInput && outputInput.value.trim().length > 0);
    }
    return false;
}

function updateSteps() {
    let foundActive = false;
    stepCards.forEach((card, i) => {
        const numEl = card.querySelector(".submit-tip-num");
        const done  = isStepDone(i);

        if (done) {
            card.classList.add("is-done");
            card.classList.remove("is-active", "is-pending");
            numEl.textContent = "✓";
        } else if (!foundActive) {
            // first incomplete step = active
            card.classList.add("is-active");
            card.classList.remove("is-done", "is-pending");
            numEl.textContent = stepNums[i];
            foundActive = true;
        } else {
            card.classList.add("is-pending");
            card.classList.remove("is-done", "is-active");
            numEl.textContent = stepNums[i];
        }
    });
}

// Trigger re-evaluation on any field change
titleInput.addEventListener("input",  updateSteps);
descInput.addEventListener("input",   updateSteps);
bodyInput.addEventListener("input",   updateSteps);
if (outputInput) outputInput.addEventListener("input", () => {
    outputSkipped = false;
    updateSteps();
});
categoryInputs.forEach((input) => input.addEventListener("change", updateSteps));

if (skipOutputBtn) {
    skipOutputBtn.addEventListener("click", () => {
        outputSkipped = true;
        if (outputInput) outputInput.value = "";
        updateSteps();
        skipOutputBtn.textContent = "Skipped";
        skipOutputBtn.classList.add("is-skipped");
    });
}

// Initial state: step 01 active
updateSteps();

// Submit
if (submitForm) {
    submitForm.addEventListener("submit", function (event) {
        const title         = titleInput.value.trim();
        const description   = descInput.value.trim();
        const prompt        = bodyInput.value.trim();
        const selected      = Array.from(categoryInputs).filter((i) => i.checked);

        if (!title || !description || !prompt) {
            event.preventDefault();
            submitStatus.textContent = "Please complete all required fields.";
            if (!title) {
                focusField(titleInput.closest(".submit-field"), titleInput);
                return;
            }
            if (!description) {
                focusField(descInput.closest(".submit-field"), descInput);
                return;
            }
            focusField(bodyInput.closest(".submit-field"), bodyInput);
            return;
        }
        if (selected.length === 0) {
            event.preventDefault();
            submitStatus.textContent = "Please select at least 1 category.";
            focusField(categoryField, categoryInputs[0]);
            return;
        }
        if (selected.length > 3) {
            event.preventDefault();
            submitStatus.textContent = "You can select up to 3 categories only.";
            focusField(categoryField, categoryInputs[0]);
            return;
        }

        submitStatus.textContent = "";
    });

    submitForm.addEventListener("reset", function () {
        window.setTimeout(() => {
            outputSkipped = false;
            if (skipOutputBtn) {
                skipOutputBtn.textContent = "Skip this step";
                skipOutputBtn.classList.remove("is-skipped");
            }
            updateCategoryStatus();
            submitStatus.textContent = "";
            updateSteps();
        }, 0);
    });
}
