const BASE_URL = "https://alt-cart.vercel.app";

function isInvalidUrl(url) {
  return !url || url.startsWith("chrome://") || url.startsWith("chrome-extension://");
}

function openPassport() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || isInvalidUrl(tab.url)) {
      return;
    }

    const baseUrl = BASE_URL.replace(/\/$/, "");
    const passportUrl = `${baseUrl}/open?url=${encodeURIComponent(tab.url)}`;
    chrome.tabs.create({ url: passportUrl });
  });
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "open-passport") {
    openPassport();
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "OPEN_PASSPORT") {
    openPassport();
    sendResponse({ ok: true });
  }
  return true;
});
