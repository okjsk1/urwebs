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
  Activity
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

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

  // Firestore에서 사용자 데이터 조회 (실제로는 Authentication과 연동 필요)
  useEffect(() => {
    // 실제 구현에서는 Authentication API를 통해 사용자 목록을 가져와야 함
    // 현재는 목업 데이터 사용
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'okjsk1@gmail.com',
        displayName: '관리자',
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date(),
        isActive: true,
        pageCount: 5,
        widgetCount: 25
      },
      {
        id: '2',
        email: 'user1@example.com',
        displayName: '사용자1',
        createdAt: new Date('2024-01-15'),
        lastLoginAt: new Date(Date.now() - 86400000), // 1일 전
        isActive: true,
        pageCount: 2,
        widgetCount: 8
      },
      {
        id: '3',
        email: 'user2@example.com',
        displayName: '사용자2',
        createdAt: new Date('2024-02-01'),
        lastLoginAt: new Date(Date.now() - 604800000), // 7일 전
        isActive: false,
        pageCount: 1,
        widgetCount: 3
      }
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  // 필터링된 사용자 목록
  const filteredUsers = users.filter(user => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);
    
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    return matchesStatus && matchesSearch;
  });

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
                          onClick={() => window.open(`mailto:${user.email}`)}
                        >
                          <Mail className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={user.isActive ? 'text-red-600' : 'text-green-600'}
                        >
                          {user.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
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



