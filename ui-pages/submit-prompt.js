const submitForm     = document.getElementById("submit-prompt-form");
const categoryInputs = document.querySelectorAll('input[name="categories"]');
const categoryStatus = document.getElementById("category-status");
const submitStatus   = document.getElementById("submit-status");

const titleInput    = document.getElementById("prompt-title");
const descInput     = document.getElementById("prompt-description");
const bodyInput     = document.getElementById("prompt-body");
const outputInput   = document.getElementById("prompt-output");
const skipOutputBtn = document.getElementById("skip-output-btn");

// ── Category validation ───────────────────────────────────────────────────
function updateCategoryStatus() {
    const selected = Array.from(categoryInputs).filter((i) => i.checked);
    if (categoryStatus) categoryStatus.textContent = `${selected.length} of 3 selected`;
    categoryInputs.forEach((input) => {
        input.disabled = !input.checked && selected.length >= 3;
    });
}

categoryInputs.forEach((input) => input.addEventListener("change", updateCategoryStatus));
updateCategoryStatus();

// ── Step progress ─────────────────────────────────────────────────────────
const stepCards  = Array.from(document.querySelectorAll(".submit-tip-card"));
const stepNums   = ['01', '02', '03', '04', '05'];

let outputSkipped = false;

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

// ── localStorage persistence ──────────────────────────────────────────────
const LS_KEY = "ps_user_prompts";

function slugify(value) {
    return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function savePromptToStorage(title, description, body, exampleOutput, selectedInputs) {
    const categories = selectedInputs.map((i) => i.value);
    const mainCat    = categories[0] || "General";
    const subCat     = categories[1] || mainCat;

    const entry = {
        id:             "user-" + Date.now(),
        title,
        category:       mainCat,
        categorySlug:   slugify(mainCat),
        subcategory:    subCat,
        subcategorySlug: slugify(subCat),
        author:         "demo_user",
        authorHandle:   "@demo_user",
        authorBio:      "Share great prompts and help the community learn together.",
        authorLink:     "profile.html",
        submittedAt:    new Date().toISOString(),
        keywords:       categories.map(slugify),
        description,
        prompt:         body,
        outputPreview:  exampleOutput || null,
        likes:          0,
        viewCount:      0,
        favorites:      0,
        votes:          0,
        liked:          false,
        favorited:      false,
        comments:       [],
    };

    try {
        const existing = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
        existing.unshift(entry);
        localStorage.setItem(LS_KEY, JSON.stringify(existing));
    } catch (_) {}
}

// ── Celebration overlay ───────────────────────────────────────────────────
const celOverlay  = document.getElementById("cel-overlay");
const celConfetti = document.getElementById("cel-confetti");
const celClose    = document.getElementById("cel-close");

function spawnConfetti() {
    if (!celConfetti) return;
    celConfetti.innerHTML = "";
    const colors = ["#f5a623", "#c96b31", "#ffd166", "#ef8c47", "#ff6b6b", "#4ecdc4", "#ffeaa7"];
    for (let i = 0; i < 48; i++) {
        const dot = document.createElement("div");
        dot.className = "cel-dot";
        const size = 5 + Math.random() * 8;
        dot.style.cssText = [
            `left:${Math.random() * 100}%`,
            `width:${size}px`,
            `height:${size * (Math.random() > 0.5 ? 1 : 2.2)}px`,
            `background:${colors[Math.floor(Math.random() * colors.length)]}`,
            `animation-delay:${(Math.random() * 0.7).toFixed(2)}s`,
            `animation-duration:${(0.9 + Math.random() * 0.8).toFixed(2)}s`,
            `border-radius:${Math.random() > 0.4 ? "50%" : "2px"}`,
        ].join(";");
        celConfetti.appendChild(dot);
    }
}

function showCelebration() {
    if (!celOverlay) return;
    spawnConfetti();
    celOverlay.removeAttribute("aria-hidden");
    celOverlay.classList.add("is-visible");
}

function hideCelebration() {
    if (!celOverlay) return;
    celOverlay.classList.remove("is-visible");
    celOverlay.setAttribute("aria-hidden", "true");
}

if (celClose) celClose.addEventListener("click", () => {
    hideCelebration();
    submitForm.reset();
});

// ── Submit ────────────────────────────────────────────────────────────────
if (submitForm) {
    submitForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const title         = titleInput.value.trim();
        const description   = descInput.value.trim();
        const prompt        = bodyInput.value.trim();
        const exampleOutput = outputInput ? outputInput.value.trim() : "";
        const selected      = Array.from(categoryInputs).filter((i) => i.checked);

        if (!title || !description || !prompt) {
            submitStatus.textContent = "Please complete all required fields.";
            return;
        }
        if (selected.length === 0) {
            submitStatus.textContent = "Please select at least 1 category.";
            return;
        }
        if (selected.length > 3) {
            submitStatus.textContent = "You can select up to 3 categories only.";
            return;
        }

        submitStatus.textContent = "";
        savePromptToStorage(title, description, prompt, exampleOutput, selected);
        showCelebration();
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
