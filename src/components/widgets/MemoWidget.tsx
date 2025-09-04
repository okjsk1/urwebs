import React, { useState, useEffect } from 'react';

export interface MemoWidgetProps {
  id: string;
  onRemove: (id: string) => void;
}

export function MemoWidget({ id, onRemove }: MemoWidgetProps) {
  const [memo, setMemo] = useState('');

  useEffect(() => {
    const savedMemo = localStorage.getItem(`memo-${id}`);
    if (savedMemo) {
      setMemo(savedMemo);
    }
  }, [id]);

  const handleSave = () => {
    localStorage.setItem(`memo-${id}`, memo);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800 text-sm">📝 메모</h3>
        <button
          onClick={() => onRemove(id)}
          className="text-gray-400 hover:text-red-500 transition-colors text-xs"
        >
          ✕
        </button>
      </div>
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        onBlur={handleSave}
        className="flex-1 resize-none border border-gray-200 rounded p-2 text-sm"
        placeholder="메모를 입력하세요..."
      />
    </div>
  );
}