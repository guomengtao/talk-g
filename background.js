// 初始化
console.log('Talk-G Manager initialized');

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 可以在这里添加其他功能
  return true;
}); 