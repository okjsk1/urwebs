import React, { useEffect, useState } from 'react';
import { Settings, Bell, MessageSquare, HelpCircle, Home, Sun, Moon, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { GoogleAuth } from './auth/GoogleAuth';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
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
  const { roles, isAdmin, loading: rolesLoading } = useRoles();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);
  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-900 px-4 py-2 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded"
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              URWEBS
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t('header.brand.subtitle')}</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-6" role="navigation" aria-label="메인 네비게이션">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateNotice}
            aria-current={currentPage === 'notice' ? 'page' : undefined}
            aria-label={t('header.nav.notice')}
            className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
              currentPage === 'notice' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' : ''
            }`}
          >
            {t('header.notice')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateCommunity}
            aria-current={currentPage === 'community' ? 'page' : undefined}
            aria-label={t('header.nav.community')}
            className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
              currentPage === 'community' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' : ''
            }`}
          >
            {t('header.community')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateContact}
            aria-current={currentPage === 'contact' ? 'page' : undefined}
            aria-label={t('header.nav.contact')}
            className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
              currentPage === 'contact' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' : ''
            }`}
          >
            {t('header.contact')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateMyPage}
            aria-current={currentPage === 'mypage' ? 'page' : undefined}
            aria-label={t('header.nav.mypage')}
            className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
              currentPage === 'mypage' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' : ''
            }`}
          >
            {t('header.mypage')}
          </Button>
          
          {/* 관리자 전용 버튼 */}
          {!authChecked || rolesLoading ? (
            <div className="w-20 h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          ) : isAdmin && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onNavigateAdminInquiries}
              aria-current={currentPage === 'admin-inquiries' ? 'page' : undefined}
              aria-label={t('header.nav.admin')}
              className={`text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 ${
                currentPage === 'admin-inquiries' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900' : ''
              }`}
            >
              {t('header.admin')}
            </Button>
          )}
        </nav>
        
        {/* 다크모드 토글 & 구글 로그인 */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'dark' ? t('header.theme.light') : t('header.theme.dark')}
            title={theme === 'dark' ? t('header.theme.light.title') : t('header.theme.dark.title')}
            className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 bg-gray-100 dark:bg-gray-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 border border-gray-200 dark:border-gray-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <GoogleAuth />
        </div>
      </div>
    </header>
  );
}