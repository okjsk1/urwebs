import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 현재 월의 날짜 배열 생성
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 이번 달의 첫날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 첫 주의 빈 칸 (일요일부터 시작)
    const startPadding = firstDay.getDay();
    
    // 날짜 배열 생성
    const days = [];
    
    // 빈 칸 추가
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // 날짜 추가
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }
    
    return days;
  }, [currentDate]);
  
  const today = new Date();
  const isToday = (day: number | null) => {
    if (!day) return false;
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };
  
  // 날짜의 요일 가져오기
  const getDayOfWeek = (day: number | null) => {
    if (!day) return '';
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return dayNames[date.getDay()];
  };
  
  return (
    <div className="p-2 h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="text-base font-bold text-gray-800">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </div>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
          <div key={day} className={`text-center text-xs font-bold py-1 ${i === 0 ? 'text-red-600' : i === 6 ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
          </div>
        ))}
      </div>
      
      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {calendarDays.map((day, index) => {
          const dayOfWeek = getDayOfWeek(day);
          const columnIndex = index % 7;
          
          return (
            <div
              key={index}
              className={`
                flex flex-col items-center justify-center text-xs rounded min-h-[24px]
                ${day ? 'hover:bg-blue-50 cursor-pointer transition-colors' : 'bg-gray-50'}
                ${isToday(day) ? 'bg-blue-500 text-white font-bold ring-2 ring-blue-300' : ''}
                ${!isToday(day) && day && columnIndex === 0 ? 'text-red-600 font-semibold' : ''}
                ${!isToday(day) && day && columnIndex === 6 ? 'text-blue-600 font-semibold' : ''}
                ${!isToday(day) && day && columnIndex !== 0 && columnIndex !== 6 ? 'text-gray-700' : ''}
                ${day ? 'border border-gray-200' : ''}
              `}
              title={day ? `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${day}일 (${dayOfWeek})` : ''}
            >
              {day && (
                <div className="flex flex-col items-center">
                  <span className={isToday(day) ? 'font-bold' : ''}>{day}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 오늘 날짜 표시 */}
      <div className="text-xs text-center text-gray-500 mt-2 pt-2 border-t border-gray-200">
        오늘: {today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일 ({['일', '월', '화', '수', '목', '금', '토'][today.getDay()]}요일)
      </div>
    </div>
  );
}








