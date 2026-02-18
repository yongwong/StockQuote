// 后台脚本 - 负责定期更新数据
let isTradingTime = false;
let lastUpdateTime = null;

// 检查是否为交易时间 (周一到周五 9:30-15:00)
function checkTradingTime() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0是周日，6是周六
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  // 周一到周五
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  // 9:30-15:00 (570-900分钟)
  const isTradingHours = currentTime >= 570 && currentTime <= 900;
  
  isTradingTime = isWeekday && isTradingHours;
  return isTradingTime;
}

// 获取股票温度数据
function getStockTemperatureData(callback) {
  console.log("开始获取股票温度数据");
  
  // 直接使用fetch方法获取数据
  fetch("https://www.jisilu.cn/data/indicator/get_last_indicator/", {
    method: 'GET',
    mode: 'cors',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Referer': 'https://www.jisilu.cn/'
    }
  })
  .then(response => {
    console.log("股票数据响应状态:", response.status);
    if (response.status >= 200 && response.status < 300) {
      return response.json();
    } else {
      throw new Error(`获取股票数据失败，状态码: ${response.status}`);
    }
  })
  .then(data => {
    console.log("股票数据:", data);
    callback(data);
  })
  .catch(error => {
    console.error("获取股票数据异常:", error.message);
    callback(null);
  });
}

// 获取可转债温度数据
function getTemperatureData(callback) {
  console.log("开始获取可转债温度数据");
  
  // 直接使用fetch方法获取数据
  fetch("https://www.jisilu.cn/webapi/cb/index_quote/", {
    method: 'GET',
    mode: 'cors',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Referer': 'https://www.jisilu.cn/'
    }
  })
  .then(response => {
    console.log("可转债数据响应状态:", response.status);
    if (response.status >= 200 && response.status < 300) {
      return response.json();
    } else {
      throw new Error(`获取可转债数据失败，状态码: ${response.status}`);
    }
  })
  .then(data => {
    console.log("可转债数据:", data);
    if (data.code === 200) {
      callback(data.data);
    } else {
      console.error(`API返回错误: ${data.msg}`);
      callback(null);
    }
  })
  .catch(error => {
    console.error("获取可转债数据异常:", error.message);
    callback(null);
  });
}

// 获取指数数据
function getIndexData(callback) {
  console.log("开始获取指数数据");
  
  const indices = [
    { code: 'sh000001', type: 'sh', name: '上证指数' },
    { code: 'sz399001', type: 'sz', name: '深证成指' },
    { code: 'sz399006', type: 'cyb', name: '创业板指' },
    { code: 'sh000688', type: 'kc50', name: '科创50' },
    { code: 'bj899050', type: 'bz50', name: '北证50' },
    { code: 'sh000300', type: 'hs300', name: '沪深300' },
    { code: 'sh000985', type: 'zzqz', name: '中证全指' },
    { code: 'hkHSI', type: 'hsi', name: '恒生指数' },
    { code: 'hkHSCEI', type: 'hscei', name: '国企指数' },
    { code: 'hkHSTECH', type: 'hstech', name: '恒生科技指数' },
    { code: 'usDJI', type: 'dji', name: '道琼斯指数' },
    { code: 'usIXIC', type: 'nasdaq', name: '纳斯达克指数' },
    { code: 'usINX', type: 'sp500', name: '标普500指数' }
  ];
  
  const results = {
    sh: null,
    sz: null,
    cyb: null,
    kc50: null,
    bz50: null,
    hs300: null,
    zzqz: null,
    hsi: null,
    hscei: null,
    hstech: null,
    dji: null,
    nasdaq: null,
    sp500: null
  };
  
  let completed = 0;
  
  indices.forEach(index => {
    fetch(`https://qt.gtimg.cn/q=${index.code}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://gu.qq.com/'
      }
    })
    .then(response => response.text())
    .then(text => {
      console.log(`${index.name}指数原始数据:`, text);
      const match = text.match(/="([^"]+)"/);
      if (match && match[1]) {
          const dataStr = match[1];
          console.log(`${index.name}指数数据字符串:`, dataStr);
          
          // 腾讯API返回的格式: "1~上证指数~000001~4065.58~4075.92~4040.30~...~20260206161414~-10.34~-0.25~4095.03~4029.97~4065.58/..."
          const parts = dataStr.split('~');
          console.log(`${index.name}指数分割后长度:`, parts.length);
          
          // 灵活解析数据，不同指数可能有不同格式
            if (parts.length >= 10) {
              // 解析关键数据
              const current = parts[3];      // 当前值 (索引3)
              const open = parts[4];         // 开盘价 (索引4)
              const preClose = parts[5];      // 前收盘价 (索引5)
              
              // 寻找时间、涨跌值、涨跌比例等字段
              let time = null;
              let change = null;
              let changePercent = null;
              let high = null;
              let low = null;
              
              // 对于美股指数，尝试直接计算涨跌值和涨跌比例
              if (index.code.startsWith('us')) {
                if (current && preClose) {
                  const currentVal = parseFloat(current);
                  const preCloseVal = parseFloat(preClose);
                  if (!isNaN(currentVal) && !isNaN(preCloseVal)) {
                    change = (currentVal - preCloseVal).toFixed(2);
                    changePercent = ((currentVal - preCloseVal) / preCloseVal * 100).toFixed(2);
                  }
                }
              }
              
              // 尝试不同位置寻找关键数据
              for (let i = 0; i < parts.length; i++) {
                if (parts[i]) {
                  // 检查是否为时间格式
                  const isTimeFormat = 
                    (parts[i].length === 14 && /^\d+$/.test(parts[i])) || // 国内格式：20260206153413
                    (parts[i].length === 19 && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(parts[i])); // 美股格式：2026-02-06 16:43:16
                  
                  if (isTimeFormat) {
                    time = parts[i];
                    if (i + 3 < parts.length) {
                      change = parts[i + 1] || change;
                      changePercent = parts[i + 2] || changePercent;
                      high = parts[i + 3];
                      low = parts[i + 4];
                    }
                    break;
                  }
                }
              }
              
              // 如果没找到，使用默认位置
              if (!time) {
                time = parts[30] || null;
                change = parts[31] || change;
                changePercent = parts[32] || changePercent;
                high = parts[33] || null;
                low = parts[34] || null;
              }
              
              // 确保涨跌值和涨跌比例有值
              if (!change && current && preClose) {
                const currentVal = parseFloat(current);
                const preCloseVal = parseFloat(preClose);
                if (!isNaN(currentVal) && !isNaN(preCloseVal)) {
                  change = (currentVal - preCloseVal).toFixed(2);
                  changePercent = ((currentVal - preCloseVal) / preCloseVal * 100).toFixed(2);
                }
              }
            
            // 从成交量成交额字段解析
            let volume = null;
            let amount = null;
            if (parts.length >= 35) {
              const tradeData = parts[35] ? parts[35].split('/') : [];
              volume = tradeData[1] || null;
              amount = tradeData[2] || null;
            }
            
            results[index.type] = {
              name: index.name,
              open: open,
              preClose: preClose,
              current: current,
              high: high,
              low: low,
              volume: volume,
              amount: amount,
              time: time,
              change: change,
              changePercent: changePercent
            };
            console.log(`${index.name}指数解析成功:`, results[index.type]);
          } else {
            console.error(`${index.name}指数数据格式不正确，数据长度: ${parts.length}`);
          }
        } else {
          console.error(`${index.name}指数数据匹配失败`);
        }
      completed++;
      if (completed === indices.length) {
        console.log("所有指数数据获取完成:", results);
        callback(results);
      }
    })
    .catch(error => {
      console.error(`获取${index.name}指数数据失败:`, error.message);
      completed++;
      if (completed === indices.length) {
        callback(results);
      }
    });
  });
}

// 更新数据并存储
function updateData(isManual = false) {
  // 如果不是手动更新，且不在交易时间，则跳过
  if (!isManual && !checkTradingTime()) {
    console.log("非交易时间，跳过自动更新");
    return;
  }
  
  console.log(isManual ? "手动更新数据" : "自动更新数据");
  
  // 获取数据
  getStockTemperatureData(function(stockData) {
    getTemperatureData(function(cbData) {
      // 检查数据是否获取成功
      if (!stockData && !cbData) {
        console.error("无法获取任何数据");
        // 仍然存储空状态，让UI显示相应信息
        const timestamp = new Date().toISOString();
        lastUpdateTime = timestamp;
        
        const dataToStore = {
          timestamp: timestamp,
          stockData: null,
          cbData: null,
          isTradingTime: checkTradingTime(),
          hasData: false
        };
        
        chrome.storage.local.set({ jisiluData: dataToStore }, () => {
          console.log("空状态已保存", dataToStore);
        });
        return;
      }
      
      // 存储数据
      const timestamp = new Date().toISOString();
      lastUpdateTime = timestamp;
      
      const dataToStore = {
        timestamp: timestamp,
        stockData: stockData,
        cbData: cbData,
        isTradingTime: checkTradingTime(),
        hasData: !!(stockData || cbData)
      };
      
      chrome.storage.local.set({ jisiluData: dataToStore }, () => {
        console.log("数据已更新并保存", dataToStore);
        
        // 通知popup更新
        chrome.runtime.sendMessage({ 
          action: "dataUpdated", 
          data: dataToStore 
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log("发送消息失败:", chrome.runtime.lastError);
            // 忽略错误，popup可能未打开
          }
        });
      });
    });
  });
}

// 设置定时器 - 每10分钟检查一次
function setupAlarm() {
  chrome.alarms.create('updateData', { periodInMinutes: 10 });
  chrome.alarms.create('updateIndexData', { periodInMinutes: 5 });
  console.log("已设置10分钟定时更新数据和5分钟定时更新指数");
}

// 初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log("集思录数据监控插件已安装");
  
  // 初始获取一次数据
  updateData(true);
  
  // 初始获取指数数据
  getIndexData((data) => {
    chrome.storage.local.set({ indexData: data }, () => {
      console.log("初始指数数据已保存", data);
    });
  });
  
  // 设置定时器
  setupAlarm();
});

// 处理定时器事件
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateData') {
    updateData(false); // 自动更新
  } else if (alarm.name === 'updateIndexData') {
    getIndexData((data) => {
      chrome.storage.local.set({ indexData: data }, () => {
        console.log("指数数据已定时更新", data);
        // 通知popup更新
        chrome.runtime.sendMessage({
          action: "indexDataUpdated",
          data: data
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log("发送消息失败:", chrome.runtime.lastError);
          }
        });
      });
    });
  }
});

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateNow') {
    // 手动更新
    updateData(true);
    sendResponse({ status: "已触发手动更新" });
  } else if (request.action === 'getStatus') {
    // 返回当前状态
    chrome.storage.local.get('jisiluData', (result) => {
      sendResponse({
        isTradingTime: checkTradingTime(),
        lastUpdateTime: lastUpdateTime,
        hasData: !!(result.jisiluData && result.jisiluData.hasData)
      });
    });
    return true; // 保持消息通道开放
  } else if (request.action === 'getIndexData') {
    // 获取指数数据
    getIndexData((data) => {
      sendResponse({
        success: true,
        data: data
      });
    });
    return true; // 保持消息通道开放
  } else if (request.action === 'refreshIndexData') {
    // 刷新指数数据
    getIndexData((data) => {
      chrome.storage.local.set({ indexData: data }, () => {
        // 通知index页面更新
        chrome.runtime.sendMessage({
          action: "indexDataUpdated",
          data: data
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log("发送消息失败:", chrome.runtime.lastError);
          }
        });
        sendResponse({
          success: true,
          data: data
        });
      });
    });
    return true; // 保持消息通道开放
  }
});

// 监听安装事件，确保初始数据加载
chrome.runtime.onInstalled.addListener(() => {
  console.log("扩展程序已安装，等待数据加载...");
});