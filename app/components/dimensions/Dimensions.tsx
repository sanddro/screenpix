import React, { useRef, useEffect, useState } from 'react';
import styles from './Dimensions.scss';
import { getAllDisplaysSize } from '../../utils/Window';

export default function Dimensions({ width, height, topLeft }: any) {
  const dimensions: any = useRef(null);
  const [style, setStyle] = useState(styles.dimensions);

  useEffect(() => {
    const displaysSize = getAllDisplaysSize();

    let st = styles.dimensions;

    if (dimensions && dimensions.current) {
      const dimensionsRect = dimensions.current.getBoundingClientRect();

      if (topLeft.y < dimensionsRect.height) st += ' ' + styles.in;
      if (topLeft.x + dimensionsRect.width > displaysSize.width)
        st += ' ' + styles.left;
      if (
        topLeft.x + dimensionsRect.width > displaysSize.width &&
        topLeft.y + dimensionsRect.height > displaysSize.height
      )
        st += ' ' + styles.topLeft;

      setStyle(st);
    }
  }, [dimensions, topLeft]);

  return (
    <div ref={dimensions} className={style}>{`W: ${width} H: ${height}`}</div>
  );
}
