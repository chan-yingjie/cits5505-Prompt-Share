/**
 * prompt-delete-modal.js
 * Intercepts prompt delete form submissions and shows a confirmation modal
 * before the request is actually sent, preventing accidental deletions.
 */

(function () {
  const modal = document.getElementById("delete-prompt-modal");
  const confirmButton = document.getElementById("confirm-delete-prompt-button");
  const closeButtons = [
    document.getElementById("close-delete-prompt-modal"),
    document.getElementById("cancel-delete-prompt-button")
  ].filter(Boolean);
  let pendingForm = null;

  if (!modal || !confirmButton) {
    return;
  }

  function openModal(form) {
    pendingForm = form;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("show");
    document.body.classList.add("modal-open");
    confirmButton.focus();
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
    pendingForm = null;
  }

  // Intercept all delete form submissions on the page.
  document.querySelectorAll(".prompt-delete-form, .pf-prompt-delete-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      openModal(form);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  // Clicking outside the modal dialog closes it.
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Confirmed — submit the stored form.
  confirmButton.addEventListener("click", () => {
    pendingForm?.submit();
  });
}());
