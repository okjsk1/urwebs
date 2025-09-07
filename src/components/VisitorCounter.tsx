import React, { useState, useEffect } from 'react';

export function VisitorCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `urwebs-visit-${today}`;
    let visitorCount = parseInt(localStorage.getItem(key) || "0", 10);
    visitorCount++;
    localStorage.setItem(key, visitorCount.toString());
    setCount(visitorCount);
  }, []);

  return (
    <div
      className="fixed bottom-4 right-4 bg-white px-4 py-3 rounded-full border-2 z-20 flex items-center gap-2"
      style={{
        color: '#8d8d8d',
        boxShadow: '0 2px 6px -2px #ececec',
        borderColor: '#f2f2f2',
        fontSize: '1.01rem'
      }}
    >
      👥 <span>오늘 방문자: <span>{count}</span>명</span>
    </div>
  );
}