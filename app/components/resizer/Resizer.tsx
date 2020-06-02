import React, { useState, useRef, useEffect } from 'react';
import styles from './Resizer.scss';

const handleSize = 10;

const opposite: any = {
  'top-left': 'bottom-right',
  'top-right': 'bottom-left',
  'bottom-right': 'top-left',
  'bottom-left': 'top-right'
};

export default function Resizer({
  children,
  onChange = () => {},
  onSelectStart = () => {},
  onSelectEnd = () => {}
}: any) {
  const box: any = useRef(null);
  const wrapper: any = useRef(null);

  const [startPos, setStartPos]: any = useState(null);
  const [endPos, setEndPos]: any = useState(null);
  const [isResizing, setIsResizing]: any = useState(false);
  const [isDragging, setIsDragging]: any = useState(false);
  const [dragStartPos, setDragStartPos]: any = useState(null);
  const [dragEndPos, setDragEndPos]: any = useState(null);

  let size: any = null;
  let topLeft: any = null;
  if (startPos && endPos) {
    const width = Math.abs(startPos.x - endPos.x);
    const height = Math.abs(startPos.y - endPos.y);
    size = { width, height };

    topLeft = {
      x: Math.min(startPos.x, endPos.x),
      y: Math.min(startPos.y, endPos.y)
    };
  }

  if (!size && box && box.current) {
    const boxRect = box.current.getBoundingClientRect();
    setStartPos({
      x: 0,
      y: 0
    });
    setEndPos({
      x: boxRect.width,
      y: boxRect.height
    });
  }

  useEffect(() => {
    onChange(size, topLeft);
  }, [startPos, endPos, dragStartPos, dragEndPos]);

  if (dragStartPos && dragEndPos) {
    topLeft = topLeft || { x: 0, y: 0 };

    topLeft.x += dragEndPos.x - dragStartPos.x;
    topLeft.y += dragEndPos.y - dragStartPos.y;
  }

  if (topLeft && wrapper && wrapper.current) {
    const wrapperSize = {
      width: wrapper.current.getBoundingClientRect().width,
      height: wrapper.current.getBoundingClientRect().height
    };

    topLeft.x = Math.max(topLeft.x, 0);
    topLeft.y = Math.max(topLeft.y, 0);

    topLeft.x = Math.min(topLeft.x, wrapperSize.width - size.width);
    topLeft.y = Math.min(topLeft.y, wrapperSize.height - size.height);
  }

  const onMouseDown = (e: any) => {
    e.preventDefault();
    const handle = e.target.getAttribute('data-handle');
    const oppositeHandle: any = document.querySelector(
      `[data-handle="${opposite[handle]}"]`
    );

    const wrapperRect = wrapper.current.getBoundingClientRect();
    const oppositeHandleRect = oppositeHandle.getBoundingClientRect();
    const x = oppositeHandleRect.left - wrapperRect.left + handleSize / 2;
    const y = oppositeHandleRect.top - wrapperRect.top + handleSize / 2;

    setStartPos({ x, y });
    setEndPos({
      x: e.clientX - wrapperRect.left,
      y: e.clientY - wrapperRect.top
    });
    setIsResizing(true);
  };

  useEffect(() => {
    const onMouseMove = (e: any) => {
      if (e.buttons !== 1) return;

      if (isResizing) {
        const wrapperRect = wrapper.current.getBoundingClientRect();
        let x = e.clientX - wrapperRect.left;
        let y = e.clientY - wrapperRect.top;

        x = Math.max(x, 0);
        y = Math.max(y, 0);

        x = Math.min(x, wrapper.current.offsetWidth);
        y = Math.min(y, wrapper.current.offsetHeight);

        setEndPos({
          x,
          y
        });
      } else {
        const wrapperRect = wrapper.current.getBoundingClientRect();
        const x = e.clientX - wrapperRect.left;
        const y = e.clientY - wrapperRect.top;

        setDragEndPos({ x, y });
      }
    };

    const stop = () => {
      setIsResizing(false);
      setIsDragging(false);

      if (startPos && dragStartPos && dragEndPos) {
        const x = startPos.x + dragEndPos.x - dragStartPos.x;
        const y = startPos.y + dragEndPos.y - dragStartPos.y;
        setStartPos({
          x,
          y
        });
      }

      if (endPos && dragStartPos && dragEndPos) {
        const x = endPos.x + dragEndPos.x - dragStartPos.x;
        const y = endPos.y + dragEndPos.y - dragStartPos.y;
        setEndPos({
          x,
          y
        });
      }

      setDragEndPos(null);
      setDragStartPos(null);

      if (isResizing) onSelectEnd();
    };

    document.body.onmousemove = onMouseMove;
    document.body.onmouseup = stop;

    return () => {
      document.body.onmousemove = null;
    };
  }, [isResizing, isDragging, startPos, endPos, dragEndPos, dragStartPos]);

  const onDragStart = (e: any) => {
    const wrapperRect = wrapper.current.getBoundingClientRect();
    const x = e.clientX - wrapperRect.left;
    const y = e.clientY - wrapperRect.top;

    setDragStartPos({ x, y });

    setIsDragging(true);
  };

  const onNewSelect = (e: any) => {
    if (!e.target.getAttribute('data-iswrapper')) return;
    const wrapperRect = wrapper.current.getBoundingClientRect();
    const x = e.clientX - wrapperRect.left + handleSize / 2;
    const y = e.clientY - wrapperRect.top + handleSize / 2;

    setStartPos({ x, y });
    setEndPos({ x, y });
    setIsResizing(true);

    onSelectStart();
  };

  return (
    <div
      ref={wrapper}
      className={styles.wrapper}
      data-iswrapper="true"
      onMouseDown={onNewSelect}
    >
      <div
        ref={box}
        className={`${styles.box} ${size ? '' : styles.hidden}`}
        style={{
          width: size && size.width,
          height: size && size.height,
          left: topLeft && topLeft.x,
          top: topLeft && topLeft.y
        }}
        onMouseDown={onDragStart}
      >
        <div className={styles.inner}>{children}</div>
        <div
          className={`${styles.handle} ${styles.top_left}`}
          data-handle="top-left"
          onMouseDown={onMouseDown}
        />
        <div
          className={`${styles.handle} ${styles.top_right}`}
          data-handle="top-right"
          onMouseDown={onMouseDown}
        />
        <div
          className={`${styles.handle} ${styles.bottom_right}`}
          data-handle="bottom-right"
          onMouseDown={onMouseDown}
        />
        <div
          className={`${styles.handle} ${styles.bottom_left}`}
          data-handle="bottom-left"
          onMouseDown={onMouseDown}
        />
      </div>
    </div>
  );
}
