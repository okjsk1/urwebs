import React, { useState, useEffect } from 'react';
import { signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, User as FirebaseUser, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase/config';

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
  const [loading, setLoading] = useState(true);
  
  // Firebase 설정 확인 (개발 환경에서는 항상 true)
  const hasValidFirebaseConfig = true;

  // Firebase 인증 상태 감지
  useEffect(() => {
    if (!hasValidFirebaseConfig) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      console.log('Firebase Auth 상태 변경:', firebaseUser ? '로그인됨' : '로그아웃됨');
      
      if (firebaseUser) {
        const userInfo: User = {
          name: firebaseUser.displayName || '사용자',
          email: firebaseUser.email || '',
          picture: firebaseUser.photoURL || 'https://via.placeholder.com/40'
        };
        console.log('사용자 정보:', userInfo);
        setUser(userInfo);
        setIsLoggedIn(true);
        onLogin?.(userInfo);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [onLogin, hasValidFirebaseConfig]);

  // Google 로그인 (팝업 방식)
  const handleGoogleLogin = async () => {
    try {
      console.log('Google 로그인 시도...');
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const userInfo: User = {
        name: firebaseUser.displayName || '사용자',
        email: firebaseUser.email || '',
        picture: firebaseUser.photoURL || 'https://via.placeholder.com/40'
      };
      
      console.log('로그인 성공:', userInfo);
      setUser(userInfo);
      setIsLoggedIn(true);
      onLogin?.(userInfo);
    } catch (error: any) {
      console.error('Google 로그인 실패:', error);
      
      // 사용자가 팝업을 닫은 경우는 오류로 표시하지 않음
      if (error?.code === 'auth/popup-closed-by-user') {
        console.log('로그인 팝업이 사용자에 의해 닫혔습니다.');
        return;
      }
      
      // 취소된 경우도 오류로 표시하지 않음
      if (error?.code === 'auth/cancelled-popup-request') {
        console.log('로그인 요청이 취소되었습니다.');
        return;
      }
      
      // 더 자세한 오류 메시지
      let errorMessage = '로그인에 실패했습니다.';
      if (error?.code === 'auth/popup-blocked') {
        errorMessage = '팝업이 차단되었습니다. 팝업을 허용하고 다시 시도해주세요.';
      } else if (error?.code === 'auth/network-request-failed') {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (error?.code === 'auth/invalid-api-key') {
        errorMessage = 'Firebase 설정에 문제가 있습니다. 관리자에게 문의하세요.';
      }
      
      alert(errorMessage);
    }
  };

  // Google 로그인 (리다이렉트 방식 - COOP 경고 없음)
  const handleGoogleLoginRedirect = async () => {
    try {
      console.log('Google 로그인 리다이렉트 시도...');
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error('Google 로그인 리다이렉트 실패:', error);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 리다이렉트 결과 처리
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('리다이렉트 결과 확인 중...');
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('리다이렉트 로그인 성공:', result.user);
          const firebaseUser = result.user;
          const userInfo: User = {
            name: firebaseUser.displayName || '사용자',
            email: firebaseUser.email || '',
            picture: firebaseUser.photoURL || 'https://via.placeholder.com/40'
          };
          
          setUser(userInfo);
          setIsLoggedIn(true);
          onLogin?.(userInfo);
        } else {
          console.log('리다이렉트 결과 없음');
        }
      } catch (error: any) {
        console.error('리다이렉트 로그인 결과 처리 실패:', error);
      }
    };

    handleRedirectResult();
  }, [onLogin]);

  // 로그아웃
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsLoggedIn(false);
      onLogout?.();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 데모 로그인 (개발용)
  const handleDemoLogin = () => {
    const demoUser: User = {
      name: '김사용자',
      email: 'user123@example.com',
      picture: 'https://via.placeholder.com/40'
    };
    setUser(demoUser);
    setIsLoggedIn(true);
    onLogin?.(demoUser);
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  // 로그인된 상태
  if (isLoggedIn && user) {
    console.log('로그인 UI 렌더링:', user);
    return (
      <div className="flex items-center gap-1.5">
        <img 
          src={user.picture} 
          alt={user.name}
          className="w-6 h-6 rounded-full"
        />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
          {user.name}
        </span>
        <button
          onClick={handleLogout}
          className="border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1 rounded text-xs font-medium transition-colors"
        >
          로그아웃
        </button>
      </div>
    );
  }

  // Firebase 설정이 없을 때 데모 로그인 버튼 표시
  if (!hasValidFirebaseConfig) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleDemoLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          데모 로그인
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400">Firebase 설정 필요</span>
      </div>
    );
  }

  // 로그인 버튼 (리다이렉트 방식 사용)
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleGoogleLoginRedirect}
        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-gray-300 dark:border-gray-600 shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google로 로그인
      </button>
      <p className="text-xs text-gray-500 text-center">
        로그인 없이도 즐겨찾기 기능을 사용할 수 있습니다
      </p>
    </div>
  );
};
