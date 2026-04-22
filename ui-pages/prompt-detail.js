const params = new URLSearchParams(window.location.search);
const promptId = params.get("id");
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
const summaryLikesEl = document.getElementById("summary-likes");
const summaryCommentsEl = document.getElementById("summary-comments");
const summaryViewsEl = document.getElementById("summary-views");
const summaryFavoritesEl = document.getElementById("summary-favorites");
const commentListEl = document.getElementById("comment-list");
const commentsToggleButton = document.getElementById("comments-toggle-button");
const commentLikeButton = document.getElementById("comment-like-button");
const commentFavoriteButton = document.getElementById("comment-favorite-button");
const shareStatusEl = document.getElementById("share-status");
const copyLinkButton = document.getElementById("copy-link-button");
const useChatGPTButton = document.getElementById("use-chatgpt-button");
const detailCommentForm = document.getElementById("detail-comment-form");
const detailCommentInput = document.getElementById("detail-comment-input");
const customEditorForm = document.getElementById("custom-editor-form");
const basePromptInput = document.getElementById("base-prompt-input");
const toneInput = document.getElementById("prompt-tone");
const styleInput = document.getElementById("prompt-style");
const audienceInput = document.getElementById("prompt-audience");
const lengthInput = document.getElementById("prompt-length");
const formatInput = document.getElementById("prompt-format");
const customInstructionsInput = document.getElementById("custom-instructions-input");
const applyChangesButton = document.getElementById("apply-changes-button");
const resetEditorButton = document.getElementById("reset-editor-button");
const saveVersionButton = document.getElementById("save-version-button");
const myVersionPreview = document.getElementById("my-version-preview");
const editorStatusEl = document.getElementById("editor-status");
let commentsExpanded = false;
let hasRecordedView = false;
let activeEditorPromptId = "";

function autoResizeTextarea(element) {
    if (!element) {
        return;
    }

    element.style.height = "";
    const nextHeight = Math.max(10, Math.min(element.scrollHeight, 220));
    element.style.height = `${nextHeight}px`;
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

function buildShareUrl(prompt) {
    const shareUrl = new URL(window.location.href);
    shareUrl.search = `?id=${prompt.id}`;
    shareUrl.hash = "";
    return shareUrl.toString();
}

function getUiIcon(name) {
    const icons = {
        clock: `
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="7.25" stroke="currentColor" stroke-width="1.7"></circle>
                <path d="M10 5.8v4.5l3 1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        `,
        eye: `
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M2.4 10s2.8-4.6 7.6-4.6S17.6 10 17.6 10s-2.8 4.6-7.6 4.6S2.4 10 2.4 10Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"></path>
                <circle cx="10" cy="10" r="2.1" fill="currentColor"></circle>
            </svg>
        `,
        comment: `
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4.2 5.4h11.6a1.8 1.8 0 0 1 1.8 1.8v5.4a1.8 1.8 0 0 1-1.8 1.8H9l-3.8 2.6v-2.6H4.2a1.8 1.8 0 0 1-1.8-1.8V7.2a1.8 1.8 0 0 1 1.8-1.8Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"></path>
            </svg>
        `,
        heart: `
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 16.2 4.6 11a3.5 3.5 0 0 1 4.9-5l.5.5.5-.5a3.5 3.5 0 0 1 4.9 5L10 16.2Z" fill="currentColor"></path>
            </svg>
        `,
        star: `
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="m10 3.1 2 4 4.5.7-3.2 3.1.8 4.5-4.1-2.1-4.1 2.1.8-4.5L3.5 7.8l4.5-.7 2-4Z" fill="currentColor"></path>
            </svg>
        `
    };

    return icons[name] || "";
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
    const authorLink = escapeHtml(prompt.authorLink || "../profile.html");
    const authorBio = escapeHtml(prompt.authorBio || "Prompt contributor.");
    const authorHandle = escapeHtml(prompt.authorHandle || `@${prompt.author}`);
    const prompts = window.promptFeedData.filter((item) => item.author === prompt.author);
    const promptCount = prompts.length;
    const totalLikes = prompts.reduce((sum, item) => sum + item.likes, 0);
    const initials = getAuthorInitials(prompt.author);
    const tone = getAuthorTone(prompt.author);

    return `
        <a class="author-link" href="${authorLink}">
            <span>${includeByPrefix ? `by ${escapeHtml(prompt.author)}` : escapeHtml(prompt.author)}</span>
            <span class="author-popover">
                <span class="author-preview-header">
                    <span class="author-avatar author-tone-${tone}">${escapeHtml(initials)}</span>
                    <span class="author-preview-copy">
                        <strong>${escapeHtml(prompt.author)}</strong>
                        <span class="author-handle">${authorHandle}</span>
                        <span>${authorBio}</span>
                    </span>
                </span>
                <span class="author-stats">
                    <span><strong>${promptCount}</strong> prompts</span>
                    <span><strong>${totalLikes}</strong> likes</span>
                </span>
                <em>Click to open profile</em>
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

function buildCustomizedPrompt() {
    const sections = [basePromptInput ? basePromptInput.value.trim() : (promptData?.prompt || "").trim()];

    const optionalFields = [
        ["Tone", toneInput.value.trim()],
        ["Style", styleInput.value.trim()],
        ["Audience", audienceInput.value.trim()],
        ["Output Length", lengthInput.value.trim()],
        ["Format", formatInput.value.trim()]
    ].filter(([, value]) => value);

    if (optionalFields.length) {
        sections.push(optionalFields.map(([label, value]) => `${label}: ${value}`).join("\n"));
    }

    if (customInstructionsInput.value.trim()) {
        sections.push(`Additional Instructions:\n${customInstructionsInput.value.trim()}`);
    }

    return sections.filter(Boolean).join("\n\n");
}

function getEditorState() {
    return {
        basePrompt: basePromptInput ? basePromptInput.value : "",
        tone: toneInput.value,
        style: styleInput.value,
        audience: audienceInput.value,
        length: lengthInput.value,
        format: formatInput.value,
        instructions: customInstructionsInput.value,
        preview: myVersionPreview.value,
        status: editorStatusEl.textContent
    };
}

function applyEditorState(state) {
    if (!state) {
        return;
    }

    if (basePromptInput) {
        basePromptInput.value = state.basePrompt;
    }
    toneInput.value = state.tone;
    styleInput.value = state.style;
    audienceInput.value = state.audience;
    lengthInput.value = state.length;
    formatInput.value = state.format;
    customInstructionsInput.value = state.instructions;
    myVersionPreview.value = state.preview;
    editorStatusEl.textContent = state.status;
}

function resetCustomEditor(prompt) {
    if (!prompt) {
        return;
    }

    if (basePromptInput) {
        basePromptInput.value = prompt.prompt || "";
    }
    toneInput.value = "";
    styleInput.value = "";
    audienceInput.value = "";
    lengthInput.value = "";
    formatInput.value = "";
    customInstructionsInput.value = "";
    myVersionPreview.value = prompt.prompt || "";
    editorStatusEl.textContent = "Base prompt restored. Add edits to create your own version.";
}

function saveCustomVersion(prompt) {
    if (!prompt) {
        return;
    }

    const versionPayload = {
        promptId: prompt.id,
        sourceTitle: prompt.title,
        savedAt: new Date().toISOString(),
        customizedPrompt: myVersionPreview.value.trim()
    };

    if (!versionPayload.customizedPrompt) {
        editorStatusEl.textContent = "Apply changes before saving your version.";
        return;
    }

    const storageKey = "prompt-share-custom-versions";
    const existingVersions = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
    existingVersions.unshift(versionPayload);
    window.localStorage.setItem(storageKey, JSON.stringify(existingVersions));
    editorStatusEl.textContent = "Saved to My Version locally in this browser.";
}

function renderDetail(prompt) {
    if (!prompt) {
        titleEl.textContent = "Prompt not found";
        commentListEl.innerHTML = '<div class="empty-state">No prompt data available.</div>';
        return;
    }

    const preservedEditorState = activeEditorPromptId === prompt.id ? getEditorState() : null;
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
    if (preservedEditorState) {
        applyEditorState(preservedEditorState);
    } else {
        resetCustomEditor(prompt);
        activeEditorPromptId = prompt.id;
    }
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

    try {
        await navigator.clipboard.writeText(promptData.prompt);
        shareStatusEl.textContent = "Prompt copied. Opening ChatGPT in a new tab.";
    } catch (error) {
        shareStatusEl.textContent = "ChatGPT opened, but clipboard copy failed. Copy the prompt manually from this page.";
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

copyLinkButton.addEventListener("click", async () => {
    if (!promptData) {
        return;
    }

    try {
        await navigator.clipboard.writeText(buildShareUrl(promptData));
        promptData.copyCount = (promptData.copyCount || 0) + 1;
        shareStatusEl.textContent = "Prompt link copied to clipboard.";
        renderDetail(promptData);
    } catch (error) {
        shareStatusEl.textContent = "Copy failed in this browser. You can still copy the link manually.";
    }
});

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

applyChangesButton.addEventListener("click", () => {
    const customizedPrompt = buildCustomizedPrompt();
    myVersionPreview.value = customizedPrompt;
    editorStatusEl.textContent = "Custom version updated. Review it before saving.";
});

resetEditorButton.addEventListener("click", () => {
    resetCustomEditor(promptData);
});

saveVersionButton.addEventListener("click", () => {
    saveCustomVersion(promptData);
});

customEditorForm.addEventListener("submit", (event) => {
    event.preventDefault();
});

if (promptData && !hasRecordedView) {
    promptData.viewCount = (promptData.viewCount || 0) + 1;
    hasRecordedView = true;
}

renderDetail(promptData);
autoResizeTextarea(detailCommentInput);
