/* eslint-disable */

import React, { useState } from 'react';
import styles from './Selection.scss';
import Toolbar from '../toolbar/Toolbar';

export default function Selection({ onSelect }: any) {
  const [size, setSize]: any = useState(null);
  const [startPosition, setStartPosition]: any = useState(null);
  const [endPosition, setEndPosition]: any = useState(null);
  const [dragging, setDragging]: any = useState(false);

  const isSelected = () => size && size.width && size.height;

  const onMouseDown = (e: any) => {
    setSize(null);
    setStartPosition({ x: e.screenX, y: e.screenY });
    setEndPosition(null);
    setDragging(true);
  };

  const onMouseUp = () => {
    if (isSelected()) {
      const topLeft = {
        x: Math.min(startPosition?.x, endPosition?.x),
        y: Math.min(startPosition?.y, endPosition?.y)
      };
      onSelect(topLeft, size.width, size.height);
    }

    setSize(null);
    setStartPosition(null);
    setEndPosition(null);
    setDragging(false);
  };

  const onMouseMove = (e: any) => {
    if (!dragging) return;
    const pos: any = { x: e.screenX, y: e.screenY };
    let startPos = startPosition || pos;

    setEndPosition(pos);
    const width = Math.abs(pos.x - startPos.x);
    const height = Math.abs(pos.y - startPos.y);
    setSize({ width, height });
  };

  let borders: any = {
    borderLeftWidth: document.body.offsetWidth / 2,
    borderRightWidth: document.body.offsetWidth / 2,
    borderBottomWidth: document.body.offsetHeight / 2,
    borderTopWidth: document.body.offsetHeight / 2
  };

  if (size) {
    borders = {
      borderLeftWidth: Math.min(startPosition?.x, endPosition?.x),
      borderTopWidth: Math.min(startPosition?.y, endPosition?.y)
    };
    borders.borderRightWidth =
      document.body.offsetWidth - borders.borderLeftWidth - size.width;

    borders.borderBottomWidth =
      document.body.offsetHeight - borders.borderTopWidth - size.height;
  }

  const topLeft = {
    x: size ? Math.min(startPosition?.x, endPosition?.x) : undefined,
    y: size ? Math.min(startPosition?.y, endPosition?.y) : undefined
  };

  return (
    <div
      className={styles.wrapper}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      <div className={styles.bg} style={borders} />
      <div
        className={styles.box}
        style={{
          width: size?.width,
          height: size?.height,
          left: topLeft.x,
          top: topLeft.y,
          border: !size ? 'none' : undefined
        }}
      >
        {size && (
          <Toolbar
            width={size?.width}
            height={size?.height}
            topLeft={topLeft}
          />
        )}
      </div>
    </div>
  );
}
