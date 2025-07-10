import { useState, useEffect } from 'react';

export const useKeyboard = () => {
  const [keys, setKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeys(prevKeys => ({ ...prevKeys, [event.code]: true }));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeys(prevKeys => ({ ...prevKeys, [event.code]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
};