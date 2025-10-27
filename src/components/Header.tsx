import React from 'react';
import { Settings, Bell, MessageSquare, HelpCircle, Home, Sun, Moon, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { GoogleAuth } from './auth/GoogleAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRoles } from '../hooks/useRoles';
import { useTranslation } from '../hooks/useTranslation';

interface HeaderProps {
  currentPage: string;
  onNavigateHome: () => void;
  onNavigateNotice: () => void;
  onNavigateCommunity: () => void;
  onNavigateContact: () => void;
  onNavigateMyPage: () => void;
  onNavigateAdminInquiries: () => void;
}

export function Header({ 
  currentPage, 
  onNavigateHome, 
  onNavigateNotice,
  onNavigateCommunity,
  onNavigateContact,
  onNavigateMyPage,
  onNavigateAdminInquiries
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { user, loading: authLoading, authChecked } = useAuth();
  const { roles, isAdmin, loading: rolesLoading } = useRoles();
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-2 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-4 md:gap-6 cursor-pointer hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded"
          onClick={onNavigateHome}
          role="button"
          tabIndex={0}
          aria-label="홈으로 이동"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigateHome();
            }
          }}
        >
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
              URWEBS
            </h1>
          </div>
        </div>
        
        {/* 모바일 메뉴 버튼 */}
        <div className="md:hidden">
          <button 
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="메뉴 열기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 lg:gap-8" role="navigation" aria-label="메인 네비게이션">
          <button 
            onClick={onNavigateNotice}
            aria-current={currentPage === 'notice' ? 'page' : undefined}
            aria-label={t('header.nav.notice')}
            className={`text-sm font-bold text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-1 border-b-2 border-transparent hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              currentPage === 'notice' ? 'text-blue-600 dark:text-blue-400 border-blue-600' : ''
            }`}
          >
            {t('header.notice')}
          </button>
          <button 
            onClick={onNavigateCommunity}
            aria-current={currentPage === 'community' ? 'page' : undefined}
            aria-label={t('header.nav.community')}
            className={`text-sm font-bold text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-1 border-b-2 border-transparent hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              currentPage === 'community' ? 'text-blue-600 dark:text-blue-400 border-blue-600' : ''
            }`}
          >
            {t('header.community')}
          </button>
          <button 
            onClick={onNavigateContact}
            aria-current={currentPage === 'contact' ? 'page' : undefined}
            aria-label={t('header.nav.contact')}
            className={`text-sm font-bold text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-1 border-b-2 border-transparent hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              currentPage === 'contact' ? 'text-blue-600 dark:text-blue-400 border-blue-600' : ''
            }`}
          >
            {t('header.contact')}
          </button>
          <button 
            onClick={onNavigateMyPage}
            aria-current={currentPage === 'mypage' ? 'page' : undefined}
            aria-label={t('header.nav.mypage')}
            className={`text-sm font-bold text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-1 border-b-2 border-transparent hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              currentPage === 'mypage' ? 'text-blue-600 dark:text-blue-400 border-blue-600' : ''
            }`}
          >
            {t('header.mypage')}
          </button>
          
          {/* 관리자 전용 버튼 */}
          {(!authChecked || authLoading || rolesLoading) ? (
            <div className="w-20 h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          ) : isAdmin && (
            <button 
              onClick={onNavigateAdminInquiries}
              aria-current={currentPage === 'admin-inquiries' ? 'page' : undefined}
              aria-label={t('header.nav.admin')}
              className={`text-sm font-bold text-gray-700 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-1 px-1 border-b-2 border-transparent hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                currentPage === 'admin-inquiries' ? 'text-purple-600 dark:text-purple-400 border-purple-600' : ''
              }`}
            >
              {t('header.admin')}
            </button>
          )}
        </nav>
        
        {/* 다크모드 토글 & 구글 로그인 */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'dark' ? t('header.theme.light') : t('header.theme.dark')}
            title={theme === 'dark' ? t('header.theme.light.title') : t('header.theme.dark.title')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <GoogleAuth />
        </div>
        
        {/* 모바일용 다크모드 토글 */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'dark' ? t('header.theme.light') : t('header.theme.dark')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}