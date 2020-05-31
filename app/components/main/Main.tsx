/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import styles from './Main.scss';
import takeScreenshot, { resizeDataURL } from '../../utils/Screenshot';
import Selection from '../selection/Selection';

export default function Main() {
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    ipcRenderer.on('captureScreenshot', async () => {
      try {
        const base64String = await takeScreenshot();
        ipcRenderer.send('screenCaptured', base64String);
        setImgSrc(base64String);
      } catch (e) {
        console.error(e);
      }
    });
    return () => {
      ipcRenderer.removeAllListeners('captureScreenshot');
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
      {imgSrc && (
        <img className={styles.capturedImg} src={imgSrc} alt="" id="full-img" />
      )}
      <Selection onSelect={onSelect} />
    </div>
  );
}
