// 할일 위젯 - 작업 관리, 우선순위, 마감일, 진행률
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Plus, Check, Trash2, Edit, Calendar, Flag, Clock, Filter } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  tags: string[];
}

interface TodoState {
  items: TodoItem[];
  newItem: string;
  newPriority: 'low' | 'medium' | 'high';
  newDueDate: string;
  showAddForm: boolean;
  editingItem: string | null;
  filter: 'all' | 'active' | 'completed' | 'high' | 'medium' | 'low';
  sortBy: 'created' | 'due' | 'priority' | 'alphabetical';
  showCompleted: boolean;
}

const DEFAULT_TODOS: TodoItem[] = [
  {
    id: '1',
    text: '프로젝트 기획서 작성',
    completed: false,
    priority: 'high',
    dueDate: '2024-01-20',
    createdAt: new Date().toISOString(),
    tags: ['업무', '중요']
  },
  {
    id: '2',
    text: '팀 미팅 준비',
    completed: false,
    priority: 'medium',
    dueDate: '2024-01-18',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['업무']
  },
  {
    id: '3',
    text: '사무용품 주문',
    completed: true,
    priority: 'low',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    completedAt: new Date().toISOString(),
    tags: ['관리']
  }
];

export const TodoWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<TodoState>(() => {
    const saved = readLocal(widget.id, {
      items: DEFAULT_TODOS,
      newItem: '',
      newPriority: 'medium' as const,
      newDueDate: '',
      showAddForm: false,
      editingItem: null,
      filter: 'all' as const,
      sortBy: 'created' as const,
      showCompleted: true
    });
    return saved;
  });

  // 상태 저장 (수동으로만 호출)
  const saveState = useCallback(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  const addTodo = useCallback(() => {
    const { newItem, newPriority, newDueDate } = state;
    
    if (!newItem.trim()) {
      showToast('할일을 입력하세요', 'error');
      return;
    }

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newItem.trim(),
      completed: false,
      priority: newPriority,
      dueDate: newDueDate || undefined,
      createdAt: new Date().toISOString(),
      tags: []
    };

    setState(prev => ({
      ...prev,
      items: [...prev.items, newTodo],
      newItem: '',
      newPriority: 'medium',
      newDueDate: '',
      showAddForm: false
    }));
    saveState();

    showToast('할일이 추가되었습니다', 'success');
  }, [state.newItem, state.newPriority, state.newDueDate]);

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

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  const getPriorityIcon = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }, []);

  const isOverdue = useCallback((dueDate: string) => {
    return new Date(dueDate) < new Date();
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '내일';
    if (diffDays === -1) return '어제';
    if (diffDays > 1) return `${diffDays}일 후`;
    if (diffDays < -1) return `${Math.abs(diffDays)}일 전`;
    
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }, []);

  // 필터링 및 정렬된 할일 목록
  const filteredAndSortedItems = useMemo(() => {
    let filtered = state.items;

    // 필터 적용
    switch (state.filter) {
      case 'active':
        filtered = filtered.filter(item => !item.completed);
        break;
      case 'completed':
        filtered = filtered.filter(item => item.completed);
        break;
      case 'high':
        filtered = filtered.filter(item => item.priority === 'high');
        break;
      case 'medium':
        filtered = filtered.filter(item => item.priority === 'medium');
        break;
      case 'low':
        filtered = filtered.filter(item => item.priority === 'low');
        break;
    }

    // 완료된 항목 숨기기
    if (!state.showCompleted) {
      filtered = filtered.filter(item => !item.completed);
    }

    // 정렬
    return filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'due':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
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
    <div className="p-3 h-full">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">✅</div>
        <h4 className="font-semibold text-sm text-gray-800">할일 관리</h4>
        <div className="text-xs text-gray-500">
          {completionStats.completed}/{completionStats.total} 완료 ({completionStats.percentage}%)
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionStats.percentage}%` }}
          />
        </div>
      </div>

      {/* 필터 및 정렬 */}
      <div className="mb-3 space-y-2">
        <div className="flex gap-1">
          {['all', 'active', 'completed'].map(filter => (
            <Button
              key={filter}
              size="sm"
              variant={state.filter === filter ? 'default' : 'outline'}
              className="flex-1 h-6 text-xs"
              onClick={() => setState(prev => ({ ...prev, filter: filter as any }))}
            >
              {filter === 'all' ? '전체' : filter === 'active' ? '진행중' : '완료'}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-1">
          {['high', 'medium', 'low'].map(priority => (
            <Button
              key={priority}
              size="sm"
              variant={state.filter === priority ? 'default' : 'outline'}
              className="flex-1 h-6 text-xs"
              onClick={() => setState(prev => ({ ...prev, filter: priority as any }))}
            >
              {getPriorityIcon(priority)}
            </Button>
          ))}
        </div>
      </div>

      {/* 할일 목록 */}
      <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-4">
            <div className="text-2xl mb-2">📝</div>
            <div>할일이 없습니다</div>
          </div>
        ) : (
          filteredAndSortedItems.map(item => (
            <div key={item.id} className={`p-2 rounded-lg border transition-all ${
              item.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-blue-300'
            }`}>
              <div className="flex items-start gap-2">
                <button
                  onClick={() => toggleTodo(item.id)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 ${
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
                      <div onClick={() => isEditMode && setState(prev => ({ ...prev, editingItem: item.id }))}>
                        {item.text}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-1 py-0.5 rounded text-xs border ${getPriorityColor(item.priority)}`}>
                      {getPriorityIcon(item.priority)}
                    </span>
                    
                    {item.dueDate && (
                      <div className={`flex items-center gap-1 text-xs ${
                        isOverdue(item.dueDate) ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(item.dueDate)}</span>
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
              />
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">우선순위</label>
                  <select
                    value={state.newPriority}
                    onChange={(e) => setState(prev => ({ ...prev, newPriority: e.target.value as any }))}
                    className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600">마감일</label>
                  <input
                    type="date"
                    value={state.newDueDate}
                    onChange={(e) => setState(prev => ({ ...prev, newDueDate: e.target.value }))}
                    className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                  />
                </div>
              </div>
              
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
                    newItem: '', 
                    newPriority: 'medium',
                    newDueDate: ''
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
