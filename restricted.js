document.addEventListener("DOMContentLoaded", function () {
  const actionButton = document.querySelector(".action-button");
  if (actionButton) {
    actionButton.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default link behavior
      chrome.tabs.create({ url: this.href });
      window.close(); // Close the popup
    });
  }
});
