// Listen for messages to open the options page
if (typeof browser !== "undefined") {
  browser.runtime.onMessage.addListener(function (message) {
    if (message.action === "openOptionsPage") {
      browser.runtime.openOptionsPage();
    }
  });
}

if (typeof chrome !== "undefined") {
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "openOptionsPage") {
      chrome.runtime.openOptionsPage();
    }
  });
}
