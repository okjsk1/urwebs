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
  const calculateDday = (item: DdayItem): { days: number; hours: number; isPast: boolean; color: string } => {
    const targetDate = calculateNextDate(item);
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const isPast = diffMs < 0;
    
    let color = 'text-gray-600 dark:text-gray-400';
    if (isPast) {
      color = 'text-gray-400 dark:text-gray-600';
    } else if (days === 0) {
      color = 'text-red-600 dark:text-red-400';
    } else if (days <= 3) {
      color = 'text-orange-500 dark:text-orange-400';
    } else if (days <= 7) {
      color = 'text-yellow-500 dark:text-yellow-400';
    }
    
    return { days: Math.abs(days), hours: Math.abs(hours), isPast, color };
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
      <div className="flex flex-col min-h-0 h-full">
        {/* 빠른 추가 */}
        <div className="mb-2 flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="2025-03-01 졸업식"
              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
            />
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-200 flex-shrink-0"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 상세 추가 폼 */}
        {showAddForm && (
          <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex-shrink-0">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="제목"
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      addItem({ title: target.value.trim() });
                      target.value = '';
                      setShowAddForm(false);
                    }
                  }
                }}
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) => {
                    if (e.target.value) {
                      const titleInput = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                      addItem({ 
                        at: new Date(e.target.value).toISOString(),
                        title: titleInput?.value || ''
                      });
                      if (titleInput) titleInput.value = '';
                      setShowAddForm(false);
                    }
                  }}
                />
                <select className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
          {sortedItems.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <div className="text-xs">D-Day를 추가해주세요</div>
            </div>
          ) : (
            sortedItems.map((item) => (
              <div
                key={item.id}
                className={`p-2 border rounded-lg flex-shrink-0 ${
                  item.dday.isPast 
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
                      {item.title}
                    </h4>
                    
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
                    
                    <div className={`text-base font-bold ${item.dday.color}`}>
                      {item.dday.isPast ? (
                        <span>+{item.dday.days}일 지남</span>
                      ) : item.dday.days === 0 ? (
                        <span>D-Day</span>
                      ) : (
                        <span>D-{item.dday.days}</span>
                      )}
                    </div>
                  </div>
                  
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
