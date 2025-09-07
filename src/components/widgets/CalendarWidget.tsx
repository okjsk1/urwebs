import React, { useState } from 'react';
import { Calendar } from '../ui/calendar';

export interface CalendarWidgetProps {
  id: string;
  onRemove: (id: string) => void;
}

interface Event {
  id: string;
  date: Date;
  title: string;
}

export function CalendarWidget({ id, onRemove }: CalendarWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [showEventInput, setShowEventInput] = useState(false);

  const addEvent = () => {
    if (newEventTitle.trim() && selectedDate) {
      const newEvent: Event = {
        id: Date.now().toString(),
        date: selectedDate,
        title: newEventTitle.trim()
      };
      setEvents([...events, newEvent]);
      setNewEventTitle('');
      setShowEventInput(false);
    }
  };

  const removeEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      event.date.toDateString() === date.toDateString()
    );
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="bg-white rounded-lg border shadow-sm p-3 h-full flex flex-col" style={{ minHeight: '300px', maxHeight: '400px' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-800 text-sm">📅 달력</h3>
        <button
          onClick={() => onRemove(id)}
          className="text-gray-400 hover:text-red-500 transition-colors text-xs"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="mb-2">
          <div className="max-w-full">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full text-xs"
              classNames={{
                months: "text-xs",
                caption: "text-xs",
                head_cell: "text-xs p-1",
                cell: "text-xs p-1 h-6 w-6",
                day: "h-5 w-5 text-xs"
              }}
            />
          </div>
        </div>

        {selectedDate && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                {selectedDate.toLocaleDateString('ko-KR')} 일정
              </h4>
              <button
                onClick={() => setShowEventInput(true)}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                + 추가
              </button>
            </div>

            {showEventInput && (
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="일정 제목"
                  className="flex-1 text-xs px-2 py-1 border rounded"
                  onKeyPress={(e) => e.key === 'Enter' && addEvent()}
                />
                <button
                  onClick={addEvent}
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setShowEventInput(false);
                    setNewEventTitle('');
                  }}
                  className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            )}

            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedDateEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                  <span className="text-gray-700">{event.title}</span>
                  <button
                    onClick={() => removeEvent(event.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {selectedDateEvents.length === 0 && (
                <p className="text-xs text-gray-500 italic">일정이 없습니다</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}