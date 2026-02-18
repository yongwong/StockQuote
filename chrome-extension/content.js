// 内容脚本 - 在网页上下文中执行，可以绕过CORS限制

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchData') {
    try {
      // 在网页上下文中发起请求，避免CORS限制
      fetch(request.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Referer': 'https://www.jisilu.cn/'
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`请求失败，状态码: ${response.status}`);
        }
      })
      .then(data => {
        sendResponse({ success: true, data: data });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    
    return true; // 保持消息通道开放
  }
});

console.log("集思录内容脚本已加载");