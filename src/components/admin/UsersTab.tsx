import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar,
  Search,
  Filter,
  Mail,
  Shield,
  Activity,
  ExternalLink
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';

interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: any;
  lastLoginAt?: any;
  isActive: boolean;
  pageCount?: number;
  widgetCount?: number;
}

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  // Firestore에서 사용자 데이터 조회
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // userPages 컬렉션에서 사용자별 페이지 정보 수집
        const pagesRef = collection(db, 'userPages');
        const pagesSnapshot = await getDocs(pagesRef);
        
        // 사용자별로 그룹화
        const userDataMap = new Map<string, {
          email: string;
          name: string;
          pageCount: number;
          widgetCount: number;
          lastUpdated: Date;
        }>();
        
        pagesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const userId = data.authorId || data.authorEmail;
          
          if (!userId) return;
          
          const existing = userDataMap.get(userId);
          const widgetCount = data.widgets?.length || 0;
          const createdAt = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : new Date();
          const updatedAt = data.updatedAt?.seconds ? new Date(data.updatedAt.seconds * 1000) : new Date();
          
          if (existing) {
            userDataMap.set(userId, {
              ...existing,
              pageCount: existing.pageCount + 1,
              widgetCount: existing.widgetCount + widgetCount,
              createdAt: createdAt < existing.createdAt ? createdAt : existing.createdAt, // 가장 오래된 페이지 생성일이 가입일
              lastUpdated: updatedAt > existing.lastUpdated ? updatedAt : existing.lastUpdated
            });
          } else {
            userDataMap.set(userId, {
              email: data.authorEmail || userId,
              name: data.authorName || '익명',
              pageCount: 1,
              widgetCount,
              createdAt, // 첫 페이지 생성일을 가입일로 간주
              lastUpdated: updatedAt
            });
          }
        });
        
        // Map을 배열로 변환
        const usersArray: User[] = Array.from(userDataMap.entries()).map(([id, data]) => ({
          id,
          email: data.email,
          displayName: data.name,
          createdAt: data.createdAt, // 첫 페이지 생성일을 가입일로 사용
          lastLoginAt: data.lastUpdated,
          isActive: true,
          pageCount: data.pageCount,
          widgetCount: data.widgetCount
        }));
        
        setUsers(usersArray);
        setLoading(false);
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);

  // 정렬 및 필터링된 사용자 목록
  const filteredUsers = users
    .filter(user => {
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && user.isActive) ||
        (filterStatus === 'inactive' && !user.isActive);
      
      const matchesSearch = 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        // 최신 가입순
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      } else if (sortBy === 'oldest') {
        // 오래된 가입순
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return aTime - bTime;
      } else if (sortBy === 'name') {
        // 이름순
        return (a.displayName || a.email).localeCompare(b.displayName || b.email);
      }
      return 0;
    });

  // 대시보드에서 "새로운 사용자" 클릭 시 최신순으로 정렬
  useEffect(() => {
    const handleSortUsers = (event: CustomEvent) => {
      if (event.detail === 'newest') {
        setSortBy('newest');
      }
    };
    
    window.addEventListener('sort-users', handleSortUsers as EventListener);
    return () => window.removeEventListener('sort-users', handleSortUsers as EventListener);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '오늘';
    if (days === 1) return '1일 전';
    if (days < 7) return `${days}일 전`;
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    return `${Math.floor(days / 30)}개월 전`;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">사용자 관리</h2>
            <p className="text-gray-600">
              총 {users.length}명의 사용자 (활성: {users.filter(u => u.isActive).length}명)
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-800">
              활성: {users.filter(u => u.isActive).length}
            </Badge>
            <Badge className="bg-gray-100 text-gray-800">
              비활성: {users.filter(u => !u.isActive).length}
            </Badge>
          </div>
        </div>
      </Card>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 사용자</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">활성 사용자</p>
              <p className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 페이지</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.reduce((sum, user) => sum + (user.pageCount || 0), 0)}
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 위젯</p>
              <p className="text-2xl font-bold text-orange-600">
                {users.reduce((sum, user) => sum + (user.widgetCount || 0), 0)}
              </p>
            </div>
            <Shield className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* 필터 & 검색 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="이메일, 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">전체 사용자</option>
            <option value="active">활성 사용자</option>
            <option value="inactive">비활성 사용자</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="newest">최신 가입순</option>
            <option value="oldest">오래된 가입순</option>
            <option value="name">이름순</option>
          </select>
        </div>
      </Card>

      {/* 사용자 목록 */}
      {loading ? (
        <Card className="p-8 text-center">
          <Users className="w-8 h-8 animate-pulse mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">로딩 중...</p>
        </Card>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-8 text-center">
          <UserX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">사용자가 없습니다.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    마지막 로그인
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    페이지/위젯
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.photoURL ? (
                            <img className="h-10 w-10 rounded-full" src={user.photoURL} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName || '이름 없음'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {user.isActive ? '활성' : '비활성'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt ? getTimeAgo(user.lastLoginAt) : '로그인 없음'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>{user.pageCount || 0}개 페이지</span>
                        <span>•</span>
                        <span>{user.widgetCount || 0}개 위젯</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const userPrefix = user.email?.split('@')[0] || 'user';
                            window.open(`/mypage/${userPrefix}_1`, '_blank');
                          }}
                          title="사용자 페이지 보기"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`mailto:${user.email}`)}
                          title="이메일 보내기"
                        >
                          <Mail className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}



