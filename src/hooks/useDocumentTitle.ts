/**
 * 라우팅 시 document.title을 규칙에 따라 업데이트하는 훅
 * 규칙: "<섹션> · Workspace"
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const sectionMap: Record<string, string> = {
  '/': 'Home',
  '/notice': '공지사항',
  '/community': '커뮤니티',
  '/contact': '문의하기',
  '/mypage': '마이 페이지',
  '/favorites': '내 관심 페이지',
  '/admin': '관리자',
  '/admin/inquiries': '관리자 · 문의 관리',
};

export function useDocumentTitle() {
  const location = useLocation();

  useEffect(() => {
    const section = sectionMap[location.pathname] || 'Workspace';
    // Stealth 모드 감지
    const urlParams = new URLSearchParams(location.search);
    const isStealth = urlParams.get('mode') === 'stealth';
    
    if (isStealth) {
      document.title = `${section} · Workspace`;
    } else {
      document.title = `${section} · Workspace`;
    }
  }, [location.pathname, location.search]);
}

