import { useState, useEffect } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [storedData, setStoredData] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(storedData));
  }, [key, storedData]);

  return [storedData, setStoredData];
};

export default useLocalStorage;
