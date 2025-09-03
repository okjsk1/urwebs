import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean; // 모달 열림 상태
  onClose: () => void; // 모달 닫기 함수
  onLogin: (email: string, password: string) => void; // 로그인 함수
  onSignup: (email: string, password: string, name: string) => void; // 회원가입 함수
  isLoading?: boolean; // 로딩 상태
}

export function AuthModal({ isOpen, onClose, onLogin, onSignup, isLoading = false }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true); // 로그인/회원가입 모드 전환
  const [email, setEmail] = useState(''); // 이메일 입력 상태
  const [password, setPassword] = useState(''); // 비밀번호 입력 상태
  const [name, setName] = useState(''); // 이름 입력 상태 (회원가입용)
  const [error, setError] = useState(''); // 에러 메시지 상태

  // 폼 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (!isLoginMode && !name) {
      setError('이름을 입력해주세요.');
      return;
    }

    // 로그인 또는 회원가입 실행
    if (isLoginMode) {
      onLogin(email, password);
    } else {
      onSignup(email, password, name);
    }
  };

  // 모달 초기화
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  // 모달 닫기
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 모드 전환 (로그인 ↔ 회원가입)
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isLoginMode ? '로그인' : '회원가입'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* 본문 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 이메일 입력 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="your@email.com"
              required
            />
          </div>

          {/* 이름 입력 (회원가입 모드에서만) */}
          {!isLoginMode && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="홍길동"
                required
              />
            </div>
          )}

          {/* 비밀번호 입력 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리 중...' : (isLoginMode ? '로그인' : '회원가입')}
          </button>

          {/* 모드 전환 버튼 */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              {isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
            </button>
          </div>

          {/* Supabase 안내 */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <p>🔒 안전한 Supabase 인증을 사용합니다</p>
            <p>즐겨찾기와 설정이 클라우드에 저장됩니다</p>
          </div>
        </form>
      </div>
    </div>
  );
}