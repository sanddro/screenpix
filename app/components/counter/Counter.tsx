import React, { useState } from 'react';
import styles from './Counter.scss';

export default function Counter() {
  const [counter, setCounter] = useState(0);

  const increment = () => setCounter(counter + 1);
  const decrement = () => setCounter(counter + 1);

  return (
    <div className={styles.wrapper}>
      <div className={`counter ${styles.counter}`} data-tid="counter">
        {counter}
      </div>
      <div>
        <button
          className={styles.btn}
          onClick={increment}
          data-tclass="btn"
          type="button"
        >
          <i className="fa fa-plus" />
        </button>
        <button
          className={styles.btn}
          onClick={decrement}
          data-tclass="btn"
          type="button"
        >
          <i className="fa fa-minus" />
        </button>
      </div>
    </div>
  );
}
