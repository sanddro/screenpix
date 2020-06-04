import React, { useEffect, useState, useRef } from 'react';
import { ipcRenderer } from 'electron';
import styles from './Main.scss';
import takeScreenshot, {
  resizeDataURL,
  downloadBase64Image
} from '../../utils/Screenshot';
import Selection from '../selection/Selection';
import { getMode, Mode } from '../../constants/Mode';
import ColorPicker from '../color-picker/ColorPicker';

export default function Main() {
  const fullImg = useRef(null);

  const [imgSrc, setImgSrc] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const mode: Mode = getMode();

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

  const onCopy = async (topLeft: any, width: number, height: number) => {
    const resized = await resizeDataURL(
      document.getElementById('full-img'),
      topLeft.x,
      topLeft.y,
      width,
      height
    );
    if (resized) ipcRenderer.send('copyRegion', resized);
  };

  const onSave = (topLeft: any, width: number, height: number) => {
    const resized: any = resizeDataURL(
      document.getElementById('full-img'),
      topLeft.x,
      topLeft.y,
      width,
      height
    );
    if (!resized) return;

    downloadBase64Image(resized);

    ipcRenderer.send('hideMainWindow');
  };

  const onColorCopy = (color: string) => {
    ipcRenderer.send('copyColor', color);
  };

  return (
    <div className={styles.wrapper}>
      <img
        className={`${styles.capturedImg} ${!imgSrc ? styles.hidden : ''}`}
        src={imgSrc}
        alt=""
        id="full-img"
        ref={fullImg}
      />
      {isVisible && mode === Mode.screenshot && (
        <Selection onCopy={onCopy} onSave={onSave} loaded={!!imgSrc} />
      )}
      {isVisible && mode === Mode.colorPicker && (
        <ColorPicker
          onColorCopy={onColorCopy}
          fullImg={fullImg && fullImg.current}
        >
          <img src={imgSrc} alt="" />
        </ColorPicker>
      )}
    </div>
  );
}
