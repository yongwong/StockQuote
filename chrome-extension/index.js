document.addEventListener('DOMContentLoaded', function() {
  const updateBtn = document.getElementById('update-btn');
  const lastUpdateElement = document.getElementById('last-update');
  const loadingElement = document.getElementById('loading');
  const indexContainer = document.getElementById('index-container');
  const errorContainer = document.getElementById('error-container');
  
  let indexData = {
    sh: null,
    sz: null,
    cyb: null
  };
  
  function initialize() {
    loadIndexData();
  }
  
  function showLoading() {
    loadingElement.style.display = 'block';
    indexContainer.style.display = 'none';
    errorContainer.style.display = 'none';
  }
  
  function showError(message) {
    loadingElement.style.display = 'none';
    indexContainer.style.display = 'none';
    errorContainer.style.display = 'block';
    errorContainer.textContent = message || '加载数据失败，请检查网络连接或手动重试';
  }
  
  function showIndexData() {
    loadingElement.style.display = 'none';
    indexContainer.style.display = 'block';
    errorContainer.style.display = 'none';
  }
  
  function updateLastUpdateTime() {
    const now = new Date();
    lastUpdateElement.textContent = `更新时间: ${formatDateTime(now)}`;
  }
  
  function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  function formatNumber(num) {
    if (num === null || num === undefined || num === '--') return '--';
    return parseFloat(num).toFixed(2);
  }
  
  function formatVolume(num) {
    if (num === null || num === undefined || num === '--') return '--';
    const value = parseFloat(num);
    if (value >= 100000000) {
      return (value / 100000000).toFixed(2) + '亿';
    } else if (value >= 10000) {
      return (value / 10000).toFixed(2) + '万';
    }
    return value.toFixed(2);
  }
  
  function formatAmount(num) {
    if (num === null || num === undefined || num === '--') return '--';
    const value = parseFloat(num);
    if (value >= 100000000) {
      return (value / 100000000).toFixed(2) + '亿';
    } else if (value >= 10000) {
      return (value / 10000).toFixed(2) + '万';
    }
    return value.toFixed(2);
  }
  
  function getChangeClass(change) {
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'flat';
  }
  
  function updateIndexCard(type, data) {
    const prefix = type;
    
    const valueElement = document.getElementById(`${prefix}-value`);
    const changeElement = document.getElementById(`${prefix}-change`);
    const openElement = document.getElementById(`${prefix}-open`);
    const highElement = document.getElementById(`${prefix}-high`);
    const lowElement = document.getElementById(`${prefix}-low`);
    const closeElement = document.getElementById(`${prefix}-close`);
    const volumeElement = document.getElementById(`${prefix}-volume`);
    const amountElement = document.getElementById(`${prefix}-amount`);
    
    if (data) {
      const current = parseFloat(data.current);
      const preClose = parseFloat(data.preClose);
      const change = current - preClose;
      const changePercent = (change / preClose) * 100;
      
      valueElement.textContent = formatNumber(current);
      changeElement.textContent = `${change > 0 ? '+' : ''}${formatNumber(change)} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
      changeElement.className = `index-change ${getChangeClass(change)}`;
      
      openElement.textContent = formatNumber(data.open);
      highElement.textContent = formatNumber(data.high);
      lowElement.textContent = formatNumber(data.low);
      closeElement.textContent = formatNumber(data.preClose);
      volumeElement.textContent = formatVolume(data.volume);
      amountElement.textContent = formatAmount(data.amount);
    } else {
      valueElement.textContent = '--';
      changeElement.textContent = '--';
      changeElement.className = 'index-change';
      
      openElement.textContent = '--';
      highElement.textContent = '--';
      lowElement.textContent = '--';
      closeElement.textContent = '--';
      volumeElement.textContent = '--';
      amountElement.textContent = '--';
    }
  }
  
  function displayData() {
    updateIndexCard('sh', indexData.sh);
    updateIndexCard('sz', indexData.sz);
    updateIndexCard('cyb', indexData.cyb);
    
    showIndexData();
    updateLastUpdateTime();
  }
  
  function loadIndexData() {
    showLoading();
    
    chrome.runtime.sendMessage({ action: 'getIndexData' }, (response) => {
      if (response && response.success) {
        indexData.sh = response.data.sh;
        indexData.sz = response.data.sz;
        indexData.cyb = response.data.cyb;
        displayData();
      } else {
        showError(response ? response.error : '获取指数数据失败');
      }
    });
  }
  
  updateBtn.addEventListener('click', function() {
    updateBtn.disabled = true;
    updateBtn.textContent = '正在刷新...';
    
    chrome.runtime.sendMessage({ action: 'refreshIndexData' }, (response) => {
      updateBtn.disabled = false;
      updateBtn.textContent = '刷新数据';
      
      if (response && response.success) {
        indexData.sh = response.data.sh;
        indexData.sz = response.data.sz;
        indexData.cyb = response.data.cyb;
        displayData();
      } else {
        showError(response ? response.error : '刷新指数数据失败');
      }
    });
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'indexDataUpdated') {
      indexData.sh = message.data.sh;
      indexData.sz = message.data.sz;
      indexData.cyb = message.data.cyb;
      displayData();
    }
  });
  
  initialize();
});