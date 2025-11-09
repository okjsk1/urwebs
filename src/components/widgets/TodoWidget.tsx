// 할일 위젯 - 작업 관리, 우선순위, 마감일, 진행률
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Plus, Check, Trash2, Edit, Calendar, Flag, Clock, Filter, GripVertical } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  repeat?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    nextOccurrence?: string;
  };
  order: number;
}

interface TodoState {
  items: TodoItem[];
  newItem: string;
  showAddForm: boolean;
  editingItem: string | null;
  filter: 'all' | 'active' | 'completed';
  sortBy: 'manual' | 'created' | 'alphabetical' | 'priority' | 'dueDate';
  showCompleted: boolean;
  draggedItem: string | null;
  draggedOverItem: string | null;
}

const DEFAULT_TODOS: TodoItem[] = [
  {
    id: '1',
    text: '프로젝트 기획서 작성',
    completed: false,
    createdAt: new Date().toISOString(),
    order: 0
  },
  {
    id: '2',
    text: '팀 미팅 준비',
    completed: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    order: 1
  },
  {
    id: '3',
    text: '사무용품 주문',
    completed: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    completedAt: new Date().toISOString(),
    order: 2
  }
];

export const TodoWidget = ({ widget, isEditMode, updateWidget }: WidgetProps) => {
  const [state, setState] = useState(() => {
    const saved = readLocal(widget.id, {
      items: DEFAULT_TODOS,
      newItem: '',
      showAddForm: false,
      editingItem: null,
      filter: 'all' as const,
      sortBy: 'manual' as const,
      showCompleted: true,
      draggedItem: null,
      draggedOverItem: null
    });
    // items가 undefined인 경우 기본값 사용
    if (!saved.items || !Array.isArray(saved.items)) {
      saved.items = DEFAULT_TODOS;
    }
    saved.items = saved.items.map((item: any, index: number) => ({
      ...item,
      order: typeof item.order === 'number' ? item.order : index
    }));
    return saved;
  });

  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  // 상태 저장 (수동으로만 호출)
  const saveState = useCallback(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  const addTodo = useCallback(() => {
    const { newItem } = state;
    
    if (!newItem.trim()) {
      showToast('할일을 입력하세요', 'error');
      return;
    }

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newItem.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      order: (state.items?.reduce((max, item) => Math.max(max, item.order ?? 0), -1) ?? -1) + 1
    };

    setState(prev => ({
      ...prev,
      items: [...prev.items, newTodo],
      newItem: '',
      showAddForm: false
    }));
    saveState();

    showToast('할일이 추가되었습니다', 'success');
  }, [state.newItem]);

  const toggleTodo = useCallback((id: string) => {
    setState(prev => {
      const item = prev.items.find(i => i.id === id);
      if (!item) return prev;
      
      const wasCompleted = item.completed;
      const nowCompleted = !wasCompleted;
      
      // 반복 일정 처리: 완료 시 다음 일정 생성
      if (nowCompleted && item.repeat) {
        const nextDate = new Date();
        switch (item.repeat.type) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + item.repeat.interval);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7 * item.repeat.interval);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + item.repeat.interval);
            break;
        }
        
        // 새 반복 항목 생성
        const newItem: TodoItem = {
          ...item,
          id: `${id}_${Date.now()}`,
          completed: false,
          completedAt: undefined,
          createdAt: new Date().toISOString(),
          repeat: {
            ...item.repeat,
            nextOccurrence: nextDate.toISOString()
          },
          order: prev.items.length
        };
        
        return {
          ...prev,
          items: prev.items.map(i => 
            i.id === id 
              ? { ...i, completed: true, completedAt: new Date().toISOString() }
              : i
          ).concat(newItem)
        };
      }
      
      return {
        ...prev,
        items: prev.items.map(item => 
          item.id === id 
            ? { 
                ...item, 
                completed: nowCompleted,
                completedAt: nowCompleted ? new Date().toISOString() : undefined
              }
            : item
        )
      };
    });
    saveState();
  }, [saveState]);

  const deleteTodo = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items
        .filter(item => item.id !== id)
        .map((item, index) => ({ ...item, order: index })),
      editingItem: prev.editingItem === id ? null : prev.editingItem
    }));
    saveState();
    showToast('할일이 삭제되었습니다', 'success');
  }, []);

  // 드래그 앤 드롭 함수들
  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    if (!(isEditMode || state.sortBy === 'manual')) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
    setState(prev => ({ ...prev, draggedItem: itemId }));
  }, [isEditMode, state.sortBy]);

  const handleDragOver = useCallback((e: React.DragEvent, itemId: string) => {
    if (!(isEditMode || state.sortBy === 'manual')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setState(prev => ({ ...prev, draggedOverItem: itemId }));
  }, [isEditMode, state.sortBy]);

  const handleDragLeave = useCallback(() => {
    if (!(isEditMode || state.sortBy === 'manual')) return;
    setState(prev => ({ ...prev, draggedOverItem: null }));
  }, [isEditMode, state.sortBy]);

  const handleDrop = useCallback((e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    if (!(isEditMode || state.sortBy === 'manual')) return;
    const draggedItemId = e.dataTransfer.getData('text/plain');
    
    if (draggedItemId === targetItemId) {
      setState(prev => ({ ...prev, draggedItem: null, draggedOverItem: null }));
      return;
    }

    setState(prev => {
      const items = [...prev.items];
      const draggedIndex = items.findIndex(item => item.id === draggedItemId);
      const targetIndex = items.findIndex(item => item.id === targetItemId);
      
      if (draggedIndex === -1 || targetIndex === -1) {
        return { ...prev, draggedItem: null, draggedOverItem: null };
      }
      
      // 항목 제거 후 새 위치에 삽입
      const [draggedItem] = items.splice(draggedIndex, 1);
      items.splice(targetIndex, 0, draggedItem);

      const reordered = items.map((item, index) => ({
        ...item,
        order: index
      }));

      return { 
        ...prev, 
        items: reordered, 
        draggedItem: null, 
        draggedOverItem: null 
      };
    });
    saveState();
  }, [isEditMode, state.sortBy, saveState]);

  const handleDragEnd = useCallback(() => {
    if (!(isEditMode || state.sortBy === 'manual')) return;
    setState(prev => ({ ...prev, draggedItem: null, draggedOverItem: null }));
  }, [isEditMode, state.sortBy]);

  const updateTodo = useCallback((id: string, updates: Partial<TodoItem>) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ),
      editingItem: null
    }));
    saveState();
    showToast('할일이 업데이트되었습니다', 'success');
  }, []);


  // 필터링 및 정렬된 할일 목록
  const filteredAndSortedItems = useMemo(() => {
    let filtered = state.items || [];

    // 필터 적용
    switch (state.filter) {
      case 'completed':
        filtered = filtered.filter(item => item.completed);
        break;
      case 'active':
        filtered = filtered.filter(item => !item.completed);
        break;
      case 'all':
      default:
        // 전체 표시 (필터링 없음)
        break;
    }

    // 완료된 항목 숨기기
    if (!state.showCompleted && state.filter === 'all') {
      filtered = filtered.filter(item => !item.completed);
    }

    // 정렬
    return filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'manual':
          return (a.order ?? 0) - (b.order ?? 0);
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1, undefined: 0 };
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          if (bPriority !== aPriority) return bPriority - aPriority;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'dueDate':
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [state.items, state.filter, state.showCompleted, state.sortBy]);

  // 진행률/통계 계산 제거 (요청에 따라 UI 비표시)
  const completionStats = useMemo(() => ({ total: 0, completed: 0, remaining: 0, percentage: 0 }), []);

  const canDrag = isEditMode || state.sortBy === 'manual';

  return (
    <div className="p-2 h-full flex flex-col">
      {/* 진행률 표시 제거됨 */}

      {/* 편집 모드에서만 표시되는 필터 및 정렬 */}
      {isEditMode && (
        <div className="mb-2 space-y-1.5 shrink-0">
          <div className="flex gap-1">
            {[
              { key: 'all', label: '전체' },
              { key: 'active', label: '진행중' },
              { key: 'completed', label: '완료' }
            ].map(filter => (
              <Button
                key={filter.key}
                size="sm"
                variant={state.filter === filter.key ? 'default' : 'outline'}
                className="flex-1 h-5 text-[11px]"
                onClick={() => setState(prev => ({ ...prev, filter: filter.key as any }))}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500">정렬:</span>
            <select
              value={state.sortBy}
              onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="flex-1 text-[11px] px-2 py-1 border rounded bg-white dark:bg-[var(--input-background)]"
            >
              <option value="manual">사용자 순서</option>
              <option value="created">생성일</option>
              <option value="alphabetical">이름순</option>
              <option value="priority">우선순위</option>
              <option value="dueDate">마감일</option>
            </select>
          </div>
        </div>
      )}

      {/* 할일 목록 */}
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center text-gray-500 text-[11px] py-4">
            <div className="text-xl mb-1.5">📝</div>
            <div>할일이 없습니다</div>
          </div>
        ) : (
          filteredAndSortedItems.map(item => (
            <div 
              key={item.id} 
              className={`p-1.5 rounded-lg border transition-all ${
                item.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-blue-300'
              } ${
                state.draggedItem === item.id ? 'opacity-50' : ''
              } ${
                state.draggedOverItem === item.id ? 'border-blue-400 bg-blue-50' : ''
              }`}
              draggable={canDrag}
              onDragStart={(e) => {
                e.stopPropagation(); // 위젯 드래그와 충돌 방지
                handleDragStart(e, item.id);
              }}
              onDragOver={(e) => {
                e.stopPropagation(); // 위젯 드래그와 충돌 방지
                handleDragOver(e, item.id);
              }}
              onDragLeave={(e) => {
                e.stopPropagation(); // 위젯 드래그와 충돌 방지
                handleDragLeave();
              }}
              onDrop={(e) => {
                e.stopPropagation(); // 위젯 드래그와 충돌 방지
                handleDrop(e, item.id);
              }}
              onDragEnd={(e) => {
                e.stopPropagation(); // 위젯 드래그와 충돌 방지
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                {canDrag && (
                  <div className="cursor-move text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-4 h-4" />
                  </div>
                )}
                
                <button
                  onClick={() => toggleTodo(item.id)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    item.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                  aria-label={`${item.text} 완료 상태 토글`}
                >
                  {item.completed && <Check className="w-3 h-3" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                    {state.editingItem === item.id ? (
                      <input
                        type="text"
                        defaultValue={item.text}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            updateTodo(item.id, { text: e.target.value.trim() });
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateTodo(item.id, { text: (e.target as HTMLInputElement).value.trim() });
                          }
                        }}
                        className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                        autoFocus
                      />
                    ) : (
                      <div 
                        onClick={() => isEditMode && setState(prev => ({ ...prev, editingItem: item.id }))}
                        className={item.completed ? 'line-through text-gray-500' : ''}
                      >
                        {item.text}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.priority && (
                      <span className={`text-[10px] px-1 py-0.5 rounded ${
                        item.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {item.priority === 'high' ? '높음' : item.priority === 'medium' ? '보통' : '낮음'}
                      </span>
                    )}
                    {item.repeat && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {item.repeat.type === 'daily' ? '매일' : item.repeat.type === 'weekly' ? '매주' : '매월'}
                      </span>
                    )}
                    {item.dueDate && (
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.dueDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
                
                {isEditMode && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        editingItem: prev.editingItem === item.id ? null : item.id 
                      }))}
                      className="w-5 h-5 text-gray-400 hover:text-blue-600"
                      aria-label="할일 편집"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteTodo(item.id)}
                      className="w-5 h-5 text-gray-400 hover:text-red-600"
                      aria-label="할일 삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 할일 추가 */}
      {isEditMode && (
        <div className="space-y-2">
          {!state.showAddForm ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-5 text-[11px]"
              onClick={() => setState(prev => ({ ...prev, showAddForm: true }))}
            >
              <Plus className="w-3 h-3 mr-1" />
              할일 추가
            </Button>
          ) : (
            <div className="bg-gray-50 rounded-lg p-2 space-y-2">
              <input
                type="text"
                value={state.newItem}
                onChange={(e) => setState(prev => ({ ...prev, newItem: e.target.value }))}
                placeholder="할일을 입력하세요"
                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                aria-label="새 할일"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTodo();
                  }
                }}
              />
              
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="flex-1 h-5 text-[11px]"
                  onClick={addTodo}
                >
                  추가
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-5 text-[11px]"
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    showAddForm: false, 
                    newItem: ''
                  }))}
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 통계 표시 제거됨 */}
    </div>
  );
};
