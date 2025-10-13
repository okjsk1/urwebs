import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Settings, 
  Save, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Globe,
  Mail,
  Shield,
  Database,
  Bell,
  Palette,
  Users,
  Key
} from 'lucide-react';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;
  maxUsers: number;
  maxPagesPerUser: number;
  maxWidgetsPerPage: number;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  enableNotifications: boolean;
  defaultTheme: 'light' | 'dark' | 'auto';
  maintenanceMode: boolean;
  analyticsEnabled: boolean;
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export function SystemSettingsTab() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'URWEBS',
    siteDescription: '편하고 빠르게 시작하세요',
    siteUrl: 'https://urwebs.com',
    adminEmail: 'okjsk1@gmail.com',
    supportEmail: 'support@urwebs.com',
    maxUsers: 10000,
    maxPagesPerUser: 10,
    maxWidgetsPerPage: 50,
    allowRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    defaultTheme: 'light',
    maintenanceMode: false,
    analyticsEnabled: true,
    backupEnabled: true,
    backupFrequency: 'daily'
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    // 실제 구현에서는 Firestore에서 설정을 로드해야 함
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      // 실제 구현에서는 Firestore에 설정을 저장해야 함
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    if (confirm('설정을 기본값으로 초기화하시겠습니까?')) {
      setSettings({
        siteName: 'URWEBS',
        siteDescription: '편하고 빠르게 시작하세요',
        siteUrl: 'https://urwebs.com',
        adminEmail: 'okjsk1@gmail.com',
        supportEmail: 'support@urwebs.com',
        maxUsers: 10000,
        maxPagesPerUser: 10,
        maxWidgetsPerPage: 50,
        allowRegistration: true,
        requireEmailVerification: true,
        enableNotifications: true,
        defaultTheme: 'light',
        maintenanceMode: false,
        analyticsEnabled: true,
        backupEnabled: true,
        backupFrequency: 'daily'
      });
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">시스템 설정</h2>
            <p className="text-gray-600">사이트 설정 및 시스템 구성</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              초기화
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saveStatus === 'saving' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : saveStatus === 'saved' ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saveStatus === 'saving' ? '저장 중...' : 
               saveStatus === 'saved' ? '저장됨' : 
               saveStatus === 'error' ? '저장 실패' : '저장'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 시스템 상태 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">시스템 상태</p>
              <p className="text-lg font-semibold text-green-600">정상</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">유지보수 모드</p>
              <p className="text-lg font-semibold text-gray-600">
                {settings.maintenanceMode ? '활성' : '비활성'}
              </p>
            </div>
            {settings.maintenanceMode ? (
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-500" />
            )}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">백업 상태</p>
              <p className="text-lg font-semibold text-blue-600">
                {settings.backupEnabled ? '활성' : '비활성'}
              </p>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* 기본 설정 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          기본 설정
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사이트 이름
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => updateSetting('siteName', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사이트 URL
            </label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => updateSetting('siteUrl', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사이트 설명
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => updateSetting('siteDescription', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </Card>

      {/* 이메일 설정 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          이메일 설정
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              관리자 이메일
            </label>
            <input
              type="email"
              value={settings.adminEmail}
              onChange={(e) => updateSetting('adminEmail', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              지원 이메일
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => updateSetting('supportEmail', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </Card>

      {/* 사용자 제한 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          사용자 제한
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              최대 사용자 수
            </label>
            <input
              type="number"
              value={settings.maxUsers}
              onChange={(e) => updateSetting('maxUsers', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사용자당 최대 페이지
            </label>
            <input
              type="number"
              value={settings.maxPagesPerUser}
              onChange={(e) => updateSetting('maxPagesPerUser', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              페이지당 최대 위젯
            </label>
            <input
              type="number"
              value={settings.maxWidgetsPerPage}
              onChange={(e) => updateSetting('maxWidgetsPerPage', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              min="1"
            />
          </div>
        </div>
      </Card>

      {/* 보안 설정 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          보안 설정
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">회원가입 허용</div>
              <div className="text-sm text-gray-600">새로운 사용자의 가입을 허용합니다</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => updateSetting('allowRegistration', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">이메일 인증 필수</div>
              <div className="text-sm text-gray-600">회원가입 시 이메일 인증을 요구합니다</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={(e) => updateSetting('requireEmailVerification', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">유지보수 모드</div>
              <div className="text-sm text-gray-600">사이트를 유지보수 모드로 전환합니다</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* 알림 설정 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          알림 설정
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">알림 활성화</div>
              <div className="text-sm text-gray-600">시스템 알림을 활성화합니다</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => updateSetting('enableNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* 테마 설정 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          테마 설정
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기본 테마
          </label>
          <select
            value={settings.defaultTheme}
            onChange={(e) => updateSetting('defaultTheme', e.target.value as 'light' | 'dark' | 'auto')}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="light">라이트 모드</option>
            <option value="dark">다크 모드</option>
            <option value="auto">자동</option>
          </select>
        </div>
      </Card>

      {/* 백업 설정 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          백업 설정
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">자동 백업</div>
              <div className="text-sm text-gray-600">데이터를 자동으로 백업합니다</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.backupEnabled}
                onChange={(e) => updateSetting('backupEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {settings.backupEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                백업 주기
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => updateSetting('backupFrequency', e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* 분석 설정 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          분석 설정
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">분석 활성화</div>
              <div className="text-sm text-gray-600">사용자 행동 분석을 활성화합니다</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.analyticsEnabled}
                onChange={(e) => updateSetting('analyticsEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}






















