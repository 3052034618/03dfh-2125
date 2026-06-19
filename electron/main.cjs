const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let retryCount = 0;
const MAX_RETRY = 10;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: '剧本杀司机接单台',
    icon: path.join(__dirname, '../public/icon.png'),
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: isDev,
    },
    backgroundColor: '#f9fafb',
  });

  Menu.setApplicationMenu(null);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    if (isDev && retryCount < MAX_RETRY) {
      retryCount++;
      console.log(`[Electron] 页面加载失败 (${errorDescription})，正在重试 (${retryCount}/${MAX_RETRY})...`);
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:5175');
      }, 1500);
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    retryCount = 0;
  });

  loadApp();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function loadApp() {
  if (isDev) {
    mainWindow.loadURL('http://localhost:5175');
  } else {
    const distPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(distPath);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
