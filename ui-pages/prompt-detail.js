const COMMENT_STORAGE_KEY = "prompt-share-comments-v1";
const params = new URLSearchParams(window.location.search);
const promptId = params.get("prompt") || params.get("id");

function normalizeComment(comment) {
    if (!comment || typeof comment !== "object") {
        return null;
    }

    const author = String(comment.author || "").trim() || "anonymous";
    const handle = String(comment.handle || "").trim() || "@anonymous";
    const body = String(comment.body || "").trim();

    if (!body) {
        return null;
    }

    return {
        author,
        handle,
        body
    };
}

function getStoredCommentsMap() {
    try {
        const storedValue = window.localStorage.getItem(COMMENT_STORAGE_KEY);
        if (!storedValue) {
            return {};
        }

        const parsed = JSON.parse(storedValue);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
        return {};
    }
}

function setStoredCommentsMap(nextMap) {
    try {
        window.localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(nextMap));
    } catch (error) {
        return;
    }
}

function hydratePromptComments() {
    if (!Array.isArray(window.promptFeedData)) {
        return;
    }

    const storedCommentsMap = getStoredCommentsMap();

    window.promptFeedData.forEach((prompt) => {
        const bundledComments = Array.isArray(prompt.comments)
            ? prompt.comments.map(normalizeComment).filter(Boolean)
            : [];
        const storedComments = Array.isArray(storedCommentsMap[prompt.id])
            ? storedCommentsMap[prompt.id].map(normalizeComment).filter(Boolean)
            : null;

        prompt.comments = storedComments || bundledComments;
    });
}

function persistPromptComments(prompt) {
    if (!prompt || !prompt.id) {
        return;
    }

    const storedCommentsMap = getStoredCommentsMap();
    storedCommentsMap[prompt.id] = Array.isArray(prompt.comments)
        ? prompt.comments.map(normalizeComment).filter(Boolean)
        : [];
    setStoredCommentsMap(storedCommentsMap);
}

hydratePromptComments();

let promptData = Array.isArray(window.promptFeedData)
    ? (promptId ? window.promptFeedData.find((item) => item.id === promptId) || null : window.promptFeedData[0] || null)
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
const shareLinkButton = document.getElementById("share-link-button");
const useChatGPTButton = document.getElementById("use-chatgpt-button");
const customizePromptTrigger = document.getElementById("customize-prompt-trigger");
const clearCustomPromptButton = document.getElementById("clear-custom-prompt-button");
const customizeFeedback = document.getElementById("customize-feedback");
const actionFeedback = document.getElementById("action-feedback");
const customPromptInput = document.getElementById("custom-prompt-input");
const detailCommentForm = document.getElementById("detail-comment-form");
const detailCommentInput = document.getElementById("detail-comment-input");
let commentsExpanded = false;
let outputExpanded = false;
let hasRecordedView = false;
let feedbackTimeoutId = null;
let buttonHintTimeoutId = null;
let activeFeedbackElement = null;
let originalPromptText = "";
let savedPromptText = "";
let hasCustomizedPrompt = false;
let editingCommentIndex = null;

const customActionButtons = [
    savePromptButton,
    copyLinkButton,
    useChatGPTButton
].filter(Boolean);

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

    if (activeFeedbackElement && activeFeedbackElement !== element) {
        activeFeedbackElement.classList.remove("show");
        activeFeedbackElement.classList.add("is-hidden");
    }

    element.textContent = message;
    element.classList.remove("is-hidden");
    element.classList.add("show");
    activeFeedbackElement = element;

    if (feedbackTimeoutId) {
        window.clearTimeout(feedbackTimeoutId);
    }

    feedbackTimeoutId = window.setTimeout(() => {
        element.classList.remove("show");
        window.setTimeout(() => {
            element.classList.add("is-hidden");
            if (activeFeedbackElement === element) {
                activeFeedbackElement = null;
            }
        }, 300);
    }, 2000);
}

function hintButton(button) {
    if (!button) {
        return;
    }

    if (button.disabled) {
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

function syncCustomPromptControls() {
    const isEnabled = hasCustomizedPrompt && Boolean(promptData);

    customActionButtons.forEach((button) => {
        button.disabled = !isEnabled;
        button.classList.toggle("is-disabled", !isEnabled);
    });

    if (customPromptInput) {
        customPromptInput.readOnly = !isEnabled;
        customPromptInput.classList.toggle("is-disabled", !isEnabled);
    }
}

function resetCustomPromptState() {
    hasCustomizedPrompt = false;
    originalPromptText = "";
    savedPromptText = "";

    if (customPromptInput) {
        customPromptInput.value = "";
        autoResizeTextarea(customPromptInput);
    }

    syncCustomPromptControls();
}

function loadCustomPrompt(text) {
    const promptText = String(text || "").trim();

    hasCustomizedPrompt = Boolean(promptText);
    originalPromptText = promptText;
    savedPromptText = promptText;

    if (customPromptInput) {
        customPromptInput.value = promptText;
        autoResizeTextarea(customPromptInput);
    }

    syncCustomPromptControls();
}

function requireCustomizedPrompt(message = "Click Customize Prompt first") {
    if (!hasCustomizedPrompt) {
        showFeedback(customizeFeedback, message);
        return false;
    }

    return true;
}

function getEditablePromptText() {
    if (!requireCustomizedPrompt()) {
        return "";
    }

    return customPromptInput ? customPromptInput.value.trim() : "";
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
        share: `
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M12.4 4.7h2.9v2.9" stroke="#5A7FDB" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M8.2 11.8 15.3 4.7" stroke="#5A7FDB" stroke-width="1.6" stroke-linecap="round"></path>
                <path d="M15 10.2v4.1a1.3 1.3 0 0 1-1.3 1.3H5.7a1.3 1.3 0 0 1-1.3-1.3V6.3A1.3 1.3 0 0 1 5.7 5h4.1" stroke="#5A7FDB" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
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
                <div class="comment-card-actions">
                    ${editingCommentIndex === index ? `
                        <button class="comment-action-button comment-action-button-primary" type="button" data-save-comment="${index}">Save</button>
                        <button class="comment-action-button" type="button" data-cancel-edit-comment="${index}">Cancel</button>
                    ` : `
                        <button class="comment-action-button" type="button" data-edit-comment="${index}">Edit</button>
                        <button class="comment-action-button comment-action-button-danger" type="button" data-delete-comment="${index}">Delete</button>
                    `}
                </div>
            </div>
            ${editingCommentIndex === index ? `
                <textarea class="form-input form-area comment-edit-input" data-edit-comment-input="${index}" rows="3">${escapeHtml(comment.body)}</textarea>
            ` : `
                <p class="comment-body">${escapeHtml(comment.body)}</p>
            `}
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

    const isUserSubmitted = typeof prompt.id === "string" && prompt.id.startsWith("user-");
    const fallback = isUserSubmitted
        ? "The author hasn't provided an example output for this prompt."
        : "No preview available for this prompt.";
    const preview = prompt.outputPreview || fallback;
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
        document.title = "Prompt not found | Prompt Share";
        titleEl.textContent = "Prompt not found";
        authorEl.textContent = "Unknown author";
        authorAvatarEl.textContent = "--";
        submittedAtEl.textContent = "This prompt link is invalid or no longer available.";
        categoryEl.innerHTML = "";
        promptEl.textContent = "Check the link and return to the feed to choose another prompt.";
        outputPreviewEl.innerHTML = "";
        outputPreviewEl.classList.add("is-hidden");
        outputToggleButton.setAttribute("aria-expanded", "false");
        outputToggleButton.disabled = true;
        outputToggleButton.classList.add("is-disabled");
        if (outputToggleLabel) {
            outputToggleLabel.textContent = "Example output unavailable";
        }
        summaryLikesEl.textContent = "0";
        summaryCommentsEl.textContent = "0";
        summaryViewsEl.textContent = "0";
        summaryFavoritesEl.textContent = "0";
        commentListEl.innerHTML = '<div class="empty-state">No prompt data available.</div>';
        commentListEl.classList.remove("is-hidden");
        commentsToggleButton.disabled = true;
        commentLikeButton.disabled = true;
        commentFavoriteButton.disabled = true;
        if (shareLinkButton) {
            shareLinkButton.disabled = true;
            shareLinkButton.classList.add("is-disabled");
            shareLinkButton.innerHTML = getUiIcon("share");
        }
        resetCustomPromptState();
        if (shareStatusEl) {
            shareStatusEl.textContent = "";
        }
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
    outputToggleButton.disabled = false;
    outputToggleButton.classList.remove("is-disabled");
    commentsToggleButton.disabled = false;
    commentLikeButton.disabled = false;
    commentFavoriteButton.disabled = false;
    if (shareLinkButton) {
        shareLinkButton.disabled = false;
        shareLinkButton.classList.remove("is-disabled");
        shareLinkButton.innerHTML = getUiIcon("share");
        shareLinkButton.setAttribute("aria-label", "Share prompt link");
    }
    syncCustomPromptControls();
    commentsToggleButton.innerHTML = getUiIcon("comment");
    commentsToggleButton.classList.toggle("is-active", commentsExpanded);
    commentsToggleButton.setAttribute("aria-label", commentsExpanded ? "Hide comments" : `View comments (${commentsTotal})`);
    commentLikeButton.innerHTML = getUiIcon("heart");
    commentLikeButton.classList.toggle("is-active", Boolean(prompt.liked));
    commentFavoriteButton.innerHTML = getUiIcon("star");
    commentFavoriteButton.classList.toggle("is-active", Boolean(prompt.favorited));
}

document.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-comment]");
    if (editButton && promptData) {
        editingCommentIndex = Number(editButton.dataset.editComment);
        renderDetail(promptData);
        const editInput = commentListEl.querySelector(`[data-edit-comment-input="${editingCommentIndex}"]`);
        if (editInput) {
            editInput.focus();
            editInput.setSelectionRange(editInput.value.length, editInput.value.length);
        }
        return;
    }

    const cancelEditButton = event.target.closest("[data-cancel-edit-comment]");
    if (cancelEditButton && promptData) {
        editingCommentIndex = null;
        renderDetail(promptData);
        showFeedback(actionFeedback, "Edit canceled");
        return;
    }

    const saveEditButton = event.target.closest("[data-save-comment]");
    if (saveEditButton && promptData) {
        const commentIndex = Number(saveEditButton.dataset.saveComment);
        const editInput = commentListEl.querySelector(`[data-edit-comment-input="${commentIndex}"]`);
        const nextBody = editInput ? editInput.value.trim() : "";

        if (!nextBody) {
            showFeedback(actionFeedback, "Comment cannot be empty");
            return;
        }

        if (promptData.comments[commentIndex]) {
            promptData.comments[commentIndex].body = nextBody;
        }
        persistPromptComments(promptData);
        editingCommentIndex = null;
        renderDetail(promptData);
        showFeedback(actionFeedback, "Comment updated");
        return;
    }

    const deleteButton = event.target.closest("[data-delete-comment]");

    if (deleteButton && promptData) {
        const commentIndex = Number(deleteButton.dataset.deleteComment);
        if (!Number.isNaN(commentIndex)) {
            const confirmed = window.confirm("Delete this comment?");
            if (!confirmed) {
                return;
            }
            promptData.comments.splice(commentIndex, 1);
            persistPromptComments(promptData);
            if (editingCommentIndex === commentIndex) {
                editingCommentIndex = null;
            } else if (editingCommentIndex !== null && commentIndex < editingCommentIndex) {
                editingCommentIndex -= 1;
            }
            renderDetail(promptData);
            showFeedback(actionFeedback, "Comment deleted");
        }
        return;
    }
});

async function openInChatGPT() {
    if (!promptData) {
        return;
    }

    const promptText = getEditablePromptText();
    if (!promptText) {
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
    showFeedback(actionFeedback, commentsExpanded ? "Comments shown" : "Comments hidden");
});

commentLikeButton.addEventListener("click", () => {
    if (!promptData) {
        return;
    }

    promptData.liked = !promptData.liked;
    promptData.likes += promptData.liked ? 1 : -1;
    renderDetail(promptData);
    showFeedback(actionFeedback, promptData.liked ? "Liked" : "Like removed");
});

commentFavoriteButton.addEventListener("click", () => {
    if (!promptData) {
        return;
    }

    promptData.favorited = !promptData.favorited;
    promptData.favorites = Math.max(0, (promptData.favorites || 0) + (promptData.favorited ? 1 : -1));
    renderDetail(promptData);
    showFeedback(actionFeedback, promptData.favorited ? "Saved to favorites" : "Removed from favorites");
});

if (outputToggleButton) {
    outputToggleButton.addEventListener("click", () => {
        outputExpanded = !outputExpanded;
        syncOutputVisibility();
    });
}

if (savePromptButton) {
    savePromptButton.addEventListener("click", () => {
        const promptText = getEditablePromptText();
        if (!promptText) {
            return;
        }

        savedPromptText = promptText;
        showFeedback(customizeFeedback, "Saved");
        hintButton(copyLinkButton);
    });
}

copyLinkButton.addEventListener("click", async () => {
    const promptText = getEditablePromptText();
    if (!promptText) {
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

if (shareLinkButton) {
    shareLinkButton.addEventListener("click", async () => {
        if (!promptData) {
            return;
        }

        const shareUrl = buildShareUrl(promptData);

        try {
            await navigator.clipboard.writeText(shareUrl);
            showFeedback(actionFeedback, "Link copied");
            hintButton(useChatGPTButton);
        } catch (error) {
            showFeedback(actionFeedback, "Copy link manually");
        }
    });
}

if (customPromptInput) {
    customPromptInput.addEventListener("input", () => {
        autoResizeTextarea(customPromptInput);
    });

    resetCustomPromptState();
}

if (customizePromptTrigger) {
    customizePromptTrigger.addEventListener("click", async () => {
        if (!promptData || !customPromptInput) {
            return;
        }

        const promptText = promptData.prompt || "";
        loadCustomPrompt(promptText);

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
        if (!hasCustomizedPrompt) {
            showFeedback(customizeFeedback, "Click Customize Prompt first");
            return;
        }

        resetCustomPromptState();
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
    persistPromptComments(promptData);

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
