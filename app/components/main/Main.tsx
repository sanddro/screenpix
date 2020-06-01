/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import styles from './Main.scss';
import takeScreenshot, { resizeDataURL } from '../../utils/Screenshot';
import Selection from '../selection/Selection';

export default function Main() {
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    ipcRenderer.on('showWindow', async () => {
      try {
        const base64String = await takeScreenshot();
        setImgSrc(base64String);
        ipcRenderer.send('screenCaptured', base64String);
      } catch (e) {
        console.error(e);
      }
    });

    ipcRenderer.on('windowHidden', () => {
      setImgSrc('');
    });

    return () => {
      ipcRenderer.removeAllListeners('showWindow');
      ipcRenderer.removeAllListeners('windowHidden');
    };
  }, []);

  const onSelect = async (topLeft: any, width: number, height: number) => {
    const resized = await resizeDataURL(
      document.getElementById('full-img'),
      topLeft.x,
      topLeft.y,
      width,
      height
    );
    if (resized) ipcRenderer.send('regionSelected', resized);
  };

  return (
    <div className={styles.wrapper}>
      {imgSrc && (
        <img className={styles.capturedImg} src={imgSrc} alt="" id="full-img" />
      )}
      <Selection onSelect={onSelect} loaded={!!imgSrc} />
    </div>
  );
}
