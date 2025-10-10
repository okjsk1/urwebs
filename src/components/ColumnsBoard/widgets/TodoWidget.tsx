import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

export function TodoWidget() {
  const [todos, setTodos] = useState([
    { id: 1, text: '프로젝트 문서 작성', completed: true },
    { id: 2, text: '팀 회의 참석', completed: false },
    { id: 3, text: '코드 리뷰', completed: false },
    { id: 4, text: '보고서 제출', completed: false },
  ]);

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div
          key={todo.id}
          onClick={() => toggleTodo(todo.id)}
          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
        >
          {todo.completed ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
          )}
          <span className={`text-sm flex-1 ${
            todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
          }`}>
            {todo.text}
          </span>
        </div>
      ))}
    </div>
  );
}






