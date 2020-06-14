import React, { useRef, useEffect, useState } from 'react';
import styles from './Toolbar.scss';
import { getAllDisplaysSize } from '../../utils/Window';
import useKeyPress from '../../hooks/KeyPress';

export default function Toolbar({
  hidden,
  bottomRight,
  recordingTime,
  onCopy,
  onSave,
  onRecord,
  onStop,
  showCopy = true,
  showSave = true,
  showRecord = true,
  showStop = true
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
  }, [ctrlCPressed, ctrlSPressed]);

  return (
    <div
      ref={toolbar}
      className={`${style} ${hidden ? styles.hidden : ''}`}
      onMouseDown={e => e.stopPropagation()}
    >
      {showCopy && (
        <button className={styles.btn} title="Copy (Ctrl+C)" onClick={onCopy}>
          <i className="fa fa-copy" />
        </button>
      )}
      {showSave && (
        <button className={styles.btn} title="Save (Ctrl+S)" onClick={onSave}>
          <i className="fa fa-save" />
        </button>
      )}
      {showRecord && (
        <button className={styles.btn} title="Record" onClick={onRecord}>
          <i className="fas fa-circle" />
        </button>
      )}
      {showStop && (
        <button className={styles.btn} title="Stop recording" onClick={onStop}>
          <i className="fas fa-stop" />
        </button>
      )}
      {recordingTime && (
        <div className={styles.recording_time}>{recordingTime}</div>
      )}
    </div>
  );
}
