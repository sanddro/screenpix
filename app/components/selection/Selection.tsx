/* eslint-disable */

import React, { useState } from 'react';
import styles from './Selection.scss';

export default function Selection({ onSelect }: any) {
  const [size, setSize]: any = useState(null);
  const [startPosition, setStartPosition]: any = useState(null);
  const [endPosition, setEndPosition]: any = useState(null);
  const [dragging, setDragging]: any = useState(false);

  const onMouseDown = () => {
    setSize(null);
    setStartPosition(null);
    setEndPosition(null);
    setDragging(true);
  };

  const onMouseUp = () => {
    if (size) {
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
    const pos: any = { x: e.pageX, y: e.pageY };
    if (!startPosition) {
      setStartPosition(pos);
    }
    setEndPosition(pos);
    const width = Math.abs(pos.x - (startPosition?.x || pos.x));
    const height = Math.abs(pos.y - (startPosition?.y || pos.y));
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
          left: Math.min(startPosition?.x, endPosition?.x) || undefined,
          top: Math.min(startPosition?.y, endPosition?.y) || undefined,
          border: !size ? 'none' : undefined
        }}
      />
    </div>
  );
}
