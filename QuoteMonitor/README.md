# Stock Quote Monitor

A powerful Chrome browser extension that monitors stock indices and Jisilu market data in real-time, helping investors stay informed about market dynamics. Supports all Chromium-based browsers: Sogou Browser, 360 Browser, etc.

[中文文档](README_zh.md) | English Documentation

## Features

### Stock Index Monitoring
- **A-Share Indices**: Shanghai Composite, Shenzhen Component, ChiNext, STAR 50, Beijing 50, CSI 300, CSI All-Share
- **Hong Kong Indices**: Hang Seng Index, H-Share Index, Hang Seng Tech Index
- **US Indices**: Dow Jones, NASDAQ, S&P 500

### Market Temperature Monitoring
- **Stock Market Temperature**: CSI All-Share real-time data, P/E ratio, P/B ratio, PE temperature, PB temperature
- **Convertible Bond Market Temperature**: Convertible bond index, trading volume, temperature, premium temperature, average price, median price, etc.

### Smart Updates
- **Auto Update**: Updates data every 10 minutes during trading hours, index data every 5 minutes
- **Manual Update**: One-click manual refresh for latest data
- **Trading Status**: Real-time display of current trading status

### Data Display
- **Dual Page Design**: Index page and Temperature page for clear display of different data types
- **Card Layout**: Beautiful card design with hover effects
- **Price Change Indicators**: Clear color coding for price changes (red for up, green for down)
- **Data Caching**: Local data storage, view historical data even offline

## Interface Preview

### Index Page
![Index Page](chrome-extension/img1.png)

### Temperature Page
![Temperature Page](chrome-extension/img2.png)

## Installation

### Method 1: Developer Mode Installation (Recommended)

1. Download or clone this project to your local machine
2. Open Chrome browser and visit `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `chrome-extension` folder
6. Installation complete, click the extension icon in the browser toolbar to use

### Method 2: Packaged Installation

1. Enable "Developer mode" on the `chrome://extensions/` page
2. Click "Pack extension"
3. Select the `chrome-extension` folder
4. After generating the `.crx` file, drag it into Chrome browser to install

## Usage

### Basic Operations

1. **View Data**: Click the extension icon in the browser toolbar to open the popup
2. **Switch Pages**: Click "Index" or "Temperature" tabs to switch between different data views
3. **Manual Update**: Click "Update Data Now" button to get the latest data
4. **View Status**: Top displays current trading status and last update time

### Data Description

#### Index Page
- Displays real-time price, change value, and percentage change for major indices
- Price change colors: Red indicates up, green indicates down
- Data source: Tencent Finance API

#### Temperature Page
- **Stock Market**: Displays CSI All-Share real-time data, P/E ratio, P/B ratio, and temperature indicators
- **Convertible Bond Market**: Displays convertible bond index, trading volume, temperature, premium temperature, and detailed data
- Data source: Jisilu API

### Auto Update Mechanism

- **Trading Time Detection**: Monday to Friday 9:30-15:00 is considered trading time
- **Auto Update Frequency**:
  - Jisilu data: Updated every 10 minutes
  - Index data: Updated every 5 minutes
- **Non-Trading Hours**: Auto update paused, only manual update available

## Technical Architecture

### Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Extension API**: Chrome Extension Manifest V3
- **Data Storage**: Chrome Storage API
- **Scheduled Tasks**: Chrome Alarms API
- **Network Requests**: Fetch API

### Project Structure

```
QuoteMonitor/
├── chrome-extension/
│   ├── manifest.json          # Extension configuration file
│   ├── background.js           # Background service script
│   ├── popup.html              # Popup page HTML
│   ├── popup.js                # Popup page script
│   ├── popup.css               # Popup page styles
│   ├── content.js              # Content script
│   ├── index.html              # Standalone page HTML
│   ├── index.js                # Standalone page script
│   ├── index.css               # Standalone page styles
│   ├── icons/                  # Icon resources
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   ├── icon128.png
│   │   └── icon.svg
│   ├── img1.png                # Screenshot 1
│   ├── img2.png                # Screenshot 2
├── README_zh.md                # Chinese documentation
└── README.md                   # English documentation
```

### Core Modules

#### background.js
- Responsible for background data fetching and scheduled updates
- Handles index data and Jisilu data requests
- Manages trading time detection
- Processes messages from popup

#### popup.js
- Responsible for popup page data display and interaction
- Handles tab switching
- Displays loading status and error messages
- Responds to manual update operations

#### content.js
- Executes in Jisilu webpage context
- Bypasses CORS restrictions to fetch data
- Handles cross-origin requests

## Data Sources

### Stock Index Data
- **Source**: Tencent Finance API
- **Endpoint**: `https://qt.gtimg.cn/q={index_code}`
- **Update Frequency**: Every 5 minutes

### Jisilu Market Data
- **Source**: Jisilu Official Website
- **Stock Temperature Endpoint**: `https://www.jisilu.cn/data/indicator/get_last_indicator/`
- **Convertible Bond Endpoint**: `https://www.jisilu.cn/webapi/cb/index_quote/`
- **Update Frequency**: Every 10 minutes

## FAQ

### Q: Data not updating in time?
A: Please check your network connection or click "Update Data Now" button to force refresh. Auto updates are available during trading hours, only manual updates are available during non-trading hours.

### Q: Shows "No Data Available"?
A: It may be a network issue or the API interface is temporarily unavailable. Please try again later or manually update the data.

### Q: Index data is inaccurate?
A: Data comes from third-party APIs and may have delays. Please refer to official data for accuracy.

### Q: How to uninstall the extension?
A: Find "Stock Quote Monitor" on the `chrome://extensions/` page and click "Remove".

## Development

### Local Development

1. Clone the project to your local machine
2. Load the `chrome-extension` folder in Chrome
3. After modifying code, click "Reload" button on the extensions page
4. Open the extension for testing

### Debugging Tips

- **Background Script Debugging**: Click "Service Worker" link on the `chrome://extensions/` page
- **Popup Debugging**: Right-click on the popup and select "Inspect"
- **View Logs**: View detailed logs in the Console of Developer Tools


## Version History

### v1.0 (2026-02-09)
- Initial release
- Support for A-Share, Hong Kong, and US stock index monitoring
- Support for Jisilu stock and convertible bond market temperature monitoring
- Auto scheduled updates and manual update functionality
- Dual page design, optimized user experience

## License

This project is for learning and personal use only.

## Contributing

Issues and Pull Requests are welcome to improve this project.

## Contact

For questions or suggestions, please contact via GitHub Issues.

## Disclaimer

The data provided by this extension is for reference only and does not constitute any investment advice. Investing involves risks, please be cautious. Please refer to official data for accuracy. The author is not responsible for any losses caused by using this extension.
