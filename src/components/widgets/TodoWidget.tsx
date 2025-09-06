import React, { useState, useEffect } from 'react';

export interface TodoWidgetProps {
  id: string;
  onRemove: (id: string) => void;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export function TodoWidget({ id, onRemove }: TodoWidgetProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const savedTodos = localStorage.getItem(`todos-${id}`);
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    } else {
      // Default todos
      const defaultTodos = [
        { id: '1', text: '프로젝트 완성하기', completed: false },
        { id: '2', text: '회의 준비하기', completed: false }
      ];
      setTodos(defaultTodos);
    }
  }, [id]);

  useEffect(() => {
    localStorage.setItem(`todos-${id}`, JSON.stringify(todos));
  }, [todos, id]);

  const toggleTodo = (todoId: string) => {
    setTodos(todos.map(todo => 
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const newItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false
      };
      setTodos([...todos, newItem]);
      setNewTodo('');
    }
  };

  const removeTodo = (todoId: string) => {
    setTodos(todos.filter(todo => todo.id !== todoId));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm p-3 lg:p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm">✅ 할 일</h3>
        <button
          onClick={() => onRemove(id)}
          className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors text-xs"
        >
          ✕
        </button>
      </div>
      
      <div className="flex-1 min-h-0">
        <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
          {todos.map(todo => (
            <div key={todo.id} className="flex items-center gap-2 group">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="rounded flex-shrink-0"
              />
              <span 
                className={`text-xs flex-1 ${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => removeTodo(todo.id)}
                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="새 할 일..."
            className="flex-1 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 rounded px-2 py-1"
          />
          <button
            onClick={addTodo}
            className="text-xs bg-blue-500 dark:bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-600 dark:hover:bg-blue-700"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}