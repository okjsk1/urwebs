import React, { useState, useEffect } from 'react';

export function Footer() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timeString = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <footer
      className="w-full text-right pr-7 pb-1 mt-9"
      style={{
        fontSize: '0.93rem',
        color: '#bda25e',
        padding: '0.5rem 1.7rem 0.25rem 0',
        letterSpacing: '0.01em'
      }}
    >
      {currentTime}
    </footer>
  );
}