import { useEffect } from 'react';
import { remote } from 'electron';

export default function useClickThrough() {
  useEffect(() => {
    const handler = (event: any) => {
      if (event.target.getAttribute('data-click-through') === 'true')
        remote.getCurrentWindow().setIgnoreMouseEvents(true, { forward: true });
      else remote.getCurrentWindow().setIgnoreMouseEvents(false);
    };
    window.addEventListener('mousemove', handler);

    return () => window.removeEventListener('mousemove', handler);
  }, []);
}
