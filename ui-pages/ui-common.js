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
