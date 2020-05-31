/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { ipcRenderer } from 'electron';
import styles from './Main.scss';
import takeScreenshot, {
  resizeDataURL,
  clearCanvas
} from '../../utils/Screenshot';
import Selection from '../selection/Selection';

export default function Main() {
  useEffect(() => {
    ipcRenderer.on('captureScreenshot', async () => {
      try {
        const base64String = await takeScreenshot(
          document.querySelector('#full-img')
        );
        ipcRenderer.send('screenCaptured', base64String);
      } catch (e) {
        console.error(e);
      }
    });
    ipcRenderer.on('windowHidden', () => {
      clearCanvas(document.querySelector('#full-img'));
    });
    return () => {
      ipcRenderer.removeAllListeners('captureScreenshot');
      ipcRenderer.removeAllListeners('windowHidden');
    };
  }, []);

  const onSelect = async (topLeft: any, width: number, height: number) => {
    const resizedDataUrl = await resizeDataURL(
      document.getElementById('full-img'),
      topLeft.x,
      topLeft.y,
      width,
      height
    );
    ipcRenderer.send('regionSelected', resizedDataUrl);
  };

  return (
    <div className={styles.wrapper}>
      <canvas className={styles.capturedImg} id="full-img" />
      <Selection onSelect={onSelect} />
    </div>
  );
}
