/**
 * 메인 페이지 래퍼
 * 로그인 시 /favorites로 자동 리디렉션
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HomePageNew } from './HomePageNew';
import { Header } from './Header';

interface HomePageWithRedirectProps {
  onCategorySelect?: (categoryId: string, subCategory?: string) => void;
}

export function HomePageWithRedirect({ onCategorySelect }: HomePageWithRedirectProps) {
  const navigate = useNavigate();
  const { user, authChecked } = useAuth();

  useEffect(() => {
    // URL에 `?skipRedirect=true`가 없고, 인증 확인 후 로그인 상태이면 /favorites로 리디렉션
    // 하지만 첫 방문이 아닌 경우(뒤로가기 등)는 리디렉션하지 않음
    const urlParams = new URLSearchParams(window.location.search);
    const skipRedirect = urlParams.get('skipRedirect') === 'true';
    
    // 세션 스토리지에 'homeVisited' 플래그가 있으면 리디렉션하지 않음
    const hasVisitedHome = sessionStorage.getItem('homeVisited');
    
    if (authChecked && user && !skipRedirect && !hasVisitedHome) {
      // 첫 방문 시에만 리디렉션하고, 이후에는 홈 페이지를 볼 수 있도록 플래그 설정
      sessionStorage.setItem('homeVisited', 'true');
      navigate('/favorites', { replace: true });
    }
  }, [user, authChecked, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-gray-950 dark:to-gray-900">
      <Header 
        currentPage="home"
        onNavigateHome={() => {
          // 홈 버튼 클릭 시에는 리디렉션을 건너뛰도록 플래그 설정
          sessionStorage.setItem('homeVisited', 'true');
          navigate('/');
        }}
        onNavigateNotice={() => navigate('/notice')}
        onNavigateCommunity={() => navigate('/community')}
        onNavigateContact={() => navigate('/contact')}
        onNavigateMyPage={() => navigate('/mypage')}
        onNavigateAdminInquiries={() => navigate('/admin')}
      />
      <main>
        <HomePageNew onCategorySelect={onCategorySelect} />
      </main>
    </div>
  );
}
