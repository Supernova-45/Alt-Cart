const DEFAULT_BASE_URL = "http://localhost:5173";

document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("open-btn");
  const statusEl = document.getElementById("status");
  const baseUrlInput = document.getElementById("base-url");
  const saveBtn = document.getElementById("save-btn");

  chrome.storage.sync.get({ baseUrl: DEFAULT_BASE_URL }, (data) => {
    const url = data.baseUrl || DEFAULT_BASE_URL;
    statusEl.textContent = `Base URL: ${url}`;
    baseUrlInput.value = url;
  });

  openBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ type: "OPEN_PASSPORT" }, () => {
      window.close();
    });
  });

  saveBtn.addEventListener("click", () => {
    const value = baseUrlInput.value.trim();
    if (!value.startsWith("http://") && !value.startsWith("https://")) {
      statusEl.textContent = "Base URL must start with http:// or https://";
      return;
    }
    chrome.storage.sync.set({ baseUrl: value }, () => {
      statusEl.textContent = `Base URL: ${value}`;
    });
  });
});
