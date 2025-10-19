import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  AlertCircle,
  Loader2
} from 'lucide-react';
import { auth } from '../firebase/config';
import { requireAdmin, checkUserRoles, filterTabsByRole, logAccessDenied, logAccessGranted } from '../utils/authGuard';

// 정적 import (코드 스플리팅은 나중에 구현)
import { InquiriesTab } from './admin/InquiriesTab';
import { UsersTab } from './admin/UsersTab';
import { DashboardTab } from './admin/DashboardTab';
import { NoticesTab } from './admin/NoticesTab';
import { TemplatesTab } from './admin/TemplatesTab';
import { SystemSettingsTab } from './admin/SystemSettingsTab';

type TabType = 'inquiries' | 'users' | 'dashboard' | 'notices' | 'templates' | 'settings';

interface AdminPageProps {
  onNavigateTemplateEdit?: (initialData?: any) => void;
}

interface Tab {
  id: TabType;
  name: string;
  icon: any;
  description: string;
  color: string;
  requiredRoles?: string[]; // RBAC 지원
}

const tabs: Tab[] = [
  {
    id: 'dashboard',
    name: '대시보드',
    icon: <BarChart3 className="w-4 h-4" />,
    description: '전체 통계 및 현황',
    color: 'purple',
    requiredRoles: ['admin', 'ops']
  },
  {
    id: 'inquiries',
    name: '문의 관리',
    icon: <Mail className="w-4 h-4" />,
    description: '사용자 문의사항 관리',
    color: 'blue',
    requiredRoles: ['admin', 'ops']
  },
  {
    id: 'users',
    name: '사용자 관리',
    icon: <Users className="w-4 h-4" />,
    description: '가입자 목록 및 활동 관리',
    color: 'green',
    requiredRoles: ['admin'] // 슈퍼 관리자만
  },
  {
    id: 'notices',
    name: '공지사항 관리',
    icon: <FileText className="w-4 h-4" />,
    description: '공지사항 작성 및 관리',
    color: 'orange',
    requiredRoles: ['admin', 'ops']
<<<<<<< HEAD
  },
  {
    id: 'widgets',
    name: '위젯 관리',
    icon: <Puzzle className="w-4 h-4" />,
    description: '위젯 목록 및 사용 통계',
    color: 'cyan',
    requiredRoles: ['admin', 'ops']
=======
>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
  },
  {
    id: 'templates',
    name: '템플릿 관리',
    icon: <Layout className="w-4 h-4" />,
    description: '페이지 템플릿 관리',
    color: 'pink',
    requiredRoles: ['admin', 'ops']
  },
  {
    id: 'settings',
    name: '시스템 설정',
    icon: <Settings className="w-4 h-4" />,
    description: '사이트 설정 및 구성',
    color: 'gray',
    requiredRoles: ['admin'] // 슈퍼 관리자만
  }
];

export function AdminPage({ onNavigateTemplateEdit }: AdminPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard' as TabType);
  const [roles, setRoles] = useState(() => [] as string[]);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(() => null as string | null);

  // URL에서 탭 상태 복원
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as TabType;
    const lastTab = localStorage.getItem('admin:lastTab') as TabType;
    const initialTab = tabFromUrl || lastTab || 'dashboard';
    setActiveTab(initialTab);
  }, [searchParams]);

  // URL과 로컬 스토리지에 탭 상태 저장
  useEffect(() => {
    setSearchParams({ tab: activeTab });
    localStorage.setItem('admin:lastTab', activeTab);
  }, [activeTab, setSearchParams]);

  // 권한 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await requireAdmin();
        if (result.ok && result.roles) {
          setRoles(result.roles);
          logAccessGranted('admin_page', result.user?.email || null, result.roles);
        } else {
          setAuthError(result.reason || 'unknown');
          if (result.roles) {
            logAccessDenied('admin_page', result.user?.email || null, result.roles, ['admin', 'ops']);
          }
        }
      } catch (error) {
        console.error('권한 확인 실패:', error);
        setAuthError('auth-check-failed');
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  // 로딩 중
  if (!authChecked) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-12 text-center dark:bg-gray-800 dark:border-gray-700">
          <Loader2 className="w-16 h-16 text-blue-500 dark:text-blue-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">권한 확인 중...</h2>
          <p className="text-gray-600 dark:text-gray-400">
            관리자 권한을 확인하고 있습니다.
          </p>
        </Card>
      </div>
    );
  }

  // 권한 없음
  if (authError || roles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-12 text-center dark:bg-gray-800 dark:border-gray-700">
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            관리자 권한이 필요합니다.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>필요한 역할: admin 또는 ops</p>
            <p>현재 역할: {roles.length > 0 ? roles.join(', ') : '없음'}</p>
          </div>
        </Card>
      </div>
    );
  }

  // 권한에 따른 탭 필터링
  const visibleTabs = filterTabsByRole(tabs, roles);

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
      case 'templates':
        return <TemplatesTab onNavigateTemplateEdit={onNavigateTemplateEdit} />;
      case 'settings':
        return <SystemSettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    // 탭 변경 로깅
    logAccessGranted(`admin_tab_${tabId}`, auth.currentUser?.email || null, roles);
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">관리페이지</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {roles.includes('admin') ? '슈퍼 관리자' : '운영자'}
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {auth.currentUser?.email}
            </span>
          </div>
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
            <nav className="space-y-2" role="tablist">
              {visibleTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                  aria-label={`${tab.name} 탭`}
                  className={`w-full justify-start focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
                    activeTab === tab.id 
                      ? getActiveTabColor(tab.color) 
                      : getTabColor(tab.color)
                  }`}
                  onClick={() => handleTabChange(tab.id)}
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
