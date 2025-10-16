import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { 
  CheckSquare, Target, Repeat, Clock, Bell, FileText, Calendar, Mail,
  Play, Pause, SkipBack, SkipForward, Plus, Trash2, Edit
} from 'lucide-react';

// 스마트 할 일 위젯
export const TodoWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [todos, setTodos] = useState([
    { id: 1, text: '체크리스트 항목 1', completed: false },
    { id: 2, text: '체크리스트 항목 2', completed: false },
    { id: 3, text: '체크리스트 항목 3', completed: false },
  ]);

  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    const text = newTodo.trim();
    if (!text) return;
    const newId = Math.max(...todos.map(t => t.id), 0) + 1;
    setTodos([...todos, { id: newId, text, completed: false }]);
    setNewTodo('');
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const deleteTodo = (id: number) => setTodos(prev => prev.filter(todo => todo.id !== id));

  // 항목이 4개 이상이면 세로 2칸으로 자동 확장, 그 외엔 1칸
  useEffect(() => {
    const nextHeight = todos.length >= 4 ? 2 : 1;
    const currentHeight = widget.gridSize?.h || 1;
    if (nextHeight !== currentHeight) {
      updateWidget?.(widget.id, { ...widget, gridSize: { w: widget.gridSize?.w || 1, h: nextHeight } });
    }
  }, [todos.length]);

  return (
    <div className="p-3">
      <div className="space-y-2">
        {todos.map(todo => (
          <label key={todo.id} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className={`text-sm flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {todo.text}
            </span>
            {isEditMode && (
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700"
                title="삭제"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </label>
        ))}

        {isEditMode && (
          <div className="flex gap-1 mt-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              placeholder="할 일 추가"
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
            />
            <Button size="sm" onClick={addTodo} className="h-6 w-6 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// 목표 추적 위젯
export const GoalWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [goals, setGoals] = useState([
    { id: 1, title: '월간 매출 목표', target: 10000000, current: 7500000, unit: '원' },
    { id: 2, title: '독서 목표', target: 12, current: 8, unit: '권' },
    { id: 3, title: '운동 목표', target: 30, current: 18, unit: '일' }
  ]);

  return (
    <div className="p-3">
      <div className="space-y-3">
        {goals.map(goal => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={goal.id} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-800">{goal.title}</span>
                <span className="text-xs text-gray-500">{goal.current}/{goal.target}{goal.unit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 text-right">
                {progress.toFixed(0)}% 완료
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 습관 트래킹 위젯
export const HabitWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [habits, setHabits] = useState([
    { id: 1, name: '물 마시기', streak: 7, completed: false },
    { id: 2, name: '운동하기', streak: 3, completed: true },
    { id: 3, name: '산책하기', streak: 12, completed: true }
  ]);

  const toggleHabit = (id: number) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  return (
    <div className="p-3">
      <div className="space-y-2">
        {habits.map(habit => (
          <div key={habit.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleHabit(habit.id)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  habit.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300'
                }`}
              >
                {habit.completed && <CheckSquare className="w-3 h-3" />}
              </button>
              <span className="text-sm text-gray-800">{habit.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-blue-600 font-medium">{habit.streak}일</span>
              <span className="text-xs text-gray-500">연속</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 포모도로 타이머 위젯
export const TimerWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [timerState, setTimerState] = useState({
    time: 25 * 60, // 25분을 초로 변환
    isRunning: false,
    mode: 'pomodoro' // pomodoro, shortBreak, longBreak
  });

  // 타이머 로직
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerState.isRunning && timerState.time > 0) {
      interval = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          time: prev.time - 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setTimerState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  const resetTimer = () => {
    const durations = { pomodoro: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
    setTimerState(prev => ({
      ...prev,
      time: durations[prev.mode as keyof typeof durations],
      isRunning: false
    }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* 타이머 모드 선택 */}
      <div className="flex gap-1 mb-3">
        <Button 
          size="sm" 
          variant={timerState.mode === 'pomodoro' ? 'default' : 'outline'}
          className="flex-1 h-6 text-xs"
          onClick={() => setTimerState(prev => ({ ...prev, mode: 'pomodoro', time: 25 * 60, isRunning: false }))}
        >
          포모도로
        </Button>
        <Button 
          size="sm" 
          variant={timerState.mode === 'shortBreak' ? 'default' : 'outline'}
          className="flex-1 h-6 text-xs"
          onClick={() => setTimerState(prev => ({ ...prev, mode: 'shortBreak', time: 5 * 60, isRunning: false }))}
        >
          짧은 휴식
        </Button>
        <Button 
          size="sm" 
          variant={timerState.mode === 'longBreak' ? 'default' : 'outline'}
          className="flex-1 h-6 text-xs"
          onClick={() => setTimerState(prev => ({ ...prev, mode: 'longBreak', time: 15 * 60, isRunning: false }))}
        >
          긴 휴식
        </Button>
      </div>

      {/* 타이머 디스플레이 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-4xl font-mono font-bold text-gray-800 mb-2">
          {formatTime(timerState.time)}
        </div>
        <div className="text-sm text-gray-600 mb-4">
          {timerState.mode === 'pomodoro' ? '집중 시간' : 
           timerState.mode === 'shortBreak' ? '짧은 휴식' : '긴 휴식'}
        </div>
        
        {/* 진행률 표시 */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
            style={{ 
              width: `${((25 * 60 - timerState.time) / (25 * 60)) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-8 text-xs"
          onClick={startTimer}
        >
          {timerState.isRunning ? '일시정지' : '시작'}
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-8 text-xs"
          onClick={resetTimer}
        >
          리셋
        </Button>
      </div>
    </div>
  );
};

// 알림 관리 위젯
export const ReminderWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [reminders, setReminders] = useState([
    { id: 1, title: '회의 10분 전', time: '14:50', completed: false },
    { id: 2, title: '약속 시간', time: '16:00', completed: true },
    { id: 3, title: '운동 시간', time: '18:00', completed: false }
  ]);

  return (
    <div className="p-3">
      <div className="space-y-2">
        {reminders.map(reminder => (
          <div key={reminder.id} className={`p-2 rounded-lg ${
            reminder.completed ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800">{reminder.title}</span>
              <span className="text-xs text-gray-500">{reminder.time}</span>
            </div>
            {!reminder.completed && (
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 빠른 메모 위젯
export const QuickNoteWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [notes, setNotes] = useState([
    { id: 1, content: '프로젝트 아이디어 정리', timestamp: '10:30' },
    { id: 2, content: '내일 할 일 체크리스트', timestamp: '11:15' },
    { id: 3, content: '중요한 연락처 메모', timestamp: '14:20' }
  ]);

  const [newNote, setNewNote] = useState('');

  const addNote = () => {
    if (newNote.trim()) {
      const newId = Math.max(...notes.map(n => n.id), 0) + 1;
      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setNotes([{ id: newId, content: newNote, timestamp }, ...notes]);
      setNewNote('');
    }
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="p-3">
      <div className="space-y-2 mb-3">
        {notes.map(note => (
          <div key={note.id} className="p-2 bg-gray-50 rounded">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-800 flex-1">{note.content}</span>
              {isEditMode && (
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">{note.timestamp}</div>
          </div>
        ))}
      </div>
      
      {isEditMode && (
        <div className="flex gap-1">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addNote()}
            placeholder="새 메모 추가"
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
          />
          <Button size="sm" onClick={addNote} className="h-6 w-6 p-0">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

// 캘린더 위젯
export const CalendarWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const firstDay = new Date(current.year, current.month, 1);
  const lastDay = new Date(current.year, current.month + 1, 0);
  const startWeekDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => {
    const d = new Date(current.year, current.month - 1, 1);
    setCurrent({ year: d.getFullYear(), month: d.getMonth() });
  };
  const nextMonth = () => {
    const d = new Date(current.year, current.month + 1, 1);
    setCurrent({ year: d.getFullYear(), month: d.getMonth() });
  };

  const cells: Array<{ day: number | null; isToday: boolean }> = [];
  for (let i = 0; i < startWeekDay; i++) cells.push({ day: null, isToday: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = current.year === today.getFullYear() && current.month === today.getMonth() && d === today.getDate();
    cells.push({ day: d, isToday });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, isToday: false });

  return (
    <div className="p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="text-xs px-2 py-1 border rounded">이전</button>
        <div className="text-sm font-semibold">
          {new Date(current.year, current.month).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
        </div>
        <button onClick={nextMonth} className="text-xs px-2 py-1 border rounded">다음</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-gray-500 mb-1">
        {['일','월','화','수','목','금','토'].map(d => (<div key={d} className="text-center">{d}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs flex-1">
        {cells.map((c, i) => (
          <div key={i} className={`h-8 border rounded flex items-center justify-center ${c.isToday ? 'bg-blue-50 border-blue-300 font-semibold' : 'bg-white'}`}>
            {c.day ?? ''}
          </div>
        ))}
      </div>
    </div>
  );
};

// 이메일 관리 위젯
export const EmailWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [emails, setEmails] = useState([
    { id: 1, from: '김팀장', subject: '프로젝트 진행 상황', time: '10:30', unread: true },
    { id: 2, from: '이클라이언트', subject: '요구사항 변경 요청', time: '09:15', unread: false },
    { id: 3, from: '박개발자', subject: '코드 리뷰 완료', time: '08:45', unread: true }
  ]);

  return (
    <div className="p-3">
      <div className="space-y-2">
        {emails.map(email => (
          <div key={email.id} className={`p-2 rounded-lg ${
            email.unread ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-800">{email.from}</span>
              <span className="text-xs text-gray-500">{email.time}</span>
            </div>
            <div className="text-xs text-gray-700 truncate">{email.subject}</div>
            {email.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// 메일 서비스 위젯
// 사용 중지된 위젯 (노출 제거)
export const MailServicesWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const mailServices = [
    { name: 'Gmail', url: 'https://mail.google.com', icon: '📧', color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700' },
    { name: 'Daum', url: 'https://mail.daum.net', icon: '📮', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700' },
    { name: 'Naver', url: 'https://mail.naver.com', icon: '📬', color: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700' },
    { name: 'Outlook', url: 'https://outlook.live.com', icon: '📭', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700' },
    { name: 'Yahoo', url: 'https://mail.yahoo.com', icon: '📨', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700' },
    { name: 'Apple Mail', url: 'https://www.icloud.com/mail', icon: '🍎', color: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700' },
    { name: 'ProtonMail', url: 'https://mail.proton.me', icon: '🔒', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700' },
    { name: 'Zoho', url: 'https://mail.zoho.com', icon: '📧', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700' }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-3">
        <div className="text-center mb-3">
          <div className="text-2xl mb-1">📧</div>
          <h4 className="font-semibold text-sm text-gray-800">메일 서비스</h4>
          <p className="text-xs text-gray-500">빠른 메일 접근</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {mailServices.map((service, index) => (
            <Button
              key={index}
              size="sm"
              variant="outline"
              className={`h-10 text-xs ${service.color} flex flex-col items-center justify-center p-1`}
              onClick={() => window.open(service.url, '_blank')}
            >
              <div className="text-lg mb-1">{service.icon}</div>
              <div className="text-xs font-medium">{service.name}</div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
