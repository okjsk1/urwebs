import React, { useState, useEffect } from 'react';

interface DdayWidgetProps {
  id: string;
  onRemove: (id: string) => void;
}

export function DdayWidget({ id, onRemove }: DdayWidgetProps) {
  const [targetDate, setTargetDate] = useState('');
  const [title, setTitle] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 데이터 불러오기
    const savedData = localStorage.getItem(`dday-widget-${id}`);
    if (savedData) {
      const { targetDate: savedDate, title: savedTitle } = JSON.parse(savedData);
      setTargetDate(savedDate);
      setTitle(savedTitle);
    }
  }, [id]);

  useEffect(() => {
    if (targetDate) {
      const calculateDays = () => {
        const today = new Date();
        const target = new Date(targetDate);
        const timeDiff = target.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        setDaysLeft(daysDiff);
      };

      calculateDays();
      const interval = setInterval(calculateDays, 60000); // 1분마다 업데이트

      return () => clearInterval(interval);
    }
  }, [targetDate]);

  const handleSave = () => {
    if (targetDate && title) {
      localStorage.setItem(`dday-widget-${id}`, JSON.stringify({ targetDate, title }));
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm border h-full relative">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-800">⏰ D-Day</h3>
        <button
          onClick={() => onRemove(id)}
          className="text-red-500 hover:text-red-700 text-xs"
        >
          ✕
        </button>
      </div>

      {isEditing || (!targetDate || !title) ? (
        <div className="space-y-2 lg:space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="이벤트 제목"
            className="w-full px-2 py-1 border rounded text-sm"
          />
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              저장
            </button>
            {targetDate && title && (
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
              >
                취소
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center space-y-2" onClick={() => setIsEditing(true)}>
          <div className="text-lg font-bold text-blue-600">
            {daysLeft > 0 ? `D-${daysLeft}` : daysLeft === 0 ? 'D-Day!' : `D+${Math.abs(daysLeft)}`}
          </div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-xs text-gray-500">
            {new Date(targetDate).toLocaleDateString('ko-KR')}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            클릭하여 수정
          </div>
        </div>
      )}
    </div>
  );
}