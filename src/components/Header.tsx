import { Settings, Bell, MessageSquare, HelpCircle, Home, Sun, Moon, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { GoogleAuth } from './auth/GoogleAuth';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../firebase/config';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

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
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = currentUser?.email === 'okjsk1@gmail.com';
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onNavigateHome}
        >
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              URWEBS
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">편하고로 빠르게 시작하세요</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateNotice}
            className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold ${
              currentPage === 'notice' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' : ''
            }`}
          >
            공지사항
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateCommunity}
            className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold ${
              currentPage === 'community' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' : ''
            }`}
          >
            자유게시판
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateContact}
            className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold ${
              currentPage === 'contact' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' : ''
            }`}
          >
            문의하기
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateMyPage}
            className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold ${
              currentPage === 'mypage' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' : ''
            }`}
          >
            나의 페이지
          </Button>
          
          {/* 관리자 전용 버튼 */}
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onNavigateAdminInquiries}
              className={`text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-semibold ${
                currentPage === 'admin-inquiries' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900' : ''
              }`}
            >
              관리페이지
            </Button>
          )}
        </nav>
        
        {/* 다크모드 토글 & 구글 로그인 */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <GoogleAuth />
        </div>
      </div>
    </header>
  );
}