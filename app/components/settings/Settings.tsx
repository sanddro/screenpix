import React, { useEffect, useState } from 'react';
import { remote as Electron } from 'electron';
import { getConfig, setConfig } from '../../constants/Config';
import styles from './Settings.scss';

const Settings = () => {
  const [keyCombination, setKeyCombination] = useState('');

  useEffect(() => {
    setKeyCombination(getConfig().screenshotHotkey);
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

  const onKeyCombinationDown = (e: any) => {
    const { key } = e;
    if (!isValidKey(key)) return;

    const newKeyCombination =
      (e.ctrlKey ? 'CommandOrControl+' : '') +
      (e.altKey ? 'Alt+' : '') +
      (e.shiftKey ? 'Shift+' : '') +
      (key.length === 1 && key.match(/[a-z]/i) ? e.key.toUpperCase() : e.key);

    setKeyCombination(newKeyCombination);
  };

  const onClose = () => {
    Electron.getCurrentWindow().close();
  };

  const onSave = () => {
    setConfig((config: any) => {
      config.screenshotHotkey = keyCombination;
    });

    onClose();
  };

  return (
    <div className={styles.settings}>
      <div className={styles.settings_wrapper}>
        <div className={styles.setting_item}>
          <div className={styles.setting_label}>Screenshot hotkey</div>
          <div className={styles.setting_block}>
            <i className={'far fa-keyboard ' + styles.setting_icon} />
            <input
              className={styles.inp}
              type="text"
              value={keyCombination.replace('CommandOrControl', 'Ctrl')}
              onKeyUp={onKeyCombinationDown}
              onChange={() => {}}
            />
          </div>
        </div>
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
