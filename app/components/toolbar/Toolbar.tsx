import React from 'react';
import styles from './Toolbar.scss';

export default function Toolbar({ onCopy, onSave }: any) {
  return (
    <div className={styles.toolbar} onMouseDown={e => e.stopPropagation()}>
      <button className={styles.btn} title="Copy (Ctrl+C)" onClick={onCopy}>
        <i className="fa fa-copy" />
      </button>
      <button className={styles.btn} title="Save (Ctrl+S)" onClick={onSave}>
        <i className="fa fa-save" />
      </button>
    </div>
  );
}
