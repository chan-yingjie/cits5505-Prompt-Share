function buildSharedFooterMarkup() {
    const navItems = [
        {
            href: "index.html",
            label: "Home",
            icon: '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" shape-rendering="crispEdges" aria-hidden="true"><rect x="5" y="0" width="3" height="2" fill="currentColor"/><rect x="3" y="2" width="7" height="2" fill="currentColor"/><rect x="1" y="4" width="11" height="1" fill="currentColor"/><rect x="2" y="5" width="2" height="8" fill="currentColor"/><rect x="9" y="5" width="2" height="8" fill="currentColor"/><rect x="2" y="5" width="9" height="1" fill="currentColor"/><rect x="5" y="7" width="3" height="6" fill="currentColor"/></svg>'
        },
        {
            href: "feed.html",
            label: "Explore",
            icon: '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" shape-rendering="crispEdges" aria-hidden="true"><rect x="1" y="1" width="11" height="2" fill="currentColor"/><rect x="1" y="5" width="7" height="2" fill="currentColor"/><rect x="1" y="9" width="9" height="2" fill="currentColor"/></svg>'
        },
        {
            href: "submit-prompt.html",
            label: "Submit Prompt",
            icon: '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" shape-rendering="crispEdges" aria-hidden="true"><rect x="5" y="0" width="3" height="6" fill="currentColor"/><rect x="2" y="3" width="3" height="3" fill="currentColor"/><rect x="8" y="3" width="3" height="3" fill="currentColor"/><rect x="1" y="8" width="11" height="2" fill="currentColor"/><rect x="1" y="10" width="2" height="3" fill="currentColor"/><rect x="10" y="10" width="2" height="3" fill="currentColor"/></svg>'
        },
        {
            href: "leaderboard.html",
            label: "Leaderboard",
            icon: '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" shape-rendering="crispEdges" aria-hidden="true"><rect x="5" y="1" width="3" height="12" fill="currentColor"/><rect x="1" y="5" width="3" height="8" fill="currentColor"/><rect x="9" y="3" width="3" height="10" fill="currentColor"/></svg>'
        }
    ];
    const authors = [
        "24262634@student.uwa.edu.au",
        "24771727@student.uwa.edu.au",
        "23864156@student.uwa.edu.au"
    ];
    const authorIcon = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" shape-rendering="crispEdges" aria-hidden="true"><rect x="4" y="0" width="5" height="5" fill="currentColor"/><rect x="3" y="1" width="7" height="4" fill="currentColor"/><rect x="1" y="7" width="11" height="6" fill="currentColor"/><rect x="2" y="6" width="9" height="2" fill="currentColor"/></svg>';
    const feedbackIcon = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" shape-rendering="crispEdges" aria-hidden="true"><rect x="0" y="1" width="13" height="11" fill="currentColor" opacity="0.15"/><rect x="0" y="1" width="13" height="1" fill="currentColor"/><rect x="0" y="11" width="13" height="1" fill="currentColor"/><rect x="0" y="1" width="1" height="11" fill="currentColor"/><rect x="12" y="1" width="1" height="11" fill="currentColor"/><rect x="1" y="2" width="5" height="1" fill="currentColor"/><rect x="7" y="2" width="5" height="1" fill="currentColor"/><rect x="2" y="3" width="4" height="1" fill="currentColor"/><rect x="7" y="3" width="4" height="1" fill="currentColor"/><rect x="3" y="4" width="3" height="1" fill="currentColor"/><rect x="7" y="4" width="3" height="1" fill="currentColor"/><rect x="5" y="5" width="3" height="1" fill="currentColor"/></svg>';

    const navMarkup = navItems.map((item) => `
        <a href="${item.href}">
            ${item.icon}
            ${item.label}
        </a>
    `).join("");

    const authorMarkup = authors.map((email) => `
        <div class="site-footer-author">
            ${authorIcon}
            <span>${email}</span>
        </div>
    `).join("");

    return `
        <div class="site-footer-grid">
            <div class="site-footer-brand">
                <div class="site-footer-logo">
                    <span class="site-footer-logo-mark" aria-hidden="true">PS</span>
                    <span class="site-footer-logo-name" id="site-footer-title">Prompt Share</span>
                </div>
                <p class="site-footer-tagline">Discover · Share · Improve</p>
                <p class="site-footer-desc">A community space for discovering, sharing, and refining AI prompts — built for the people shaping the future of AI.</p>
            </div>
            <div class="site-footer-nav">
                <h3 class="site-footer-heading">Navigation</h3>
                <nav aria-label="Footer navigation">
                    ${navMarkup}
                </nav>
            </div>
            <div class="site-footer-authors">
                <h3 class="site-footer-heading">Authors · CITS5505</h3>
                <div class="site-footer-author-list">
                    ${authorMarkup}
                    <a class="site-footer-feedback" href="mailto:24262634@student.uwa.edu.au?subject=Prompt%20Share%20Feedback">
                        ${feedbackIcon}
                        Send Feedback
                    </a>
                </div>
            </div>
        </div>
        <div class="site-footer-bottom">
            <span>&copy; 2026 Prompt Share. All rights reserved.</span>
            <span class="site-footer-bottom-badge">CITS5505 · UWA</span>
            <span>Built for a better prompt-sharing workflow.</span>
        </div>
    `;
}

document.querySelectorAll("[data-shared-footer]").forEach((footer) => {
    footer.innerHTML = buildSharedFooterMarkup();
});

const backToTopButton = document.getElementById("back-to-top");

if (backToTopButton) {
    function syncBackToTopVisibility() {
        if (window.scrollY > 280) {
            backToTopButton.classList.add("is-visible");
            return;
        }

        backToTopButton.classList.remove("is-visible");
    }

    window.addEventListener("scroll", syncBackToTopVisibility);

    backToTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    syncBackToTopVisibility();
}

const mobileQuery = window.matchMedia("(max-width: 860px)");

function closeAuthorPopovers(exceptLink) {
    document.querySelectorAll(".author-link.is-open").forEach((link) => {
        if (link !== exceptLink) {
            link.classList.remove("is-open");
        }
    });
}

document.addEventListener("click", (event) => {
    if (!mobileQuery.matches) {
        return;
    }

    const authorLink = event.target.closest(".author-link");

    if (!authorLink) {
        closeAuthorPopovers();
        return;
    }

    if (!authorLink.classList.contains("is-open")) {
        event.preventDefault();
        closeAuthorPopovers(authorLink);
        authorLink.classList.add("is-open");
        return;
    }

    closeAuthorPopovers();
});

document.querySelectorAll(".topbar").forEach((topbar) => {
    const toggle = topbar.querySelector(".nav-toggle");
    const nav = topbar.querySelector(".topnav");

    if (!toggle || !nav) {
        return;
    }

    function closeNav() {
        topbar.classList.remove("is-nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation menu");
    }

    function openNav() {
        topbar.classList.add("is-nav-open");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close navigation menu");
    }

    toggle.addEventListener("click", () => {
        if (topbar.classList.contains("is-nav-open")) {
            closeNav();
            return;
        }

        openNav();
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", (event) => {
        if (!topbar.contains(event.target)) {
            closeNav();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 860) {
            closeNav();
        }
    });
});
