import { Settings, Bell, MessageSquare, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  currentPage: string;
  onNavigateHome: () => void;
  onNavigateNotice: () => void;
  onNavigateCommunity: () => void;
  onNavigateContact: () => void;
}

export function Header({ 
  currentPage, 
  onNavigateHome, 
  onNavigateNotice,
  onNavigateCommunity,
  onNavigateContact 
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onNavigateHome}
        >
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              URWEBS
            </h1>
            <p className="text-xs text-gray-600">편하고로 빠르게 시작하세요</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateNotice}
            className={`text-gray-700 hover:text-blue-600 transition-colors ${
              currentPage === 'notice' ? 'text-blue-600 bg-blue-50' : ''
            }`}
          >
            <Bell className="w-4 h-4 mr-1" />
            공지사항
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateCommunity}
            className={`text-gray-700 hover:text-blue-600 transition-colors ${
              currentPage === 'community' ? 'text-blue-600 bg-blue-50' : ''
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            자유게시판
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateContact}
            className={`text-gray-700 hover:text-blue-600 transition-colors ${
              currentPage === 'contact' ? 'text-blue-600 bg-blue-50' : ''
            }`}
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            문의하기
          </Button>
        </nav>
      </div>
    </header>
  );
}