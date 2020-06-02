import { useState, useEffect } from 'react';

export default function useKeyPress(targetKey: string, withCtrl: boolean) {
  const [keyPressed, setKeyPressed] = useState(false);

  function onKeyDown({ code, ctrlKey }: any) {
    if (code === 'Key' + targetKey.toUpperCase() && ctrlKey === withCtrl) {
      setKeyPressed(true);
    }
  }

  const onKeyUp = ({ code }: any) => {
    if (code === 'Key' + targetKey.toUpperCase()) {
      setKeyPressed(false);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return keyPressed;
}
