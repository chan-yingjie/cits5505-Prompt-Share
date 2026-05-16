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

  document.querySelectorAll(".prompt-delete-form, .pf-prompt-delete-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      openModal(form);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  confirmButton.addEventListener("click", () => {
    pendingForm?.submit();
  });
}());
