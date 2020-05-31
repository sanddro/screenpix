import React from 'react';
import styles from './Toolbar.scss';

export default function Toolbar({ width, height, topLeft }: any) {
  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dimensions} ${topLeft.y < 25 ? styles.in : ''}`}
      >
        {`W: ${width} H: ${height}`}
      </div>
    </div>
  );
}
