import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Users, 
  Mail, 
  FileText, 
  Puzzle, 
  Layout,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalInquiries: number;
  pendingInquiries: number;
  totalPages: number;
  totalWidgets: number;
  totalTemplates: number;
  todayVisitors: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'inquiry' | 'page' | 'widget';
  description: string;
  timestamp: Date;
  user?: string;
}

export function DashboardTab() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
    totalPages: 0,
    totalWidgets: 0,
    totalTemplates: 6,
    todayVisitors: 0,
    weeklyGrowth: 0,
    monthlyGrowth: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 구현에서는 API 호출로 데이터를 가져와야 함
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        activeUsers: 892,
        totalInquiries: 156,
        pendingInquiries: 23,
        totalPages: 3421,
        totalWidgets: 12847,
        totalTemplates: 6,
        todayVisitors: 234,
        weeklyGrowth: 12.5,
        monthlyGrowth: 28.3
      });

      setRecentActivities([
        {
          id: '1',
          type: 'user',
          description: '새로운 사용자가 가입했습니다',
          timestamp: new Date(Date.now() - 300000), // 5분 전
          user: 'user@example.com'
        },
        {
          id: '2',
          type: 'inquiry',
          description: '새로운 문의가 접수되었습니다',
          timestamp: new Date(Date.now() - 600000), // 10분 전
          user: 'customer@example.com'
        },
        {
          id: '3',
          type: 'page',
          description: '새로운 페이지가 생성되었습니다',
          timestamp: new Date(Date.now() - 900000), // 15분 전
          user: 'user2@example.com'
        },
        {
          id: '4',
          type: 'widget',
          description: '위젯이 추가되었습니다',
          timestamp: new Date(Date.now() - 1200000), // 20분 전
          user: 'user3@example.com'
        },
        {
          id: '5',
          type: 'user',
          description: '사용자가 로그인했습니다',
          timestamp: new Date(Date.now() - 1500000), // 25분 전
          user: 'user4@example.com'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4 text-blue-500" />;
      case 'inquiry': return <Mail className="w-4 h-4 text-orange-500" />;
      case 'page': return <FileText className="w-4 h-4 text-green-500" />;
      case 'widget': return <Puzzle className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">대시보드</h2>
            <p className="text-gray-600">URWEBS 서비스 현황 및 통계</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">
              <TrendingUp className="w-3 h-3 mr-1" />
              성장률 +{stats.weeklyGrowth}%
            </Badge>
          </div>
        </div>
      </Card>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 사용자</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{stats.monthlyGrowth}%</span>
              </div>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">활성 사용자</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeUsers.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <Activity className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% 활성률
                </span>
              </div>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 페이지</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalPages.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <FileText className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-sm text-gray-600">평균 {Math.round(stats.totalPages / stats.totalUsers)}개/사용자</span>
              </div>
            </div>
            <FileText className="w-12 h-12 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 위젯</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalWidgets.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <Puzzle className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-gray-600">평균 {Math.round(stats.totalWidgets / stats.totalPages)}개/페이지</span>
              </div>
            </div>
            <Puzzle className="w-12 h-12 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 문의</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalInquiries}</p>
              <div className="flex items-center mt-1">
                <Mail className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-gray-600">미처리 {stats.pendingInquiries}개</span>
              </div>
            </div>
            <Mail className="w-12 h-12 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">오늘 방문자</p>
              <p className="text-3xl font-bold text-cyan-600">{stats.todayVisitors}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-cyan-500 mr-1" />
                <span className="text-sm text-cyan-600">+{stats.weeklyGrowth}%</span>
              </div>
            </div>
            <Activity className="w-12 h-12 text-cyan-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">사용 가능 템플릿</p>
              <p className="text-3xl font-bold text-pink-600">{stats.totalTemplates}</p>
              <div className="flex items-center mt-1">
                <Layout className="w-4 h-4 text-pink-500 mr-1" />
                <span className="text-sm text-gray-600">템플릿</span>
              </div>
            </div>
            <Layout className="w-12 h-12 text-pink-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">시스템 상태</p>
              <p className="text-3xl font-bold text-green-600">정상</p>
              <div className="flex items-center mt-1">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">모든 서비스 운영중</span>
              </div>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </Card>
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  {activity.user && (
                    <p className="text-xs text-gray-500 mt-1">{activity.user}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h3>
          <div className="space-y-3">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">미처리 문의</p>
                  <p className="text-sm text-gray-600">{stats.pendingInquiries}개의 문의가 대기중입니다</p>
                </div>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">새로운 사용자</p>
                  <p className="text-sm text-gray-600">최근 가입한 사용자들을 확인하세요</p>
                </div>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">성장 분석</p>
                  <p className="text-sm text-gray-600">서비스 성장 지표를 분석해보세요</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}



