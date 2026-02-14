document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("open-btn");
  const hoverSpeakToggle = document.getElementById("hover-speak-toggle");

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
});
