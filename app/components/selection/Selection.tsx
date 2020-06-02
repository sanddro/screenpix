import React, { useState } from 'react';
import styles from './Selection.scss';
import Toolbar from '../toolbar/Toolbar';
import Dimensions from '../dimensions/Dimensions';
import Resizer from '../resizer/Resizer';

export default function Selection({ onCopy, onSave, loaded }: any) {
  const [size, setSize]: any = useState(null);
  const [topLeft, setTopLeft]: any = useState(null);
  const [isSelected, setIsSelected] = useState(false);

  const bottomRight = {
    x: size && topLeft ? topLeft.x + size.width : undefined,
    y: size && topLeft ? topLeft.y + size.height : undefined
  };

  const copy = () => {
    onCopy(topLeft, size.width, size.height);
  };

  const save = () => {
    onSave(topLeft, size.width, size.height);
  };

  const onResizerChange = (newSize: any, newTopLeft: any) => {
    setSize(newSize);
    setTopLeft(newTopLeft);
  };

  const onSelectStart = () => setIsSelected(false);
  const onSelectedEnd = () => setIsSelected(true);

  let borders: any = {
    borderLeftWidth: document.body.offsetWidth / 2,
    borderRightWidth: document.body.offsetWidth / 2,
    borderBottomWidth: document.body.offsetHeight / 2,
    borderTopWidth: document.body.offsetHeight / 2
  };

  if (size && topLeft) {
    borders = {
      borderLeftWidth: topLeft.x,
      borderTopWidth: topLeft.y
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
    <div className={styles.wrapper}>
      <div className={styles.bg} style={borders} />
      <Resizer
        onChange={onResizerChange}
        onSelectStart={onSelectStart}
        onSelectEnd={onSelectedEnd}
      >
        {size && topLeft && (
          <Dimensions
            width={size?.width}
            height={size?.height}
            topLeft={topLeft}
          />
        )}
        <Toolbar
          hidden={!isSelected}
          width={size?.width}
          height={size?.height}
          bottomRight={bottomRight}
          onCopy={copy}
          onSave={save}
        />
      </Resizer>
    </div>
  );
}
