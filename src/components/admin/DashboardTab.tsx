import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
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
    const loadDashboardData = async () => {
      try {
        // userPages 컬렉션에서 통계 수집 (삭제되지 않은 페이지만)
        const pagesRef = collection(db, 'userPages');
        const pagesSnapshot = await getDocs(pagesRef);
        
        let totalPages = 0;
        let totalWidgets = 0;
        const uniqueUsers = new Set<string>();
        
        pagesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          // 삭제되지 않은 페이지만 카운트
          if (data.isDeleted) {
            return;
          }
          totalPages++;
          totalWidgets += data.widgets?.length || 0;
          if (data.authorId || data.authorEmail) {
            uniqueUsers.add(data.authorId || data.authorEmail);
          }
        });
        
        // 문의 데이터
        const inquiriesRef = collection(db, 'inquiries');
        const inquiriesSnapshot = await getDocs(inquiriesRef);
        const totalInquiries = inquiriesSnapshot.size;
        const pendingInquiries = inquiriesSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
        
        // 템플릿 데이터
        let totalTemplates = 0;
        try {
          const templatesRef = collection(db, 'templates');
          const templatesSnapshot = await getDocs(templatesRef);
          totalTemplates = templatesSnapshot.docs.filter(doc => {
            const data = doc.data();
            return !data.isDeleted; // 삭제되지 않은 템플릿만 카운트
          }).length;
          
          // 템플릿이 없으면 로컬 템플릿 수 사용 (기본값)
          if (totalTemplates === 0) {
            totalTemplates = 1; // 기본 템플릿 1개
          }
        } catch (templatesError) {
          console.error('템플릿 개수 조회 실패:', templatesError);
          totalTemplates = 1; // 기본값
        }
        
        setStats({
          totalUsers: uniqueUsers.size,
          activeUsers: uniqueUsers.size,
          totalInquiries,
          pendingInquiries,
          totalPages,
          totalWidgets,
          totalTemplates,
          todayVisitors: totalPages,
          weeklyGrowth: 0,
          monthlyGrowth: 0
        });
        
        // 최근 활동 (최근 페이지 생성 - 삭제되지 않은 페이지만)
        const recentPages = pagesSnapshot.docs
          .filter(doc => !doc.data().isDeleted) // 삭제되지 않은 페이지만
          .map(doc => ({
            data: doc.data(),
            id: doc.id
          }))
          .sort((a, b) => {
            const aTime = a.data.createdAt?.seconds || 0;
            const bTime = b.data.createdAt?.seconds || 0;
            return bTime - aTime;
          })
          .slice(0, 5);
        
        const activities: RecentActivity[] = recentPages.map((item, index) => ({
          id: item.id,
          type: 'page',
          description: `${item.data.title || '제목 없음'} 페이지가 생성되었습니다`,
          timestamp: item.data.createdAt?.seconds ? new Date(item.data.createdAt.seconds * 1000) : new Date(),
          user: item.data.authorEmail || '익명'
        }));
        
        setRecentActivities(activities);
        setLoading(false);
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
        setLoading(false);
      }
    };
    
    loadDashboardData();
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-stats-section>
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
            <div 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                // InquiriesTab으로 전환하고 미처리 필터 적용
                const event = new CustomEvent('switch-tab', { detail: 'inquiries' });
                window.dispatchEvent(event);
                // 미처리 문의 필터 적용
                setTimeout(() => {
                  const filterEvent = new CustomEvent('filter-inquiries', { detail: 'pending' });
                  window.dispatchEvent(filterEvent);
                }, 100);
              }}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">미처리 문의</p>
                  <p className="text-sm text-gray-600">{stats.pendingInquiries}개의 문의가 대기중입니다</p>
                </div>
              </div>
            </div>
            <div 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                // UsersTab으로 전환하고 최신순 정렬
                const event = new CustomEvent('switch-tab', { detail: 'users' });
                window.dispatchEvent(event);
                // 사용자 탭에서 최신순으로 정렬하도록 알림
                setTimeout(() => {
                  const sortEvent = new CustomEvent('sort-users', { detail: 'newest' });
                  window.dispatchEvent(sortEvent);
                }, 100);
              }}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">새로운 사용자</p>
                  <p className="text-sm text-gray-600">최근 가입한 사용자들을 확인하세요</p>
                </div>
              </div>
            </div>
            <div 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                // 대시보드 탭으로 전환 (이미 대시보드면 스크롤만)
                const event = new CustomEvent('switch-tab', { detail: 'dashboard' });
                window.dispatchEvent(event);
                // 성장 통계 섹션으로 스크롤
                setTimeout(() => {
                  const statsSection = document.querySelector('[data-stats-section]');
                  if (statsSection) {
                    statsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
            >
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



