/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useRef } from 'react';
import styles from './ColorPicker.scss';
import useMousePosition from '../../hooks/MousePosition';
import { getColorFromImage } from '../../utils/Screenshot';
import { getAllDisplaysSize } from '../../utils/window';
import { getConfig } from '../../constants/Config';

const magnifierSize = 300;

export default function ColorPicker({ onColorCopy, children, fullImg }: any) {
  const wrapper = useRef(null);
  const mousePos = useMousePosition(wrapper && wrapper.current);

  // const color = mousePos && fullImg && getColorFromImage(fullImg, mousePos);
  const color = '';

  const onCopy = () => {
    if (!mousePos) return;
    onColorCopy(getColorFromImage(fullImg, mousePos));
  };

  let magnifierPosStyle: any = styles.top_left;

  if (mousePos) {
    if (mousePos.y < magnifierSize) {
      if (mousePos.x < magnifierSize) magnifierPosStyle = styles.bottom_right;
      else magnifierPosStyle = styles.bottom_left;
    } else if (mousePos.x < magnifierSize) magnifierPosStyle = styles.top_right;
    else magnifierPosStyle = styles.top_left;
  }

  return (
    <div ref={wrapper} className={styles.wrapper} onClick={onCopy}>
      <div
        className={`${styles.magnifier} ${magnifierPosStyle}`}
        style={{
          display: !mousePos ? 'none' : '',
          left: mousePos?.x,
          top: mousePos?.y
        }}
      >
        <div className={styles.dot} />
        <div className={styles.zoomed_img_wrapper}>
          <div
            className={styles.zoomed_img}
            style={{
              left: mousePos && -(mousePos?.x - magnifierSize / 2),
              top: mousePos && -(mousePos?.y - magnifierSize / 2)
            }}
          >
            {children}
          </div>
        </div>
        <div className={styles.color} style={{ background: `#${color}` }} />
        <div className={styles.grid} />
      </div>
    </div>
  );
}
