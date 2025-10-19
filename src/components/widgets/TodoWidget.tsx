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
}

interface TodoState {
  items: TodoItem[];
  newItem: string;
  showAddForm: boolean;
  editingItem: string | null;
  filter: 'all' | 'completed';
  sortBy: 'created' | 'alphabetical';
  showCompleted: boolean;
  draggedItem: string | null;
  draggedOverItem: string | null;
}

const DEFAULT_TODOS: TodoItem[] = [
  {
    id: '1',
    text: '프로젝트 기획서 작성',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    text: '팀 미팅 준비',
    completed: false,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    text: '사무용품 주문',
    completed: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    completedAt: new Date().toISOString()
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
      sortBy: 'created' as const,
      showCompleted: true,
      draggedItem: null,
      draggedOverItem: null
    });
    // items가 undefined인 경우 기본값 사용
    if (!saved.items || !Array.isArray(saved.items)) {
      saved.items = DEFAULT_TODOS;
    }
    return saved;
  });

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
      createdAt: new Date().toISOString()
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
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id 
          ? { 
              ...item, 
              completed: !item.completed,
              completedAt: !item.completed ? new Date().toISOString() : undefined
            }
          : item
      )
    }));
    saveState();
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
      editingItem: prev.editingItem === id ? null : prev.editingItem
    }));
    saveState();
    showToast('할일이 삭제되었습니다', 'success');
  }, []);

  // 드래그 앤 드롭 함수들
  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
    setState(prev => ({ ...prev, draggedItem: itemId }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setState(prev => ({ ...prev, draggedOverItem: itemId }));
  }, []);

  const handleDragLeave = useCallback(() => {
    setState(prev => ({ ...prev, draggedOverItem: null }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
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
      
      return { 
        ...prev, 
        items, 
        draggedItem: null, 
        draggedOverItem: null 
      };
    });
    saveState();
  }, [saveState]);

  const handleDragEnd = useCallback(() => {
    setState(prev => ({ ...prev, draggedItem: null, draggedOverItem: null }));
  }, []);

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
      case 'all':
      default:
        // 전체 표시 (필터링 없음)
        break;
    }

    // 완료된 항목 숨기기
    if (!state.showCompleted) {
      filtered = filtered.filter(item => !item.completed);
    }

    // 정렬
    return filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [state.items, state.filter, state.showCompleted, state.sortBy]);

  const completionStats = useMemo(() => {
    const total = state.items.length;
    const completed = state.items.filter(item => item.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, remaining: total - completed, percentage };
  }, [state.items]);

  return (
    <div className="p-3 h-full flex flex-col">
      {/* 편집 모드에서만 표시되는 필터 */}
      {isEditMode && (
        <div className="mb-3 space-y-2 shrink-0">
          <div className="flex gap-1">
            {['all', 'completed'].map(filter => (
              <Button
                key={filter}
                size="sm"
                variant={state.filter === filter ? 'default' : 'outline'}
                className="flex-1 h-6 text-xs"
                onClick={() => setState(prev => ({ ...prev, filter: filter as any }))}
              >
                {filter === 'all' ? '전체' : '완료'}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 할일 목록 */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-4">
            <div className="text-2xl mb-2">📝</div>
            <div>할일이 없습니다</div>
          </div>
        ) : (
          filteredAndSortedItems.map(item => (
            <div 
              key={item.id} 
              className={`p-2 rounded-lg border transition-all ${
                item.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-blue-300'
              } ${
                state.draggedItem === item.id ? 'opacity-50' : ''
              } ${
                state.draggedOverItem === item.id ? 'border-blue-400 bg-blue-50' : ''
              }`}
              draggable={isEditMode}
<<<<<<< HEAD
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
=======
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
>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
            >
              <div className="flex items-center gap-2">
                {isEditMode && (
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
                  <div className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
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
                        className="w-full text-xs px-1 py-0.5 border border-gray-300 rounded"
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
              className="w-full h-6 text-xs"
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
                  className="flex-1 h-6 text-xs"
                  onClick={addTodo}
                >
                  추가
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-6 text-xs"
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

      {/* 통계 */}
      <div className="text-center text-xs text-gray-500 mt-2">
        완료: {completionStats.completed} | 남은: {completionStats.remaining}
      </div>
    </div>
  );
};
