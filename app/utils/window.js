import electron from 'electron';
import Config from '../constants/Config';

export function getDisplaysSize(displays) {
  let screensWidth = 0;
  let screensHeight = 0;

  displays.forEach(display => {
    screensWidth = Math.max(
      display.bounds.x + display.bounds.width,
      screensWidth
    );
    screensHeight = Math.max(
      display.bounds.y + display.bounds.height,
      screensHeight
    );
  });

  return { width: screensWidth, height: screensHeight };
}

export function getAllDisplaysSize() {
  const screen = electron.screen || electron.remote.screen;
  return getDisplaysSize(screen.getAllDisplays());
}

export function showMainWindow(win) {
  const { width, height } = getAllDisplaysSize();
  // opacity to fix issue when window shows and then moves to cursor
  win.webContents.send('showWindow');
  win.setOpacity(0);
  win.setBounds({
    width: width + Config.windowOutlineWidth,
    height: height + Config.windowOutlineWidth,
    x: -(Config.windowOutlineWidth / 2),
    y: -(Config.windowOutlineWidth / 2)
  });
  win.show();
  win.focus();
  setTimeout(() => {
    win.setOpacity(1);
  }, 300);
}

export function hideMainWindow(win) {
  // opacity to remove minimize animation
  win.setOpacity(0);
  // to return focus to previous place. minimize - windows, hide - linux
  win.minimize();
  win.hide();
  win.webContents.send('windowHidden');
}
