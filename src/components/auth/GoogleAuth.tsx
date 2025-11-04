import React, { useState, useEffect } from 'react';
import { signInWithPopup, signInWithRedirect, signOut, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

interface GoogleAuthProps {
  onLogin?: () => void;
  onLogout?: () => void;
}

// 모바일 디바이스 감지
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase()) ||
         (window.innerWidth <= 768);
};

export const GoogleAuth: React.FC<GoogleAuthProps> = ({ onLogin, onLogout }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [useRedirect, setUseRedirect] = useState(isMobileDevice());

  // 앱 최초 로드 시 리다이렉트 결과 처리
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('리다이렉트 로그인 성공:', result.user);
          onLogin?.();
        }
      } catch (error) {
        console.error('리다이렉트 결과 처리 실패:', error);
      }
    };

    handleRedirectResult();
  }, [onLogin]);

  // Google 로그인 (모바일은 리다이렉트, 데스크톱은 팝업 우선)
  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    
    try {
      setIsLoggingIn(true);
      console.log('Google 로그인 시도...');
      
      // 모바일이거나 이미 리다이렉트 모드인 경우 바로 리다이렉트
      if (useRedirect || isMobileDevice()) {
        console.log('리다이렉트 로그인 시도...');
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      
      // 데스크톱에서는 팝업 방식으로 먼저 시도
      if (!useRedirect) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          console.log('팝업 로그인 성공:', result.user);
          onLogin?.();
          return;
        } catch (popupError: any) {
          console.warn('팝업 로그인 실패, 리다이렉트로 전환:', popupError);
          
          // 팝업 차단이나 COOP 관련 오류인 경우 리다이렉트로 전환
          if (popupError?.code === 'auth/popup-blocked' || 
              popupError?.code === 'auth/popup-closed-by-user' ||
              popupError?.code === 'auth/cancelled-popup-request' ||
              popupError?.message?.includes('Cross-Origin-Opener-Policy') ||
              popupError?.message?.includes('COOP')) {
            setUseRedirect(true);
            console.log('팝업이 차단되었습니다. 리다이렉트 방식으로 전환합니다...');
            await signInWithRedirect(auth, googleProvider);
            return;
          }
          
          // 다른 오류는 그대로 전파
          throw popupError;
        }
      }
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
      
      // COOP 오류인 경우 조용히 리다이렉트로 전환
      if (error?.message?.includes('Cross-Origin-Opener-Policy') || 
          error?.message?.includes('COOP')) {
        console.log('COOP 정책으로 인한 오류, 리다이렉트 방식으로 전환합니다.');
        setUseRedirect(true);
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          console.error('리다이렉트 로그인도 실패:', redirectError);
        }
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
      
      // 더 나은 사용자 피드백
      if (error?.code === 'auth/popup-blocked') {
        alert('팝업이 차단되었습니다.\n\n브라우저 설정에서 팝업을 허용하고 다시 시도해주세요.');
      } else if (error?.code === 'auth/network-request-failed') {
        alert('네트워크 연결을 확인해주세요.\n\n인터넷 연결이 불안정할 수 있습니다.');
      } else if (error?.code === 'auth/invalid-api-key') {
        alert('로그인 시스템에 문제가 있습니다.\n\n잠시 후 다시 시도하거나 관리자에게 문의하세요.');
      } else {
        alert('로그인에 실패했습니다.\n\n잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout?.();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
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
  if (isAuthenticated && user) {
    console.log('로그인 UI 렌더링:', user);
    return (
        <div className="flex items-center gap-1">
          <img 
            src={user.photoURL || 'https://via.placeholder.com/40'} 
            alt={user.displayName || '사용자'}
            className="w-5 h-5 rounded-full"
          />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200 max-w-[80px] truncate">
            {user.displayName || '사용자'}
          </span>
          <button
            onClick={handleLogout}
            className="border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-medium transition-colors"
          >
            로그아웃
          </button>
        </div>
    );
  }

  // 로그인 버튼
  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoggingIn}
      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-gray-300 dark:border-gray-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {isLoggingIn ? '로그인 중...' : useRedirect ? '리다이렉트 로그인' : 'Google로 로그인'}
    </button>
  );
};
