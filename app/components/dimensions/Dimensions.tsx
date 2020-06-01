import React from 'react';
import styles from './Dimensions.scss';
import { getAllDisplaysSize } from '../../utils/window';

export default function Dimensions({ width, height, topLeft }: any) {
  const displaysSize = getAllDisplaysSize();

  let style = styles.dimensions;
  if (topLeft.y < 25) style += ' ' + styles.in;
  if (topLeft.x + 100 > displaysSize.width) style += ' ' + styles.left;
  if (
    topLeft.x + 100 > displaysSize.width &&
    topLeft.y + 25 > displaysSize.height
  )
    style += ' ' + styles.topLeft;

  return <div className={style}>{`W: ${width} H: ${height}`}</div>;
}
