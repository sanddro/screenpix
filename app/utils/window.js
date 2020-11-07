import electron from 'electron';
import { getConfig, isMain } from '../constants/Config';

const singleDisplayMode = false;

export function getDisplaysSize(displays) {
  let screensWidth = 0;
  let screensHeight = 0;

  const screen = electron.screen || electron.remote.screen;
  if (singleDisplayMode) displays = [screen.getPrimaryDisplay()];

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
  if (!isMain()) {
    return {
      width: document.body.clientWidth,
      height: document.body.clientHeight
    };
  }

  const screen = electron.screen || electron.remote.screen;

  return getDisplaysSize(screen.getAllDisplays());
}

export function getHoveredDisplayBounds() {
  const screen = electron.screen || electron.remote.screen;

  return singleDisplayMode
    ? screen.getPrimaryDisplay().bounds
    : screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds;
}

export function showMainWindow(win, ignoreMouseEvents, delay = 300) {
  const { width, height } = getAllDisplaysSize();
  // opacity to fix issue when window shows and then moves to cursor
  win.webContents.send('showWindow');
  win.setOpacity(0);
  win.setBounds({
    width: width + getConfig().windowOutlineWidth,
    height: height + getConfig().windowOutlineWidth,
    x: -(getConfig().windowOutlineWidth / 2),
    y: -(getConfig().windowOutlineWidth / 2)
  });
  win.closeDevTools();
  win.show();
  win.focus();
  win.setIgnoreMouseEvents(ignoreMouseEvents);
  setTimeout(() => {
    win.setOpacity(1);
  }, delay);
}

export function hideMainWindow(win) {
  // opacity to remove minimize animation
  win.setOpacity(0);
  // to return focus to previous place. minimize - windows, hide - linux
  win.minimize();
  win.hide();
  win.setIgnoreMouseEvents(false);
  win.webContents.send('windowHidden');
}
