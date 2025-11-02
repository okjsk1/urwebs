/**
 * 메인 페이지 래퍼
 * 자동 리디렉션 제거 - 항상 홈 페이지 표시
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomePageNew } from './HomePageNew';
import { Header } from './Header';

interface HomePageWithRedirectProps {
  onCategorySelect?: (categoryId: string, subCategory?: string) => void;
}

export function HomePageWithRedirect({ onCategorySelect }: HomePageWithRedirectProps) {
  const navigate = useNavigate();

  // 자동 리다이렉트 완전 제거 - 항상 홈 페이지 표시
  // 모든 리다이렉트 로직 제거됨

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-gray-950 dark:to-gray-900">
      <Header 
        currentPage="home"
        onNavigateHome={() => navigate('/')}
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
