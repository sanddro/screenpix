import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import styles from './Main.scss';
import takeScreenshot, { resizeDataURL } from '../../utils/Screenshot';
import Selection from '../selection/Selection';

export default function Main() {
  const [imgSrc, setImgSrc] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    ipcRenderer.on('showWindow', async () => {
      setIsVisible(true);
      try {
        const base64String = (await takeScreenshot()) as string;
        setImgSrc(base64String);
        ipcRenderer.send('screenCaptured');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });

    ipcRenderer.on('windowHidden', () => {
      setImgSrc('');
      setIsVisible(false);
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
      <img
        className={`${styles.capturedImg} ${!imgSrc ? styles.hidden : ''}`}
        src={imgSrc}
        alt=""
        id="full-img"
      />
      {isVisible && <Selection onSelect={onSelect} loaded={!!imgSrc} />}
    </div>
  );
}
