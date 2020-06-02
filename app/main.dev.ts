/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  Notification,
  ipcMain
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import isDev from 'electron-is-dev';
import MenuBuilder from './menu';
import {
  showMainWindow,
  hideMainWindow,
  getAllDisplaysSize
} from './utils/window';
import writeToClipboard from './utils/clipboard';
import Config from './constants/Config';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let not: Notification | null = null;
let loadingCSSKey: string;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (isDev || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
}

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    title: 'Settings',
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    fullscreenable: false,
    resizable: false,
    useContentSize: true,
    show: true
  });
  if (!isDev) settingsWindow.setMenu(null);

  settingsWindow.loadURL(`file://${__dirname}/app.html#/settings`);

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

const createWindow = async () => {
  const { width, height } = getAllDisplaysSize();
  mainWindow = new BrowserWindow({
    show: false,
    width,
    height,
    frame: false,
    skipTaskbar: true,
    fullscreenable: false,
    resizable: false,
    movable: false,
    useContentSize: true,
    alwaysOnTop: true,
    thickFrame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: isDev
      ? {
          nodeIntegration: true
        }
      : {
          preload: path.join(__dirname, 'dist/renderer.prod.js')
        }
  });

  mainWindow.setAlwaysOnTop(true, 'pop-up-menu');
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setPosition(0, 0);
  mainWindow.setSize(width, height);

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.webContents.on('did-finish-load', async () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (!isDev) mainWindow.webContents.closeDevTools();

    globalShortcut.register(Config.screenshotHotkey, async () => {
      if (mainWindow?.isVisible()) return;
      showMainWindow(mainWindow);
      loadingCSSKey = await (mainWindow as BrowserWindow).webContents.insertCSS(
        '* { cursor: progress !important; }'
      );
    });
  });

  ipcMain.on('screenCaptured', () => {
    mainWindow?.webContents.removeInsertedCSS(loadingCSSKey);
  });

  ipcMain.on('copyRegion', (_, base64String) => {
    writeToClipboard(base64String);
    hideMainWindow(mainWindow);
  });

  ipcMain.on('hideMainWindow', () => {
    hideMainWindow(mainWindow);
  });

  mainWindow.on('closed', () => {
    globalShortcut.unregister(Config.screenshotHotkey);
    mainWindow = null;
    tray = null;
  });

  mainWindow.on('resize', () => {
    if (
      mainWindow?.getSize()[0] !== width + Config.windowOutlineWidth ||
      mainWindow?.getSize()[1] !== height + Config.windowOutlineWidth
    ) {
      mainWindow?.setSize(
        width + Config.windowOutlineWidth,
        height + Config.windowOutlineWidth
      );
    }
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  tray = new Tray(`${__dirname}/icon512.png`);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      click() {
        createSettingsWindow();
      }
    },
    {
      label: 'Quit',
      click() {
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip('Screenpix');

  tray.on('click', () => {
    showMainWindow(mainWindow);
  });

  if (Notification.isSupported()) {
    not = new Notification({
      title: 'Screenpix',
      body: `Screenpix is running minimized in tray. Press ${Config.screenshotHotkey.replace(
        'CommandOrControl',
        'Ctrl'
      )} to open.`,
      icon: `${__dirname}/icon512.png`
    });
    not.show();
  }
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
