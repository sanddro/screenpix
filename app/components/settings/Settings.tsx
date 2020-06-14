import React, { useEffect, useState } from 'react';
import { remote as Electron } from 'electron';
import { getConfig, setConfig } from '../../constants/Config';
import styles from './Settings.scss';

const Settings = () => {
  const [screenshotHotkey, setScreenshotHotkey] = useState('');
  const [colorPickerHotkey, setColorPickerHotkey] = useState('');
  const [gifHotkey, setGifHotkey] = useState('');

  useEffect(() => {
    setScreenshotHotkey(getConfig().screenshotHotkey);
    setColorPickerHotkey(getConfig().colorPickerHotkey);
    setGifHotkey(getConfig().gifHotkey);
  }, []);

  const validKeys = [
    'HOME',
    'INSERT',
    'DELETE',
    'PRINTSCREEN',
    'F1',
    'F2',
    'F3',
    'F4',
    'F5',
    'F6',
    'F7',
    'F8',
    'F9',
    'F10',
    'F11',
    'F12',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
    '`',
    '~',
    '-',
    '=',
    '+'
  ];

  const isValidKey = (key: string) => {
    key = key.toUpperCase();
    return (key.length === 1 && key.match(/[a-z]/i)) || validKeys.includes(key);
  };

  const onKeyCombinationUp = (e: any, setter: any) => {
    const { key } = e;
    if (!isValidKey(key)) return;

    const newKeyCombination =
      (e.ctrlKey ? 'CommandOrControl+' : '') +
      (e.altKey ? 'Alt+' : '') +
      (e.shiftKey ? 'Shift+' : '') +
      (key.length === 1 && key.match(/[a-z]/i) ? e.key.toUpperCase() : e.key);

    setter(newKeyCombination);
  };

  const onClose = () => {
    Electron.getCurrentWindow().close();
  };

  const onSave = () => {
    setConfig((config: any) => {
      config.screenshotHotkey = screenshotHotkey;
      config.colorPickerHotkey = colorPickerHotkey;
      config.gifHotkey = gifHotkey;
    });

    onClose();
  };

  return (
    <div className={styles.settings}>
      <div className={styles.settings_wrapper}>
        <SettingItem label="Screenshot Hotkey" icon="far fa-object-group">
          <input
            className={styles.inp}
            type="text"
            value={screenshotHotkey.replace('CommandOrControl', 'Ctrl')}
            onKeyUp={e => onKeyCombinationUp(e, setScreenshotHotkey)}
            onChange={() => {}}
          />
        </SettingItem>
        <SettingItem label="Color Picker Hotkey" icon="fas fa-eye-dropper">
          <input
            className={styles.inp}
            type="text"
            value={colorPickerHotkey.replace('CommandOrControl', 'Ctrl')}
            onKeyUp={e => onKeyCombinationUp(e, setColorPickerHotkey)}
            onChange={() => {}}
          />
        </SettingItem>
        <SettingItem label="Gif Capture Hotkey" icon="fas fa-video">
          <input
            className={styles.inp}
            type="text"
            value={gifHotkey.replace('CommandOrControl', 'Ctrl')}
            onKeyUp={e => onKeyCombinationUp(e, setGifHotkey)}
            onChange={() => {}}
          />
        </SettingItem>
      </div>

      <div className={styles.setting_buttons}>
        <button
          className={`${styles.setting_button} ${styles.red}`}
          onClick={onSave}
        >
          Save
        </button>
        <button className={styles.setting_button} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Settings;

function SettingItem({ label, icon, children }: any) {
  return (
    <div className={styles.setting_item}>
      <div className={styles.setting_label}>{label}</div>
      <div className={styles.setting_block}>
        <i className={styles.setting_icon + ' ' + icon} />
        {children}
      </div>
    </div>
  );
}
