import React, { useState, useEffect } from 'react';

export interface ClockWidgetProps {
  id: string;
  onRemove: (id: string) => void;
}

export function ClockWidget({ id, onRemove }: ClockWidgetProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg border shadow-sm p-3 lg:p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800 text-sm">🕐 시계</h3>
        <button
          onClick={() => onRemove(id)}
          className="text-gray-400 hover:text-red-500 transition-colors text-xs"
        >
          ✕
        </button>
      </div>
      <div className="text-center flex-1 flex flex-col justify-center">
        <p className="text-xl font-mono font-bold text-indigo-600 mb-1">
          {time.toLocaleTimeString('ko-KR')}
        </p>
        <p className="text-xs text-gray-500">
          {time.toLocaleDateString('ko-KR')}
        </p>
      </div>
    </div>
  );
}