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
import fs from 'fs';
import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  screen,
  Notification,
  ipcMain
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { showMainWindow, hideMainWindow } from './utils/window';
import writeToClipboard from './utils/clipboard';

const hotkey = 'Alt+PrintScreen';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let not: Notification | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  // const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extensions: any[] = [];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }
  const { width, height } = screen.getPrimaryDisplay().bounds;
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
    webPreferences:
      process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
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
    // mainWindow.webContents.closeDevTools();
  });

  globalShortcut.register(hotkey, () => {
    mainWindow?.webContents.send('captureScreenshot');
  });

  ipcMain.on('screenCaptured', (_, base64String) => {
    const base64Image = base64String.split(';base64,').pop();
    fs.writeFile('image.jpg', base64Image, { encoding: 'base64' }, () => {});
    showMainWindow(mainWindow);
  });

  ipcMain.on('regionSelected', (_, base64String) => {
    writeToClipboard(base64String);
    hideMainWindow(mainWindow);
  });

  mainWindow.on('closed', () => {
    globalShortcut.unregister(hotkey);
    mainWindow = null;
    tray = null;
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
      click() {}
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
    mainWindow?.webContents.send('captureScreenshot');
  });

  if (Notification.isSupported()) {
    not = new Notification({
      title: 'Screenpix',
      body: `Screenpix is running minimized in tray. Press ${hotkey.replace(
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
