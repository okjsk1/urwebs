import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface User {
  name: string;
  email: string;
  picture: string;
}

interface GoogleAuthProps {
  onLogin?: (user: User) => void;
  onLogout?: () => void;
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({ onLogin, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Google OAuth 클라이언트 ID 확인
  const hasValidClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID && 
                          import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'demo-client-id';

  const handleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        const decoded = jwtDecode(credentialResponse.credential) as any;
        const userInfo: User = {
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture
        };
        
        setUser(userInfo);
        setIsLoggedIn(true);
        onLogin?.(userInfo);
        
        // 로컬 스토리지에 사용자 정보 저장
        localStorage.setItem('googleUser', JSON.stringify(userInfo));
      } catch (error) {
        console.error('Error decoding JWT:', error);
      }
    }
  };

  const handleError = () => {
    console.error('Login Failed');
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    onLogout?.();
    localStorage.removeItem('googleUser');
  };

  // 더미 로그인 (개발용)
  const handleDemoLogin = () => {
    const demoUser: User = {
      name: '김사용자',
      email: 'user123@example.com',
      picture: 'https://via.placeholder.com/40'
    };
    setUser(demoUser);
    setIsLoggedIn(true);
    onLogin?.(demoUser);
    localStorage.setItem('googleUser', JSON.stringify(demoUser));
  };

  // 컴포넌트 마운트 시 저장된 사용자 정보 확인
  React.useEffect(() => {
    const savedUser = localStorage.getItem('googleUser');
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser);
        setUser(userInfo);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('googleUser');
      }
    }
  }, []);

  if (isLoggedIn && user) {
    return (
      <div className="flex items-center gap-3">
        <img 
          src={user.picture} 
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{user.name}</span>
          <span className="text-xs text-gray-500">{user.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          로그아웃
        </button>
      </div>
    );
  }

  // 환경변수가 없을 때 더미 로그인 버튼 표시
  if (!hasValidClientId) {
    return (
      <button
        onClick={handleDemoLogin}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        데모 로그인
      </button>
    );
  }

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      render={(renderProps) => (
        <button
          onClick={renderProps.onClick}
          disabled={renderProps.disabled}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 로그인
        </button>
      )}
    />
  );
};
