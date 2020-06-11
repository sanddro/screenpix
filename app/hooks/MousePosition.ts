import { useState, useEffect } from 'react';
import { remote } from 'electron';

export default function useMousePosition(target: any = null) {
  const [mousePosition, setMousePosition]: any = useState(
    remote.screen.getCursorScreenPoint()
  );

  useEffect(() => {
    window.onmousemove = (e: any) => {
      let x = e.clientX;
      let y = e.clientY;
      if (target) {
        const rect = target.getBoundingClientRect();
        x -= rect.left;
        y -= rect.top;
      }
      setMousePosition({ x, y });
    };

    return () => {
      window.onmousemove = null;
    };
  }, [target]);

  return mousePosition;
}
