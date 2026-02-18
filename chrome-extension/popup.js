// 弹窗脚本
document.addEventListener('DOMContentLoaded', function() {
  const updateBtn = document.getElementById('update-btn');
  const statusElement = document.getElementById('status');
  const lastUpdateElement = document.getElementById('last-update');
  const dataContainer = document.getElementById('data-container');
  const errorContainer = document.getElementById('error-container');
  
  // 初始化获取状态和数据
  function initialize() {
    // 获取当前状态
    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
      if (response) {
        updateStatus(response.isTradingTime, response.lastUpdateTime);
        
        // 加载所有数据
        loadAllData();
      } else {
        showError();
      }
    });
    
    // 加载指数数据
    loadIndexData();
  }
  
  // 加载所有数据
  function loadAllData() {
    // 加载集思录数据并生成温度页内容
    chrome.storage.local.get('jisiluData', (result) => {
      if (result.jisiluData) {
        chrome.storage.local.get('indexData', (indexResult) => {
          displayData(result.jisiluData, indexResult.indexData);
        });
      } else {
        // 显示加载中
        const jisiluContainer = document.getElementById('jisilu-data-container');
        if (jisiluContainer) {
          jisiluContainer.innerHTML = '<div class="loading">正在加载数据...</div>';
        }
      }
    });
  }
  
  // 更新状态显示
  function updateStatus(isTradingTime, lastUpdateTime) {
    if (isTradingTime) {
      statusElement.textContent = '交易中';
      statusElement.className = 'status trading';
      updateBtn.textContent = '手动更新数据 (自动更新已启用)';
      updateBtn.disabled = false;
    } else {
      statusElement.textContent = '已闭市';
      statusElement.className = 'status closed';
      updateBtn.textContent = '手动更新数据';
      updateBtn.disabled = false;
    }
    
    if (lastUpdateTime) {
      const date = new Date(lastUpdateTime);
      lastUpdateElement.textContent = `更新: ${formatDateTime(date)}`;
    } else {
      lastUpdateElement.textContent = '更新: 暂无数据';
    }
  }
  
  // 格式化日期时间
  function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  // 显示加载中
  function showLoading() {
    document.getElementById('jisilu-data-container').innerHTML = '<div class="loading">正在加载数据...</div>';
    errorContainer.style.display = 'none';
  }
  
  // 加载指数数据
  function loadIndexData() {
    console.log('开始加载指数数据...');
    chrome.runtime.sendMessage({ action: 'getIndexData' }, (response) => {
      console.log('指数数据响应:', response);
      if (response && response.success) {
        console.log('指数数据:', response.data);
        updateIndexDisplay(response.data);
      } else {
        console.error('获取指数数据失败:', response ? response.error : '未知错误');
      }
    });
  }
  
  // 更新指数显示
  function updateIndexDisplay(indexData) {
    console.log('更新指数显示:', indexData);
    updateIndexCard('sh', indexData.sh);
    updateIndexCard('sz', indexData.sz);
    updateIndexCard('cyb', indexData.cyb);
    updateIndexCard('kc50', indexData.kc50);
    updateIndexCard('bz50', indexData.bz50);
    updateIndexCard('hs300', indexData.hs300);
    updateIndexCard('hsi', indexData.hsi);
    updateIndexCard('hscei', indexData.hscei);
    updateIndexCard('hstech', indexData.hstech);
    updateIndexCard('dji', indexData.dji);
    updateIndexCard('nasdaq', indexData.nasdaq);
    updateIndexCard('sp500', indexData.sp500);
  }
  
  // 更新单个指数卡片
  function updateIndexCard(type, data) {
    console.log(`更新${type}指数卡片:`, data);
    const valueElement = document.getElementById(`${type}-value`);
    const changeElement = document.getElementById(`${type}-change`);
    
    if (!valueElement || !changeElement) {
      console.error(`找不到${type}指数的DOM元素`);
      return;
    }
    
    if (data && data.current) {
      const current = parseFloat(data.current);
      const change = parseFloat(data.change || 0);
      const changePercent = parseFloat(data.changePercent || 0);
      
      valueElement.textContent = current.toFixed(2);
      
      const sign = change > 0 ? '+' : '';
      changeElement.textContent = `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
      
      // 设置颜色
      changeElement.className = 'index-change';
      if (change > 0) {
        changeElement.classList.add('up');
      } else if (change < 0) {
        changeElement.classList.add('down');
      } else {
        changeElement.classList.add('flat');
      }
    } else {
      valueElement.textContent = '--';
      changeElement.textContent = '--';
      changeElement.className = 'index-change';
    }
  }
  
  // 显示错误
  function showError() {
    dataContainer.style.display = 'none';
    errorContainer.style.display = 'block';
    errorContainer.textContent = '加载数据失败，请手动重试';
  }
  
  // 加载数据
  function loadData() {
    chrome.storage.local.get('jisiluData', (result) => {
      if (result.jisiluData) {
        // 同时获取指数数据
        chrome.storage.local.get('indexData', (indexResult) => {
          displayData(result.jisiluData, indexResult.indexData);
        });
        updateStatus(result.jisiluData.isTradingTime, result.jisiluData.timestamp);
      } else {
        showLoading();
      }
    });
  }
  
  // 显示数据
  function displayData(data, indexData = null) {
    const jisiluContainer = document.getElementById('jisilu-data-container');
    
    // 确保容器存在
    if (!jisiluContainer) {
      console.error('找不到jisilu-data-container元素');
      return;
    }
    
    console.log('displayData被调用，数据:', data);
    console.log('jisilu-data-container元素:', jisiluContainer);
    console.log('容器当前内容:', jisiluContainer.innerHTML);
    console.log('容器当前display样式:', window.getComputedStyle(jisiluContainer).display);
    
    let html = '';
    
    // 检查是否有数据
    if (!data || !data.hasData || (!data.stockData && !data.cbData)) {
      html = '<div class="no-data">暂无数据，请检查网络连接或手动重试</div>';
      console.log('没有数据，显示提示信息');
      jisiluContainer.innerHTML = html;
      errorContainer.style.display = 'none';
      console.log('设置HTML后，容器内容:', jisiluContainer.innerHTML);
      return;
    }
    
    html += '<div class="jisilu-cards">';
    
    // 股票市场数据
    if (data.stockData) {
      const stock = data.stockData;
      console.log('股票市场数据:', stock);
      
      // 使用中证全指的实时数据来显示涨跌值和涨跌幅
      let changeValue = 'N/A';
      let changePercentValue = 'N/A';
      let changeClass = '';
      
      if (indexData && indexData.zzqz && indexData.zzqz.change && indexData.zzqz.changePercent) {
        const change = parseFloat(indexData.zzqz.change);
        const changePercent = parseFloat(indexData.zzqz.changePercent);
        changeValue = change.toFixed(2);
        changePercentValue = changePercent.toFixed(2) + '%';
        changeClass = change > 0 ? 'up' : (change < 0 ? 'down' : '');
      }

      html += `
        <div class="jisilu-card stock-card">
          <div class="card-title">股票市场</div>
          <div class="card-value">${indexData && indexData.zzqz && indexData.zzqz.current ? parseFloat(indexData.zzqz.current).toFixed(2) : (stock.index_point ? parseFloat(stock.index_point).toFixed(2) : 'N/A')}</div>
          <div class="card-subtitle">中证全指</div>
          <div class="card-details">
            <div class="detail-row">
              <span class="detail-label">涨跌</span>
              <span class="detail-value ${changeClass}">
                ${changeValue} (${changePercentValue})
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">市盈率</span>
              <span class="detail-value">${stock.median_pe ? parseFloat(stock.median_pe).toFixed(2) : 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">PE温度</span>
              <span class="detail-value temp">${stock.median_pe_temperature ? parseFloat(stock.median_pe_temperature).toFixed(2) : 'N/A'}℃</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">市净率</span>
              <span class="detail-value">${stock.median_pb ? parseFloat(stock.median_pb).toFixed(2) : 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">PB温度</span>
              <span class="detail-value temp">${stock.median_pb_temperature ? parseFloat(stock.median_pb_temperature).toFixed(2) : 'N/A'}℃</span>
            </div>
          </div>
        </div>
      `;
    }
    
    // 可转债市场数据
    if (data.cbData) {
      const cb = data.cbData;
      console.log('可转债市场数据:', cb);
      const timeStr = cb.last_time || new Date().toISOString().slice(11,19);

      html += `
        <div class="jisilu-card cb-card">
          <div class="card-title">可转债市场</div>
          <div class="card-value">${cb.cur_index ? parseFloat(cb.cur_index).toFixed(2) : 'N/A'}</div>
          <div class="card-subtitle">${timeStr}</div>
          <div class="card-details">
            <div class="detail-row">
              <span class="detail-label">涨跌</span>
              <span class="detail-value ${parseFloat(cb.cur_increase_val || 0) >= 0 ? 'up' : 'down'}">${cb.cur_increase_val ? parseFloat(cb.cur_increase_val).toFixed(2) : 'N/A'} (${cb.cur_increase_rt ? parseFloat(cb.cur_increase_rt).toFixed(2) + '%' : 'N/A'})</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">成交额</span>
              <span class="detail-value">${cb.amount ? parseFloat(cb.amount).toFixed(0) + '亿' : 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">可转债温度</span>
              <span class="detail-value temp">${cb.temperature ? parseFloat(cb.temperature).toFixed(2) : 'N/A'}℃</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">溢价温度</span>
              <span class="detail-value temp">${cb.premium_temp ? parseFloat(cb.premium_temp).toFixed(2) : 'N/A'}℃</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">平均价格</span>
              <span class="detail-value">${cb.avg_price ? parseFloat(cb.avg_price).toFixed(1) : 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">中位数价格</span>
              <span class="detail-value">${cb.mid_price ? parseFloat(cb.mid_price).toFixed(1) : 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">总数</span>
              <span class="detail-value">${cb.count ? cb.count + '只' : 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">平均溢价率</span>
              <span class="detail-value">${cb.avg_premium_rt ? parseFloat(cb.avg_premium_rt).toFixed(2) + '%' : 'N/A'}</span>
            </div>
          </div>
        </div>
      `;
    }
    
    html += '</div>';
    
    if (!html) {
      html = '<div class="no-data">暂无数据，请检查网络连接或手动重试</div>';
    }
    
    console.log('生成的HTML:', html);
    jisiluContainer.innerHTML = html;
    errorContainer.style.display = 'none';
    console.log('设置HTML后，容器内容:', jisiluContainer.innerHTML);
    console.log('设置HTML后，容器display样式:', window.getComputedStyle(jisiluContainer).display);
  }
  
  // 手动更新按钮点击事件
  updateBtn.addEventListener('click', function() {
    updateBtn.disabled = true;
    updateBtn.textContent = '正在更新...';
    
    chrome.runtime.sendMessage({ action: 'updateNow' }, (response) => {
      if (response) {
        // 等待一下让后台脚本获取数据
        setTimeout(() => {
          updateBtn.disabled = false;
          loadData();
          loadIndexData();
        }, 2000);
      } else {
        updateBtn.disabled = false;
        updateBtn.textContent = '手动更新数据';
        showError();
      }
    });
  });
  
  // 监听来自后台脚本的数据更新消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'dataUpdated') {
      // 同时获取指数数据来更新显示
      chrome.storage.local.get('indexData', (indexResult) => {
        displayData(message.data, indexResult.indexData);
      });
      updateStatus(message.data.isTradingTime, message.data.timestamp);
    } else if (message.action === 'indexDataUpdated') {
      updateIndexDisplay(message.data);
      // 指数数据更新后，重新显示集思录数据以更新中证全指的涨跌信息
      chrome.storage.local.get('jisiluData', (result) => {
        if (result.jisiluData) {
          displayData(result.jisiluData, message.data);
        }
      });
    }
  });
  
  // 标签页切换
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      
      // 移除所有active类
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      // 添加active类到当前标签
      this.classList.add('active');
      const tabContent = document.getElementById(`${tabName}-tab`);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });
  
  // 初始化
  initialize();
});