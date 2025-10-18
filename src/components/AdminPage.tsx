import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Mail, 
  Users, 
  BarChart3, 
  FileText, 
  Puzzle, 
  Layout, 
  Settings,
  Shield,
  AlertCircle
} from 'lucide-react';
import { auth } from '../firebase/config';
import { InquiriesTab } from './admin/InquiriesTab';
import { UsersTab } from './admin/UsersTab';
import { DashboardTab } from './admin/DashboardTab';
import { NoticesTab } from './admin/NoticesTab';
import { WidgetsTab } from './admin/WidgetsTab';
import { TemplatesTab } from './admin/TemplatesTab';
import { SystemSettingsTab } from './admin/SystemSettingsTab';

type TabType = 'inquiries' | 'users' | 'dashboard' | 'notices' | 'widgets' | 'templates' | 'settings';

interface AdminPageProps {
  onNavigateTemplateEdit?: (initialData?: any) => void;
}

interface Tab {
  id: TabType;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const tabs: Tab[] = [
  {
    id: 'inquiries',
    name: '문의 관리',
    icon: <Mail className="w-4 h-4" />,
    description: '사용자 문의사항 관리',
    color: 'blue'
  },
  {
    id: 'users',
    name: '사용자 관리',
    icon: <Users className="w-4 h-4" />,
    description: '가입자 목록 및 활동 관리',
    color: 'green'
  },
  {
    id: 'dashboard',
    name: '대시보드',
    icon: <BarChart3 className="w-4 h-4" />,
    description: '전체 통계 및 현황',
    color: 'purple'
  },
  {
    id: 'notices',
    name: '공지사항 관리',
    icon: <FileText className="w-4 h-4" />,
    description: '공지사항 작성 및 관리',
    color: 'orange'
  },
  {
    id: 'widgets',
    name: '위젯 관리',
    icon: <Puzzle className="w-4 h-4" />,
    description: '위젯 목록 및 사용 통계',
    color: 'cyan'
  },
  {
    id: 'templates',
    name: '템플릿 관리',
    icon: <Layout className="w-4 h-4" />,
    description: '페이지 템플릿 관리',
    color: 'pink'
  },
  {
    id: 'settings',
    name: '시스템 설정',
    icon: <Settings className="w-4 h-4" />,
    description: '사이트 설정 및 구성',
    color: 'gray'
  }
];

export function AdminPage({ onNavigateTemplateEdit }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  const currentUser = auth.currentUser;
  const isAdmin = currentUser?.email === 'okjsk1@gmail.com';

  // 관리자가 아니면 접근 불가
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-12 text-center dark:bg-gray-800 dark:border-gray-700">
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600 dark:text-gray-400">
            관리자(okjsk1@gmail.com)만 접근할 수 있습니다.
          </p>
        </Card>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inquiries':
        return <InquiriesTab />;
      case 'users':
        return <UsersTab />;
      case 'dashboard':
        return <DashboardTab />;
      case 'notices':
        return <NoticesTab />;
      case 'widgets':
        return <WidgetsTab />;
      case 'templates':
        return <TemplatesTab onNavigateTemplateEdit={onNavigateTemplateEdit} />;
      case 'settings':
        return <SystemSettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  const getTabColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
      green: 'text-green-600 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30',
      purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20 dark:hover:bg-purple-900/30',
      orange: 'text-orange-600 bg-orange-50 hover:bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20 dark:hover:bg-orange-900/30',
      cyan: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/30',
      pink: 'text-pink-600 bg-pink-50 hover:bg-pink-100 dark:text-pink-400 dark:bg-pink-900/20 dark:hover:bg-pink-900/30',
      gray: 'text-gray-600 bg-gray-50 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800/50 dark:hover:bg-gray-800/70'
    };
    return colorMap[color] || colorMap.gray;
  };

  const getActiveTabColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-300 dark:bg-blue-900/40 dark:border-blue-700',
      green: 'text-green-700 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-900/40 dark:border-green-700',
      purple: 'text-purple-700 bg-purple-100 border-purple-200 dark:text-purple-300 dark:bg-purple-900/40 dark:border-purple-700',
      orange: 'text-orange-700 bg-orange-100 border-orange-200 dark:text-orange-300 dark:bg-orange-900/40 dark:border-orange-700',
      cyan: 'text-cyan-700 bg-cyan-100 border-cyan-200 dark:text-cyan-300 dark:bg-cyan-900/40 dark:border-cyan-700',
      pink: 'text-pink-700 bg-pink-100 border-pink-200 dark:text-pink-300 dark:bg-pink-900/40 dark:border-pink-700',
      gray: 'text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-300 dark:bg-gray-800/70 dark:border-gray-600'
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">관리페이지</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          URWEBS 서비스 관리 및 운영 도구
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 탭 네비게이션 */}
        <div className="lg:col-span-1">
          <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">관리 메뉴</h2>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === tab.id 
                    ? getActiveTabColor(tab.color) 
                    : getTabColor(tab.color)
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <div className="ml-3 text-left">
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </Button>
              ))}
            </nav>
          </Card>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
