/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import { Resizable } from 're-resizable';
import styles from './Selection.scss';
import Toolbar from '../toolbar/Toolbar';
import Dimensions from '../dimensions/Dimensions';

export default function Selection({ onSelect, loaded }: any) {
  const [size, setSize]: any = useState(null);
  const [startPosition, setStartPosition]: any = useState(null);
  const [endPosition, setEndPosition]: any = useState(null);
  const [dragging, setDragging]: any = useState(false);

  const [isSelected, setIsSelected] = useState(false);

  const topLeft = {
    x: size ? Math.min(startPosition?.x, endPosition?.x) : undefined,
    y: size ? Math.min(startPosition?.y, endPosition?.y) : undefined
  };

  const bottomRight = {
    x: size ? topLeft.x + size.width : undefined,
    y: size ? topLeft.y + size.height : undefined
  };

  const onCopy = () => {
    onSelect(topLeft, size.width, size.height);
  };

  const onSave = () => {};

  const onMouseDown = (e: any) => {
    setSize(null);
    setStartPosition({ x: e.screenX, y: e.screenY });
    setEndPosition(null);
    setDragging(true);
    setIsSelected(false);
  };

  const onMouseUp = () => {
    setIsSelected(size && size.width && size.height);
    setDragging(false);
  };

  const onMouseMove = (e: any) => {
    if (!dragging) return;
    const pos: any = { x: e.screenX, y: e.screenY };
    const startPos = startPosition || pos;

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

  if (!loaded) {
    return <div className={styles.wrapper} />;
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
        className={`${styles.box} ${size ? '' : styles.not_selected}`}
        style={{
          width: size?.width,
          height: size?.height,
          left: topLeft.x,
          top: topLeft.y,
          border: !size ? 'none' : undefined
        }}
      >
        {size && (
          <Dimensions
            width={size?.width}
            height={size?.height}
            topLeft={topLeft}
          />
        )}
        {isSelected && (
          <Toolbar
            width={size?.width}
            height={size?.height}
            bottomRight={bottomRight}
            onCopy={onCopy}
            onSave={onSave}
          />
        )}
      </div>
    </div>
  );
}
