import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, CheckCircle, Clock, Bell, BellOff } from 'lucide-react';
import { WidgetShell } from './WidgetShell';
import { usePersist } from '../../hooks/usePersist';
import { trackEvent } from '../../utils/analytics';

export type RepeatType = 'none' | 'year' | 'month' | 'week' | 'weekday';

export interface DdayItem {
  id: string;
  title: string;
  at: string; // ISO8601 형식
  repeat?: RepeatType;
  cat?: string;
  done?: boolean;
}

export interface DdayState {
  items: DdayItem[];
  notifyDays: number[]; // 알림할 일수 배열
}

export interface DdayWidgetProps {
  id: string;
  title?: string;
  size?: 's' | 'm' | 'l';
  onRemove?: (id: string) => void;
  onResize?: (id: string, size: 's' | 'm' | 'l') => void;
  onPin?: (id: string) => void;
  isPinned?: boolean;
}

const CATEGORIES = ['개인', '업무', '학습', '건강', '여행', '기타'];
const REPEAT_LABELS = {
  none: '반복 없음',
  year: '매년',
  month: '매월',
  week: '매주',
  weekday: '평일'
};

export function DdayWidget({
  id,
  title = 'D-Day',
  size = 'm',
  onRemove,
  onResize,
  onPin,
  isPinned = false
}: DdayWidgetProps) {
  const [state, setState] = usePersist<DdayState>({
    key: `dday_${id}`,
    initialValue: {
      items: [],
      notifyDays: [1, 7] // 1일 전, 7일 전 알림
    }
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string>('');
  const yearRef = React.useRef<HTMLInputElement>(null);
  const monthRef = React.useRef<HTMLInputElement>(null);
  const dayRef = React.useRef<HTMLInputElement>(null);

  // 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  }, []);

  // 반복 계산 함수
  const calculateNextDate = (item: DdayItem): Date => {
    const baseDate = new Date(item.at);
    const now = new Date();
    
    if (item.repeat === 'none') {
      return baseDate;
    }
    
    let nextDate = new Date(baseDate);
    
    while (nextDate <= now) {
      switch (item.repeat) {
        case 'year':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
        case 'month':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'week':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'weekday':
          // 다음 평일 (월-금)
          do {
            nextDate.setDate(nextDate.getDate() + 1);
          } while (nextDate.getDay() === 0 || nextDate.getDay() === 6);
          break;
      }
    }
    
    return nextDate;
  };

  // D-Day 계산
  const calculateDday = (item: DdayItem): { days: number; hours: number; isPast: boolean; color: string; stealthColor?: string } => {
    const targetDate = calculateNextDate(item);
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const isPast = diffMs < 0;
    
    let color = 'text-gray-600 dark:text-gray-400';
    let stealthColor = ''; // Stealth 모드 인라인 스타일
    // Stealth 모드 감지
    const isStealthMode = document.querySelector('[data-stealth-mode="true"]') !== null;
    
    if (isPast) {
      color = 'text-gray-400 dark:text-gray-600';
    } else if (days === 0) {
      // Stealth 모드: 블루그레이 #5b6ea6
      if (isStealthMode) {
        stealthColor = '#5b6ea6';
      } else {
        color = 'text-red-600 dark:text-red-400';
      }
    } else if (days <= 3) {
      if (isStealthMode) {
        stealthColor = '#5b6ea6'; // 블루그레이
      } else {
        color = 'text-orange-500 dark:text-orange-400';
      }
    } else if (days <= 7) {
      if (isStealthMode) {
        stealthColor = '#7488a8'; // 더 밝은 블루그레이
      } else {
        color = 'text-yellow-500 dark:text-yellow-400';
      }
    }
    
    return { days: Math.abs(days), hours: Math.abs(hours), isPast, color, stealthColor };
  };

  // 빠른 추가 파싱
  const parseQuickInput = (input: string): Partial<DdayItem> | null => {
    // YYYY-MM-DD 제목 형식 파싱
    const match = input.match(/^(\d{4}-\d{2}-\d{2})\s+(.+)$/);
    if (match) {
      const [, dateStr, title] = match;
      const date = new Date(dateStr + 'T00:00:00');
      
      if (isNaN(date.getTime())) {
        return null;
      }
      
      return {
        title: title.trim(),
        at: date.toISOString(),
        cat: '개인'
      };
    }
    
    return null;
  };

  // 항목 추가
  const addItem = useCallback((itemData: Partial<DdayItem>) => {
    const newItem: DdayItem = {
      id: Date.now().toString(),
      title: itemData.title || '',
      at: itemData.at || new Date().toISOString(),
      repeat: itemData.repeat || 'none',
      cat: itemData.cat || '개인',
      done: false
    };
    
    setState(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    trackEvent('dday_add', { widget: 'dday', category: newItem.cat });
  }, [setState]);

  // 빠른 추가
  const handleQuickAdd = useCallback(() => {
    const parsed = parseQuickInput(quickInput);
    if (parsed) {
      addItem(parsed);
      setQuickInput('');
      setShowAddForm(false);
    }
  }, [quickInput, addItem]);

  // 항목 완료/미완료 토글
  const toggleItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, done: !item.done } : item
      )
    }));
    trackEvent('dday_toggle', { widget: 'dday' });
  }, [setState]);

  // 항목 삭제
  const removeItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
    trackEvent('dday_remove', { widget: 'dday' });
  }, [setState]);

  // 알림 설정
  const toggleNotification = useCallback((days: number) => {
    setState(prev => ({
      ...prev,
      notifyDays: prev.notifyDays.includes(days)
        ? prev.notifyDays.filter(d => d !== days)
        : [...prev.notifyDays, days].sort((a, b) => a - b)
    }));
  }, [setState]);

  // 알림 체크 및 발송
  useEffect(() => {
    if (notificationPermission !== 'granted') return;
    
    const checkNotifications = () => {
      state.items.forEach(item => {
        if (item.done) return;
        
        const { days, isPast } = calculateDday(item);
        
        if (!isPast && state.notifyDays.includes(days)) {
          // 알림 발송 (실제로는 중복 방지 로직 필요)
          new Notification(`${item.title} D-Day`, {
            body: `${days}일 남았습니다`,
            icon: '/favicon.ico'
          });
          
          trackEvent('dday_alarm_fired', { widget: 'dday', days, title: item.title });
        }
      });
    };
    
    // 매 시간마다 체크
    const interval = setInterval(checkNotifications, 3600000);
    
    // 오전 9시에 체크
    const now = new Date();
    const nextCheck = new Date();
    nextCheck.setHours(9, 0, 0, 0);
    if (nextCheck <= now) {
      nextCheck.setDate(nextCheck.getDate() + 1);
    }
    
    const timeout = setTimeout(checkNotifications, nextCheck.getTime() - now.getTime());
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [state.items, state.notifyDays, notificationPermission]);

  // 정렬된 항목 목록
  const sortedItems = state.items
    .filter(item => !item.done)
    .map(item => ({ ...item, dday: calculateDday(item) }))
    .sort((a, b) => {
      if (a.dday.isPast !== b.dday.isPast) {
        return a.dday.isPast ? 1 : -1;
      }
      return a.dday.days - b.dday.days;
    });

  const completedItems = state.items.filter(item => item.done);
  const isCompact = size === 's';

  return (
    <WidgetShell
      icon={<Calendar className="w-4 h-4 text-green-600" />}
      title={title}
      size={size}
      onRemove={() => onRemove?.(id)}
      onResize={(newSize) => {
        const validSize = newSize === 'xl' ? 'l' : newSize;
        onResize?.(id, validSize);
      }}
      onPin={() => onPin?.(id)}
      isPinned={isPinned}
      contentClassName="flex flex-col min-h-0"
      variant="bare"
    >
      <div className={`flex flex-col min-h-0 h-full ${isCompact ? 'p-1' : ''}`}>
        {/* 빠른 추가 */}
        <div className={`${isCompact ? 'mb-1' : 'mb-2'} flex-shrink-0`}>
          <div className={`flex ${isCompact ? 'gap-1' : 'gap-2'}`}>
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder={isCompact ? "2025-03-01" : "2025-03-01 졸업식"}
              className={`flex-1 ${isCompact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'} border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
            />
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`${isCompact ? 'px-1.5 py-0.5' : 'px-2 py-1'} bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-200 flex-shrink-0`}
            >
              <Plus className={isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
            </button>
          </div>
        </div>

        {/* 상세 추가 폼 */}
        {showAddForm && (
          <div className={`${isCompact ? 'mb-1 p-1' : 'mb-2 p-2'} bg-gray-50 dark:bg-gray-800 rounded-lg flex-shrink-0`}>
            <div className={`${isCompact ? 'space-y-1' : 'space-y-2'}`}>
              <input
                type="text"
                placeholder="제목"
                className={`w-full ${isCompact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'} border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              />
              <div className={`flex items-center ${isCompact ? 'gap-1' : 'gap-2'}`}>
                <input
                  ref={yearRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="YYYY"
                  className={`${isCompact ? 'w-14 px-1.5 py-0.5 text-[10px]' : 'w-16 px-2 py-1 text-xs'} text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                  onChange={(e) => {
                    const v = e.currentTarget.value.replace(/\D/g, '').slice(0, 4);
                    e.currentTarget.value = v;
                    if (v.length === 4) monthRef.current?.focus();
                  }}
                />
                <span className="text-gray-500">-</span>
                <input
                  ref={monthRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="MM"
                  className={`${isCompact ? 'w-10 px-1.5 py-0.5 text-[10px]' : 'w-12 px-2 py-1 text-xs'} text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                  onChange={(e) => {
                    const v = e.currentTarget.value.replace(/\D/g, '').slice(0, 2);
                    e.currentTarget.value = v;
                    if (v.length === 2) dayRef.current?.focus();
                  }}
                />
                <span className="text-gray-500">-</span>
                <input
                  ref={dayRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="DD"
                  className={`${isCompact ? 'w-10 px-1.5 py-0.5 text-[10px]' : 'w-12 px-2 py-1 text-xs'} text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                  onChange={(e) => {
                    const v = e.currentTarget.value.replace(/\D/g, '').slice(0, 2);
                    e.currentTarget.value = v;
                  }}
                  onKeyUp={(e) => {
                    if ((e.target as HTMLInputElement).value.length === 2) {
                      const y = yearRef.current?.value || '';
                      const m = monthRef.current?.value || '';
                      const d = dayRef.current?.value || '';
                      if (y.length === 4 && m.length === 2 && d.length === 2) {
                        const titleInput = (yearRef.current?.parentElement?.previousElementSibling) as HTMLInputElement | null;
                        const dateStr = `${y}-${m}-${d}`;
                        const date = new Date(`${dateStr}T00:00:00`);
                        if (!isNaN(date.getTime())) {
                          addItem({ at: date.toISOString(), title: titleInput?.value || '' });
                          if (titleInput) titleInput.value = '';
                          setShowAddForm(false);
                          yearRef.current && (yearRef.current.value = '');
                          monthRef.current && (monthRef.current.value = '');
                          dayRef.current && (dayRef.current.value = '');
                        }
                      }
                    }
                  }}
                />
                {!isCompact && (
                  <select className="ml-auto px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 알림 설정 - 작은 크기에서는 숨김 */}
        {size !== 's' && (
          <div className="mb-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={requestNotificationPermission}
                className={`p-0.5 rounded ${
                  notificationPermission === 'granted' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {notificationPermission === 'granted' ? 
                  <Bell className="w-3 h-3" /> : 
                  <BellOff className="w-3 h-3" />
                }
              </button>
              <span className="text-xs text-gray-600 dark:text-gray-400">알림</span>
            </div>
            
            <div className="flex gap-1">
              {[1, 3, 7].map(days => (
                <button
                  key={days}
                  onClick={() => toggleNotification(days)}
                  className={`px-1.5 py-0.5 text-xs rounded ${
                    state.notifyDays.includes(days)
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {days}일
                </button>
              ))}
            </div>
          </div>
        )}

        {/* D-Day 목록 */}
        <div className={`flex-1 min-h-0 overflow-y-auto ${isCompact ? 'space-y-1' : 'space-y-2'}`}>
          {sortedItems.length === 0 ? (
            <div className={`text-center ${isCompact ? 'py-2' : 'py-4'} text-gray-500 dark:text-gray-400`}>
              <Calendar className={`${isCompact ? 'w-5 h-5' : 'w-8 h-8'} mx-auto ${isCompact ? 'mb-1' : 'mb-2'} text-gray-300 dark:text-gray-600`} />
              <div className={isCompact ? 'text-[10px]' : 'text-xs'}>D-Day를 추가해주세요</div>
            </div>
          ) : (
            sortedItems.map((item) => (
              <div
                key={item.id}
                className={`${isCompact ? 'p-1' : 'p-2'} border rounded-lg flex-shrink-0 ${
                  item.dday.isPast 
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className={`${isCompact ? 'text-[10px] mb-0.5' : 'text-xs mb-1'} font-medium text-gray-900 dark:text-gray-100 truncate`}>
                      {item.title}
                    </h4>
                    
                    {!isCompact && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1 flex-wrap">
                        <span className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {item.cat}
                        </span>
                        {item.repeat && item.repeat !== 'none' && (
                          <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                            {REPEAT_LABELS[item.repeat]}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div 
                      className={`${isCompact ? 'text-sm' : 'text-base'} font-bold ${item.dday.color}`}
                      style={item.dday.stealthColor ? { color: item.dday.stealthColor } : {}}
                    >
                      {editingId === item.id ? (
                        <input
                          type="date"
                          autoFocus
                          value={editingDate}
                          onChange={(e) => setEditingDate(e.target.value)}
                          onBlur={() => {
                            if (editingDate) {
                              const date = new Date(`${editingDate}T00:00:00`);
                              if (!isNaN(date.getTime())) {
                                setState(prev => ({
                                  ...prev,
                                  items: prev.items.map(it => it.id === item.id ? { ...it, at: date.toISOString() } : it)
                                }));
                              }
                            }
                            setEditingId(null);
                          }}
                          className="px-2 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      ) : item.dday.isPast ? (
                        <button onClick={() => { setEditingId(item.id); setEditingDate(item.at.slice(0,10)); }} className="underline-offset-2 hover:underline">
                          +{item.dday.days}일
                        </button>
                      ) : item.dday.days === 0 ? (
                        <button onClick={() => { setEditingId(item.id); setEditingDate(item.at.slice(0,10)); }} className="underline-offset-2 hover:underline">
                          D-Day
                        </button>
                      ) : (
                        <button onClick={() => { setEditingId(item.id); setEditingDate(item.at.slice(0,10)); }} className="underline-offset-2 hover:underline">
                          D-{item.dday.days}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {!isCompact && (
                    <div className="flex gap-1 flex-shrink-0 ml-2">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 완료된 항목 - 작은 크기에서는 숨김 */}
        {completedItems.length > 0 && size !== 's' && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              완료됨 ({completedItems.length})
            </div>
            <div className="space-y-1">
              {completedItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500"
                >
                  <span className="line-through truncate flex-1">{item.title}</span>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 ml-2 flex-shrink-0"
                  >
                    복원
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
