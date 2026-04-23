const params = new URLSearchParams(window.location.search);
const promptId = params.get("prompt") || params.get("id");
let promptData = Array.isArray(window.promptFeedData)
    ? window.promptFeedData.find((item) => item.id === promptId) || window.promptFeedData[0]
    : null;

const titleEl = document.getElementById("detail-title");
const authorEl = document.getElementById("detail-author");
const authorAvatarEl = document.getElementById("detail-author-avatar");
const submittedAtEl = document.getElementById("detail-submitted-at");
const categoryEl = document.getElementById("detail-category");
const promptEl = document.getElementById("detail-prompt");
const outputPreviewEl = document.getElementById("detail-output-preview");
const outputToggleButton = document.getElementById("output-toggle-button");
const outputToggleLabel = document.querySelector(".output-toggle-label");
const summaryLikesEl = document.getElementById("summary-likes");
const summaryCommentsEl = document.getElementById("summary-comments");
const summaryViewsEl = document.getElementById("summary-views");
const summaryFavoritesEl = document.getElementById("summary-favorites");
const commentListEl = document.getElementById("comment-list");
const commentsToggleButton = document.getElementById("comments-toggle-button");
const commentLikeButton = document.getElementById("comment-like-button");
const commentFavoriteButton = document.getElementById("comment-favorite-button");
const shareStatusEl = document.getElementById("share-status");
const savePromptButton = document.getElementById("save-prompt-button");
const copyLinkButton = document.getElementById("copy-link-button");
const useChatGPTButton = document.getElementById("use-chatgpt-button");
const customizePromptTrigger = document.getElementById("customize-prompt-trigger");
const clearCustomPromptButton = document.getElementById("clear-custom-prompt-button");
const customizeFeedback = document.getElementById("customize-feedback");
const customPromptInput = document.getElementById("custom-prompt-input");
const detailCommentForm = document.getElementById("detail-comment-form");
const detailCommentInput = document.getElementById("detail-comment-input");
let commentsExpanded = false;
let outputExpanded = false;
let hasRecordedView = false;
let feedbackTimeoutId = null;
let buttonHintTimeoutId = null;
let originalPromptText = "";
let savedPromptText = "";

function autoResizeTextarea(element) {
    if (!element) {
        return;
    }

    element.style.height = "";
    const maxHeight = element === customPromptInput ? 420 : 220;
    const minHeight = element === customPromptInput ? 420 : 10;
    const nextHeight = Math.max(minHeight, Math.min(element.scrollHeight, maxHeight));
    element.style.height = `${nextHeight}px`;
}

function showFeedback(element, message) {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.remove("is-hidden");
    element.classList.add("show");

    if (feedbackTimeoutId) {
        window.clearTimeout(feedbackTimeoutId);
    }

    feedbackTimeoutId = window.setTimeout(() => {
        element.classList.remove("show");
        window.setTimeout(() => {
            element.classList.add("is-hidden");
        }, 300);
    }, 2000);
}

function hintButton(button) {
    if (!button) {
        return;
    }

    button.classList.add("is-suggested");

    if (buttonHintTimeoutId) {
        window.clearTimeout(buttonHintTimeoutId);
    }

    buttonHintTimeoutId = window.setTimeout(() => {
        button.classList.remove("is-suggested");
    }, 2200);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatSubmittedAt(value) {
    if (!value) {
        return "Submission time unavailable";
    }

    const submittedAt = new Date(value);
    if (Number.isNaN(submittedAt.getTime())) {
        return value;
    }

    return submittedAt.toLocaleString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function getAuthorTone(author) {
    const tones = ["warm", "forest", "sea", "sunset"];
    const toneScore = Array.from(author).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return tones[toneScore % tones.length];
}

function getAuthorInitials(author) {
    return author.slice(0, 2).toUpperCase();
}

function getProfileHref(value) {
    if (!value) {
        return "profile.html";
    }

    if (value.startsWith("../")) {
        return value.slice(3);
    }

    return value;
}

function buildShareUrl(prompt) {
    const shareUrl = new URL(window.location.href);
    shareUrl.search = `?prompt=${prompt.id}`;
    shareUrl.hash = "";
    return shareUrl.toString();
}

function getUiIcon(name) {
    const icons = {
        clock: `
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="7.25" fill="#F3F4F6" stroke="#6B7280" stroke-width="1.5"></circle>
                <path d="M10 5.8v4.5l3 1.8" stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        `,
        eye: `
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M2.4 10s2.8-4.6 7.6-4.6S17.6 10 17.6 10s-2.8 4.6-7.6 4.6S2.4 10 2.4 10Z" fill="#E8F1FF" stroke="#5A7FDB" stroke-width="1.5" stroke-linejoin="round"></path>
                <circle cx="10" cy="10" r="2.3" fill="#5A7FDB"></circle>
                <circle cx="10.8" cy="9.2" r="0.7" fill="#FFFFFF"></circle>
            </svg>
        `,
        comment: `
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4.2 5.4h11.6a1.8 1.8 0 0 1 1.8 1.8v5.4a1.8 1.8 0 0 1-1.8 1.8H9l-3.8 2.6v-2.6H4.2a1.8 1.8 0 0 1-1.8-1.8V7.2a1.8 1.8 0 0 1 1.8-1.8Z" fill="#EEF2FF" stroke="#7C3AED" stroke-width="1.5" stroke-linejoin="round"></path>
            </svg>
        `,
        heart: `
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 16.2 4.6 11a3.5 3.5 0 0 1 4.9-5l.5.5.5-.5a3.5 3.5 0 0 1 4.9 5L10 16.2Z" fill="#EF5A6F" stroke="#D63C56" stroke-width="0.8"></path>
            </svg>
        `,
        star: `
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="m10 3.1 2 4 4.5.7-3.2 3.1.8 4.5-4.1-2.1-4.1 2.1.8-4.5L3.5 7.8l4.5-.7 2-4Z" fill="#F6C453" stroke="#D89B15" stroke-width="0.8"></path>
            </svg>
        `,
        trash: `
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5.8 6.4h8.4" stroke="#6B7280" stroke-width="1.7" stroke-linecap="round"></path>
                <path d="M7.2 6.4V5.5a1.3 1.3 0 0 1 1.3-1.3h3a1.3 1.3 0 0 1 1.3 1.3v.9" stroke="#6B7280" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M7 8.2v6.1a1.4 1.4 0 0 0 1.4 1.4h3.2a1.4 1.4 0 0 0 1.4-1.4V8.2" stroke="#6B7280" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M8.9 9.6v4.1M11.1 9.6v4.1" stroke="#6B7280" stroke-width="1.7" stroke-linecap="round"></path>
            </svg>
        `
    };

    return icons[name] || icons.eye;
}

function slugify(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getPromptTaxonomy(prompt) {
    const categoryLabel = prompt.category || "General";
    const subcategoryLabel = prompt.subcategory || "General";
    return {
        categoryLabel,
        categorySlug: prompt.categorySlug || slugify(categoryLabel),
        subcategoryLabel,
        subcategorySlug: prompt.subcategorySlug || slugify(subcategoryLabel)
    };
}

function getCategoryToneClass(categorySlug) {
    const toneMap = {
        education: "detail-category-pill-education",
        video: "detail-category-pill-video",
        image: "detail-category-pill-image",
        writing: "detail-category-pill-writing"
    };

    return toneMap[categorySlug] || "detail-category-pill-general";
}

function buildAuthorLink(prompt, options = {}) {
    const { includeByPrefix = true } = options;
    const authorLink = escapeHtml(getProfileHref(prompt.authorLink));

    return `
        <a class="author-link" href="${authorLink}">
            <span>${includeByPrefix ? `by ${escapeHtml(prompt.author)}` : escapeHtml(prompt.author)}</span>
            <span class="author-popover">
                <span class="author-popover-note">Click to view author</span>
            </span>
        </a>
    `;
}

function renderComments(comments) {
    if (!comments.length) {
        commentListEl.innerHTML = '<div class="empty-state">No comments available yet.</div>';
        return;
    }

    commentListEl.innerHTML = comments.map((comment, index) => `
        <article class="comment-card">
            <div class="comment-meta">
                <div class="comment-meta-main">
                    <span class="comment-author">${comment.author}</span>
                    <span class="meta-pill">${comment.handle}</span>
                </div>
                <button class="comment-delete" type="button" data-delete-comment="${index}">Delete</button>
            </div>
            <p class="comment-body">${comment.body}</p>
        </article>
    `).join("");
}

function renderOutput(lines) {
    const outputEl = document.getElementById("detail-output");
    if (!outputEl) {
        return;
    }
    outputEl.innerHTML = lines.map((line) => `
        <p class="output-paragraph">${line}</p>
    `).join("");
}

function renderOutputPreview(prompt) {
    if (!prompt || !outputPreviewEl) {
        return;
    }

    const preview = prompt.outputPreview || "No preview available for this prompt.";
    outputPreviewEl.innerHTML = `<p class="output-paragraph">${escapeHtml(preview)}</p>`;
}

function syncOutputVisibility() {
    if (!outputPreviewEl || !outputToggleButton) {
        return;
    }

    outputPreviewEl.classList.toggle("is-hidden", !outputExpanded);
    if (outputToggleLabel) {
        outputToggleLabel.textContent = outputExpanded ? "Hide example output" : "Show example output";
    }
    outputToggleButton.setAttribute("aria-expanded", outputExpanded ? "true" : "false");
}

function renderDetail(prompt) {
    if (!prompt) {
        titleEl.textContent = "Prompt not found";
        commentListEl.innerHTML = '<div class="empty-state">No prompt data available.</div>';
        return;
    }
    const commentsTotal = prompt.comments.length;
    const taxonomy = getPromptTaxonomy(prompt);

    document.title = `${prompt.title} | Prompt Detail`;
    titleEl.textContent = prompt.title;
    authorEl.innerHTML = buildAuthorLink(prompt, { includeByPrefix: false });
    authorAvatarEl.textContent = escapeHtml(getAuthorInitials(prompt.author));
    authorAvatarEl.className = `detail-author-avatar author-tone-${getAuthorTone(prompt.author)}`;
    submittedAtEl.innerHTML = `
        <span class="meta-icon" aria-hidden="true">${getUiIcon("clock")}</span>
        <span>${escapeHtml(formatSubmittedAt(prompt.submittedAt))}</span>
    `;
    const categoryPills = [
        `<a class="detail-category-pill ${getCategoryToneClass(taxonomy.categorySlug)}" href="feed.html?category=${encodeURIComponent(taxonomy.categorySlug)}">${escapeHtml(taxonomy.categoryLabel)}</a>`
    ];

    if (taxonomy.subcategoryLabel.toLowerCase() !== taxonomy.categoryLabel.toLowerCase()) {
        categoryPills.push(
            `<a class="detail-category-pill detail-category-pill-subtle" href="feed.html?category=${encodeURIComponent(taxonomy.categorySlug)}&subcategory=${encodeURIComponent(taxonomy.subcategorySlug)}">${escapeHtml(taxonomy.subcategoryLabel)}</a>`
        );
    }

    categoryEl.innerHTML = categoryPills.join("");
    promptEl.textContent = prompt.prompt;
    renderOutputPreview(prompt);
    syncOutputVisibility();
    summaryLikesEl.textContent = String(prompt.likes);
    summaryCommentsEl.textContent = String(commentsTotal);
    summaryViewsEl.textContent = String(prompt.viewCount || 0);
    summaryFavoritesEl.textContent = String(prompt.favorites || 0);
    const metricIcons = document.querySelectorAll(".detail-header-metrics .metric-icon");
    if (metricIcons.length >= 4) {
        metricIcons[0].innerHTML = getUiIcon("eye");
        metricIcons[1].innerHTML = getUiIcon("comment");
        metricIcons[2].innerHTML = getUiIcon("heart");
        metricIcons[3].innerHTML = getUiIcon("star");
    }

    renderComments(prompt.comments);
    commentListEl.classList.toggle("is-hidden", !commentsExpanded);
    commentsToggleButton.innerHTML = getUiIcon("comment");
    commentsToggleButton.classList.toggle("is-active", commentsExpanded);
    commentsToggleButton.setAttribute("aria-label", commentsExpanded ? "Hide comments" : `View comments (${commentsTotal})`);
    commentLikeButton.innerHTML = getUiIcon("heart");
    commentLikeButton.classList.toggle("is-active", Boolean(prompt.liked));
    commentFavoriteButton.innerHTML = getUiIcon("star");
    commentFavoriteButton.classList.toggle("is-active", Boolean(prompt.favorited));
}

document.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-comment]");

    if (deleteButton && promptData) {
        const commentIndex = Number(deleteButton.dataset.deleteComment);
        if (!Number.isNaN(commentIndex)) {
            const confirmed = window.confirm("Delete this comment?");
            if (!confirmed) {
                return;
            }
            promptData.comments.splice(commentIndex, 1);
            renderDetail(promptData);
        }
        return;
    }
});

async function openInChatGPT() {
    if (!promptData) {
        return;
    }

    const promptText = customPromptInput ? customPromptInput.value.trim() : promptData.prompt;
    if (!promptText) {
        showFeedback(customizeFeedback, "Add prompt text first");
        return;
    }

    try {
        await navigator.clipboard.writeText(promptText);
        showFeedback(customizeFeedback, "Copied");
    } catch (error) {
        showFeedback(customizeFeedback, "Opened ChatGPT");
    }

    window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer");
}

useChatGPTButton.addEventListener("click", openInChatGPT);

commentsToggleButton.addEventListener("click", () => {
    commentsExpanded = !commentsExpanded;
    commentListEl.classList.toggle("is-hidden", !commentsExpanded);
    commentsToggleButton.classList.toggle("is-active", commentsExpanded);
    commentsToggleButton.setAttribute("aria-label", commentsExpanded
        ? "Hide comments"
        : `View comments (${promptData ? promptData.comments.length : 0})`);
});

commentLikeButton.addEventListener("click", () => {
    if (!promptData) {
        return;
    }

    promptData.liked = !promptData.liked;
    promptData.likes += promptData.liked ? 1 : -1;
    renderDetail(promptData);
});

commentFavoriteButton.addEventListener("click", () => {
    if (!promptData) {
        return;
    }

    promptData.favorited = !promptData.favorited;
    promptData.favorites = Math.max(0, (promptData.favorites || 0) + (promptData.favorited ? 1 : -1));
    renderDetail(promptData);
});

if (outputToggleButton) {
    outputToggleButton.addEventListener("click", () => {
        outputExpanded = !outputExpanded;
        syncOutputVisibility();
    });
}

if (savePromptButton) {
    savePromptButton.addEventListener("click", () => {
        if (!customPromptInput) {
            return;
        }

        savedPromptText = customPromptInput.value.trim() || originalPromptText;
        showFeedback(customizeFeedback, "Saved");
        hintButton(copyLinkButton);
    });
}

copyLinkButton.addEventListener("click", async () => {
    const promptText = savedPromptText || originalPromptText || (customPromptInput ? customPromptInput.value.trim() : "");
    if (!promptText) {
        showFeedback(customizeFeedback, "Add prompt text first");
        return;
    }

    try {
        await navigator.clipboard.writeText(promptText);
        showFeedback(customizeFeedback, "Copied to clipboard");
        hintButton(useChatGPTButton);
    } catch (error) {
        showFeedback(customizeFeedback, "Copy manually");
    }
});

if (customPromptInput) {
    customPromptInput.addEventListener("input", () => {
        autoResizeTextarea(customPromptInput);
    });

    customPromptInput.value = "";
    autoResizeTextarea(customPromptInput);
}

if (customizePromptTrigger) {
    customizePromptTrigger.addEventListener("click", async () => {
        if (!promptData || !customPromptInput) {
            return;
        }

        const promptText = promptData.prompt || "";
        originalPromptText = promptText;
        savedPromptText = promptText;
        customPromptInput.value = promptText;
        autoResizeTextarea(customPromptInput);

        try {
            await navigator.clipboard.writeText(promptText);
            showFeedback(customizeFeedback, "Copied");
        } catch (error) {
            showFeedback(customizeFeedback, "Loaded");
        }
    });
}

if (clearCustomPromptButton) {
    clearCustomPromptButton.addEventListener("click", () => {
        if (!customPromptInput) {
            return;
        }

        customPromptInput.value = "";
        autoResizeTextarea(customPromptInput);
        showFeedback(customizeFeedback, "Cleared");
    });
}

detailCommentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!promptData) {
        return;
    }

    const body = detailCommentInput.value.trim();
    if (!body) {
        return;
    }

    promptData.comments.unshift({
        author: "you",
        handle: "@you",
        body
    });

    detailCommentInput.value = "";
    autoResizeTextarea(detailCommentInput);
    commentsExpanded = true;
    renderDetail(promptData);
});

detailCommentInput.addEventListener("input", () => {
    autoResizeTextarea(detailCommentInput);
});

detailCommentInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        detailCommentForm.requestSubmit();
    }
});

if (promptData && !hasRecordedView) {
    promptData.viewCount = (promptData.viewCount || 0) + 1;
    hasRecordedView = true;
}

renderDetail(promptData);
autoResizeTextarea(detailCommentInput);
