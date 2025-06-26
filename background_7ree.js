// 此脚本处理扩展程序的后台任务。

// 点击操作图标时打开侧边栏。
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});
