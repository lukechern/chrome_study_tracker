// This script handles background tasks for the extension.

// Open the side panel when the action icon is clicked.
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});
