import React, { useRef, useEffect, useState } from 'react';
import styles from './Toolbar.scss';
import { getAllDisplaysSize } from '../../utils/window';
import useKeyPress from '../../hooks/KeyPress';

export default function Toolbar({
  width,
  height,
  bottomRight,
  onCopy,
  onSave
}: any) {
  const toolbar: any = useRef(null);
  const [style, setStyle] = useState(styles.toolbar);
  const ctrlCPressed = useKeyPress('c', true);
  const ctrlSPressed = useKeyPress('s', true);

  useEffect(() => {
    const displaysSize = getAllDisplaysSize();

    let st = styles.toolbar;

    if (toolbar && toolbar.current) {
      const toolbarRect = toolbar.current.getBoundingClientRect();
      if (bottomRight.y + toolbarRect.height + 3 > displaysSize.height)
        st += ' ' + styles.in;
      if (bottomRight.x - 5 < toolbarRect.width) st += ' ' + styles.right;
      if (
        bottomRight.x - 5 < toolbarRect.width &&
        bottomRight.y - 5 < toolbarRect.height
      )
        st += ' ' + styles.bottom_right;

      setStyle(st);
    }
  }, [toolbar, bottomRight]);

  useEffect(() => {
    if (ctrlCPressed) onCopy();
    if (ctrlSPressed) onSave();
  }, [ctrlCPressed, ctrlCPressed]);

  return (
    <div ref={toolbar} className={style} onMouseDown={e => e.stopPropagation()}>
      <button className={styles.btn} title="Copy (Ctrl+C)" onClick={onCopy}>
        <i className="fa fa-copy" />
      </button>
      <button className={styles.btn} title="Save (Ctrl+S)" onClick={onSave}>
        <i className="fa fa-save" />
      </button>
    </div>
  );
}
