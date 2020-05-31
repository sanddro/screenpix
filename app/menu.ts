/* eslint @typescript-eslint/ban-ts-ignore: off */
import { Menu, BrowserWindow } from 'electron';
import { hideMainWindow } from './utils/window';

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template = this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          }
        }
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDefaultTemplate() {
    let submenu = [
      {
        label: 'Close',
        accelerator: 'Escape',
        click: () => {
          hideMainWindow(this.mainWindow);
        }
      }
    ];

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      submenu = [
        ...submenu,
        {
          label: '&Reload',
          accelerator: 'Ctrl+R',
          click: () => {
            this.mainWindow.webContents.reload();
          }
        },
        {
          label: 'Toggle &Developer Tools',
          accelerator: 'F12',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          }
        }
      ];
    }
    const templateDefault = [
      {
        label: '&View',
        submenu
      }
    ];

    return templateDefault;
  }
}
