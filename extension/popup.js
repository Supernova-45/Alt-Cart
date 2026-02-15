document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("open-btn");
  const hoverSpeakToggle = document.getElementById("hover-speak-toggle");
  const helpBtn = document.getElementById("help-btn");
  const helpDialog = document.getElementById("help-dialog");
  const helpCloseBtn = document.getElementById("help-close-btn");

  chrome.storage.sync.get({ hoverSpeakEnabled: true }, (stored) => {
    hoverSpeakToggle.checked = stored.hoverSpeakEnabled;
  });

  hoverSpeakToggle.addEventListener("change", () => {
    chrome.storage.sync.set({ hoverSpeakEnabled: hoverSpeakToggle.checked });
  });

  openBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ type: "OPEN_PASSPORT" }, () => {
      window.close();
    });
  });

  function openHelp() {
    helpDialog.showModal();
    helpCloseBtn.focus();
  }

  function closeHelp() {
    helpDialog.close();
    helpBtn.focus();
  }

  helpBtn.addEventListener("click", openHelp);

  helpCloseBtn.addEventListener("click", closeHelp);

  helpDialog.addEventListener("cancel", () => {
    helpBtn.focus();
  });
});
