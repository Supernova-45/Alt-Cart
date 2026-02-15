/**
 * Popup init: load saved state and attach event handlers.
 * Uses addEventListener (required by extension CSP - no inline handlers).
 */
(function () {
  var toggle = document.getElementById("hover-speak-toggle");
  var openBtn = document.getElementById("open-btn");

  if (toggle) {
    chrome.storage.sync.get({ hoverSpeakEnabled: true }, function (stored) {
      if (toggle) toggle.checked = stored.hoverSpeakEnabled;
    });
    toggle.addEventListener("change", function () {
      chrome.storage.sync.set({ hoverSpeakEnabled: toggle.checked });
    });
  }

  if (openBtn) {
    openBtn.addEventListener("mousedown", function (e) {
      e.preventDefault();
      chrome.runtime.sendMessage({ type: "OPEN_PASSPORT" }, function () {
        window.close();
      });
    });
  }
})();
