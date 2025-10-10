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
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600">
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
      blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
      green: 'text-green-600 bg-green-50 hover:bg-green-100',
      purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
      orange: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
      cyan: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100',
      pink: 'text-pink-600 bg-pink-50 hover:bg-pink-100',
      gray: 'text-gray-600 bg-gray-50 hover:bg-gray-100'
    };
    return colorMap[color] || colorMap.gray;
  };

  const getActiveTabColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-700 bg-blue-100 border-blue-200',
      green: 'text-green-700 bg-green-100 border-green-200',
      purple: 'text-purple-700 bg-purple-100 border-purple-200',
      orange: 'text-orange-700 bg-orange-100 border-orange-200',
      cyan: 'text-cyan-700 bg-cyan-100 border-cyan-200',
      pink: 'text-pink-700 bg-pink-100 border-pink-200',
      gray: 'text-gray-700 bg-gray-100 border-gray-200'
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">관리페이지</h1>
        </div>
        <p className="text-gray-600">
          URWEBS 서비스 관리 및 운영 도구
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 탭 네비게이션 */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">관리 메뉴</h2>
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
