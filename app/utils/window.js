import { screen } from 'electron';

export function showMainWindow(win) {
  const { width, height } = screen.getPrimaryDisplay().bounds;
  // opacity to fix issue when window shows and then moves to cursor
  win.setOpacity(0);
  win.setBounds({
    width: width + 20,
    height: height + 20,
    x: -10,
    y: -10
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
