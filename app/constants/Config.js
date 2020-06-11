import { remote, ipcRenderer } from 'electron';

export const defaultConfig = {
  windowOutlineWidth: 20,
  screenshotHotkey: 'Alt+PrintScreen',
  colorPickerHotkey: 'CommandOrControl+Alt+PrintScreen',
  videoHotkey: 'CommandOrControl+Alt+Shift+PrintScreen',
  settingsWindowWidth: 500,
  settingsWindowHeight: 400
};

export function initConfig() {
  let config = defaultConfig;

  try {
    const savedConfig = localStorage.getItem('config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      config = Object.assign(config, parsed);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Could not parse config from local storage');
    localStorage.setItem('config', JSON.stringify(config));
  }

  remote.getGlobal('shared').config = config;
}

export function isMain() {
  return process && (!process.type || process.type !== 'renderer');
}

export function getConfig() {
  return isMain() ? global.shared.config : remote.getGlobal('shared').config;
}

export function setConfig(fnc) {
  const oldConfig = { ...getConfig() };
  fnc(getConfig());
  if (!isMain()) {
    localStorage.setItem('config', JSON.stringify(getConfig()));
    ipcRenderer.send('configChanged', {
      oldValue: oldConfig,
      newValue: getConfig()
    });
  }
}
