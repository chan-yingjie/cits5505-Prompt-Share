const feedList = document.getElementById("feed-list");
const promptCount = document.getElementById("prompt-count");
const commentCount = document.getElementById("comment-count");
const likeCount = document.getElementById("like-count");
const searchForm = document.getElementById("feed-search-form");
const searchInput = document.getElementById("feed-search-input");
const sortSelect = document.getElementById("feed-sort-select");
const clearSearchButton = document.getElementById("clear-search-button");
const categoryResetButton = document.getElementById("category-reset-button");
const categoryTabs = document.getElementById("category-tabs");
const subcategoryChips = document.getElementById("subcategory-chips");
const filterStatus = document.getElementById("filter-status");
const pageParams = new URLSearchParams(window.location.search);
let activeQuery = "";
let activeCategory = "";
let activeSubcategory = "";
const categoryLabelMap = {
    education: "Education",
    image: "Image Generation",
    video: "Video Generation",
    writing: "Writing",
    coding: "Coding",
    marketing: "Marketing",
    productivity: "Productivity"
};

const subcategoryLabelMap = {
    summarisation: "Summarisation",
    email: "Email Writing",
    revision: "Revision",
    "language-learning": "Language Learning",
    "short-video": "Short Video",
    "product-photography": "Product Visuals",
    debugging: "Debugging",
    automation: "Automation",
    campaign: "Campaigns",
    presentation: "Presentations"
};

function slugify(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function normalizePromptTaxonomy(prompt) {
    const categoryLabel = prompt.category || "General";
    const subcategoryLabel = prompt.subcategory || "General";
    const categorySlug = prompt.categorySlug || slugify(categoryLabel);
    const subcategorySlug = prompt.subcategorySlug || slugify(subcategoryLabel);

    return {
        categoryLabel: categoryLabelMap[categorySlug] || categoryLabel,
        categorySlug,
        subcategoryLabel: subcategoryLabelMap[subcategorySlug] || subcategoryLabel,
        subcategorySlug
    };
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function getInitials(value) {
    return value
        .split(/[\s.-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
}

function getKeywords(query) {
    return query
        .trim()
        .split(/\s+/)
        .map((keyword) => keyword.trim())
        .filter(Boolean);
}

function highlightText(value, query) {
    const safeValue = escapeHtml(value);
    const keywords = getKeywords(query);

    if (!keywords.length) {
        return safeValue;
    }

    const pattern = new RegExp(`(${keywords.map(escapeRegex).join("|")})`, "gi");
    return safeValue.replace(pattern, '<mark class="search-highlight">$1</mark>');
}

function getAuthorTone(author) {
    const tones = ["warm", "forest", "sea", "sunset"];
    const score = Array.from(author).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return tones[score % tones.length];
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

function buildAuthorPreview(prompt) {
    const authorLink = escapeHtml(getProfileHref(prompt.authorLink));
    const authorBio = escapeHtml(prompt.authorBio || "Prompt contributor.");
    const prompts = window.promptFeedData.filter((item) => item.author === prompt.author);
    const promptCount = prompts.length;
    const totalLikes = prompts.reduce((sum, item) => sum + item.likes, 0);
    const initials = getInitials(prompt.author);
    const tone = getAuthorTone(prompt.author);

    return `
        <a class="author-link prompt-author-link" href="${authorLink}">
            <span class="prompt-author-name">${highlightText(prompt.author, activeQuery)}</span>
            <span class="author-popover">
                <span class="author-preview-header">
                    <span class="author-avatar author-tone-${tone}">${escapeHtml(initials)}</span>
                    <span class="author-preview-copy">
                        <strong>${escapeHtml(prompt.author)}</strong>
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

function buildFeedCard(prompt) {
    const commentsTotal = prompt.comments.length;
    const taxonomy = normalizePromptTaxonomy(prompt);
    const upvotes = prompt.votes || prompt.likes || 0;
    const viewCount = prompt.viewCount || 0;
    const favoriteCount = prompt.favorites || 0;
    const authorTone = getAuthorTone(prompt.author);
    const authorInitials = getInitials(prompt.author);

    return `
        <article class="prompt-card" data-prompt-id="${prompt.id}">
            <div class="prompt-card-top">
                <div class="prompt-author">
                    <a class="prompt-author-avatar author-tone-${authorTone}" href="${escapeHtml(getProfileHref(prompt.authorLink))}" aria-label="Open ${escapeHtml(prompt.author)} profile">${escapeHtml(authorInitials)}</a>
                    <div class="prompt-author-copy">
                        ${buildAuthorPreview(prompt)}
                    </div>
                </div>
            </div>
            <div class="prompt-card-header">
                <h3 class="card-title">
                    <a class="card-title-link" href="../prompt-detail.html?prompt=${encodeURIComponent(prompt.id)}">${highlightText(prompt.title, activeQuery)}</a>
                </h3>
                <div class="card-stats" aria-label="Prompt interaction data">
                    <div class="card-stat">
                        <span class="stat-icon" aria-hidden="true">${getUiIcon("eye")}</span>
                        <strong>${viewCount}</strong>
                    </div>
                    <div class="card-stat">
                        <span class="stat-icon" aria-hidden="true">${getUiIcon("comment")}</span>
                        <strong>${commentsTotal}</strong>
                    </div>
                    <div class="card-stat">
                        <span class="stat-icon" aria-hidden="true">${getUiIcon("heart")}</span>
                        <strong>${upvotes}</strong>
                    </div>
                    <div class="card-stat">
                        <span class="stat-icon" aria-hidden="true">${getUiIcon("star")}</span>
                        <strong>${favoriteCount}</strong>
                    </div>
                </div>
            </div>
            <a class="prompt-preview prompt-preview-link" href="../prompt-detail.html?prompt=${encodeURIComponent(prompt.id)}" aria-label="Open ${escapeHtml(prompt.title)} detail">
                <div class="preview-box">
                    <p class="card-description">${highlightText(prompt.prompt, activeQuery)}</p>
                </div>
            </a>
            <div class="card-tags" aria-label="Prompt tags">
                <a class="meta-pill category-link tag-pill tag-pill-primary" href="feed.html?category=${encodeURIComponent(taxonomy.categorySlug)}">
                    ${escapeHtml(taxonomy.categoryLabel)}
                </a>
                <a class="meta-pill category-link tag-pill tag-pill-secondary" href="feed.html?category=${encodeURIComponent(taxonomy.categorySlug)}&subcategory=${encodeURIComponent(taxonomy.subcategorySlug)}">
                    ${escapeHtml(taxonomy.subcategoryLabel)}
                </a>
            </div>
            <div class="meta-time">
                <span class="meta-icon" aria-hidden="true">${getUiIcon("clock")}</span>
                <span>${escapeHtml(formatSubmittedAt(prompt.submittedAt))}</span>
            </div>
        </article>
    `;
}

function getCategoryTree() {
    const categories = new Map();

    window.promptFeedData.forEach((prompt) => {
        const taxonomy = normalizePromptTaxonomy(prompt);

        if (!categories.has(taxonomy.categorySlug)) {
            categories.set(taxonomy.categorySlug, {
                slug: taxonomy.categorySlug,
                label: taxonomy.categoryLabel,
                subcategories: []
            });
        }

        const category = categories.get(taxonomy.categorySlug);
        if (!category.subcategories.some((item) => item.slug === taxonomy.subcategorySlug)) {
            category.subcategories.push({
                slug: taxonomy.subcategorySlug,
                label: taxonomy.subcategoryLabel
            });
        }
    });

    return Array.from(categories.values())
        .sort((left, right) => left.label.localeCompare(right.label))
        .map((category) => ({
            ...category,
            subcategories: category.subcategories.sort((left, right) => left.label.localeCompare(right.label))
        }));
}

function renderCategoryFilters() {
    const categoryTree = getCategoryTree();

    categoryTabs.innerHTML = [
        `<button class="category-tab ${!activeCategory ? "is-active" : ""}" type="button" data-category="">All</button>`,
        ...categoryTree.map((category) => `
            <button class="category-tab ${activeCategory === category.slug ? "is-active" : ""}" type="button" data-category="${category.slug}">
                ${escapeHtml(category.label)}
            </button>
        `)
    ].join("");

    if (!activeCategory) {
        subcategoryChips.innerHTML = "";
        return;
    }

    const selectedCategory = categoryTree.find((category) => category.slug === activeCategory);
    if (!selectedCategory) {
        subcategoryChips.innerHTML = "";
        return;
    }

    subcategoryChips.innerHTML = [
        `<button class="subcategory-chip ${!activeSubcategory ? "is-active" : ""}" type="button" data-subcategory="">All ${escapeHtml(selectedCategory.label)}</button>`,
        ...selectedCategory.subcategories.map((subcategory) => `
            <button class="subcategory-chip ${activeSubcategory === subcategory.slug ? "is-active" : ""}" type="button" data-subcategory="${subcategory.slug}">
                ${escapeHtml(subcategory.label)}
            </button>
        `)
    ].join("");
}

function getSortLabel() {
    if (sortSelect.value === "upvotes-desc") {
        return "most liked";
    }

    return "newest";
}

function getTimestamp(value) {
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function syncUrl() {
    const nextUrl = new URL(window.location.href);

    if (activeQuery) {
        nextUrl.searchParams.set("search", activeQuery);
    } else {
        nextUrl.searchParams.delete("search");
    }

    if (activeCategory) {
        nextUrl.searchParams.set("category", activeCategory);
    } else {
        nextUrl.searchParams.delete("category");
    }

    if (activeCategory && activeSubcategory) {
        nextUrl.searchParams.set("subcategory", activeSubcategory);
    } else {
        nextUrl.searchParams.delete("subcategory");
    }

    window.history.replaceState({}, "", nextUrl);
}

function getFilteredPrompts() {
    const prompts = window.promptFeedData;
    const keywords = getKeywords(activeQuery.toLowerCase());
    const searchFilteredPrompts = !keywords.length ? prompts.slice() : prompts.filter((prompt) => {
        const haystack = [
            prompt.title,
            prompt.author,
            prompt.prompt,
            prompt.outputPreview
        ].join(" ").toLowerCase();

        return keywords.every((keyword) => haystack.includes(keyword));
    });

    const filteredPrompts = searchFilteredPrompts.filter((prompt) => {
        const taxonomy = normalizePromptTaxonomy(prompt);

        if (activeCategory && taxonomy.categorySlug !== activeCategory) {
            return false;
        }

        if (activeSubcategory && taxonomy.subcategorySlug !== activeSubcategory) {
            return false;
        }

        return true;
    });

    filteredPrompts.sort((left, right) => {
        if (sortSelect.value === "upvotes-desc") {
            return (right.votes || right.likes || 0) - (left.votes || left.likes || 0);
        }

        return getTimestamp(right.submittedAt) - getTimestamp(left.submittedAt);
    });

    return filteredPrompts;
}

function renderFeed() {
    const prompts = getFilteredPrompts();
    const allPrompts = window.promptFeedData;
    const totalComments = allPrompts.reduce((sum, prompt) => sum + prompt.comments.length, 0);
    const totalLikes = allPrompts.reduce((sum, prompt) => sum + prompt.likes, 0);
    if (promptCount) {
        promptCount.textContent = String(allPrompts.length);
    }
    if (commentCount) {
        commentCount.textContent = String(totalComments);
    }
    if (likeCount) {
        likeCount.textContent = String(totalLikes);
    }

    renderCategoryFilters();

    if (!Array.isArray(prompts) || prompts.length === 0) {
        feedList.innerHTML = `
            <div class="empty-state search-empty-state">
                <h3>No matching prompts found</h3>
                <p>Try fewer keywords, adjust the phrasing, or clear the filters to return to the full feed.</p>
            </div>
        `;
        return;
    }

    feedList.innerHTML = prompts.map(buildFeedCard).join("");
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    activeQuery = searchInput.value.trim();
    syncUrl();
    renderFeed();
});

clearSearchButton.addEventListener("click", () => {
    searchInput.value = "";
    activeQuery = "";
    syncUrl();
    renderFeed();
});

sortSelect.addEventListener("change", renderFeed);
if (categoryResetButton) {
    categoryResetButton.addEventListener("click", () => {
        activeCategory = "";
        activeSubcategory = "";
        syncUrl();
        renderFeed();
    });
}

categoryTabs.addEventListener("click", (event) => {
    const categoryButton = event.target.closest("[data-category]");
    if (!categoryButton) {
        return;
    }

    activeCategory = categoryButton.dataset.category || "";
    activeSubcategory = "";
    syncUrl();
    renderFeed();
});

subcategoryChips.addEventListener("click", (event) => {
    const subcategoryButton = event.target.closest("[data-subcategory]");
    if (!subcategoryButton) {
        return;
    }

    activeSubcategory = subcategoryButton.dataset.subcategory || "";
    syncUrl();
    renderFeed();
});

const initialQuery = pageParams.get("search");
if (initialQuery) {
    activeQuery = initialQuery;
    searchInput.value = initialQuery;
}

const initialCategory = pageParams.get("category");
if (initialCategory) {
    activeCategory = initialCategory;
}

const initialSubcategory = pageParams.get("subcategory");
if (initialCategory && initialSubcategory) {
    activeSubcategory = initialSubcategory;
}

renderFeed();
