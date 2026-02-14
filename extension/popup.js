document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("open-btn");

  openBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ type: "OPEN_PASSPORT" }, () => {
      window.close();
    });
  });
});
