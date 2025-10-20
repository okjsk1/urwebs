import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { 
  Search, 
  Plus, 
  Calendar, 
  User, 
  Eye,
  MessageSquare,
  Pin,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  isPinned: boolean;
  category: '공지' | '업데이트' | '이벤트' | '안내';
}

export function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: '공지' as Notice['category']
  });

  // Firebase에서 공지사항 로드
  useEffect(() => {
    const loadNotices = async () => {
      try {
        const noticesRef = collection(db, 'notices');
        const q = query(noticesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const loadedNotices: Notice[] = snapshot.docs.map((doc, index) => {
          const data = doc.data();
          const createdAt = data.createdAt as Timestamp;
          return {
            id: Date.now() + index,
            title: data.title || '',
            content: data.content || '',
            author: data.author || '관리자',
            date: createdAt ? new Date(createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            views: data.views || 0,
            isPinned: data.isPinned || false,
            category: (data.category || '공지') as Notice['category']
          };
        });
        
        setNotices(loadedNotices);
      } catch (error: any) {
        console.error('공지사항 로드 실패:', error);
        
        // 권한 오류인 경우 사용자 친화적 메시지 표시
        if (error?.code === 'permission-denied') {
          console.warn('공지사항 읽기 권한이 없습니다. Firebase 보안 규칙을 확인해주세요.');
          // 빈 배열로 설정하여 "데이터 없음" 상태 표시
          setNotices([]);
        } else {
          // 다른 오류의 경우도 빈 배열로 설정
          setNotices([]);
        }
      }
    };
    
    loadNotices();
  }, []);

  const categories = ['전체', '공지', '업데이트', '이벤트', '안내'];
  const itemsPerPage = 10;

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || notice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedNotices = filteredNotices.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const totalPages = Math.ceil(sortedNotices.length / itemsPerPage);
  const paginatedNotices = sortedNotices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCategoryColor = (category: Notice['category']) => {
    switch (category) {
      case '공지': return 'bg-red-100 text-red-800 border-red-200';
      case '업데이트': return 'bg-blue-100 text-blue-800 border-blue-200';
      case '이벤트': return 'bg-green-100 text-green-800 border-green-200';
      case '안내': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSubmitNotice = () => {
    // 실제로는 API 호출
    console.log('새 공지사항:', newNotice);
    setShowWriteForm(false);
    setNewNotice({ title: '', content: '', category: '공지' });
  };

  if (selectedNotice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedNotice(null)}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </div>

        <Card className="p-8">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              {selectedNotice.isPinned && (
                <Pin className="w-4 h-4 text-red-500" />
              )}
              <Badge className={getCategoryColor(selectedNotice.category)}>
                {selectedNotice.category}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedNotice.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {selectedNotice.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {selectedNotice.date}
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                조회 {selectedNotice.views}
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {selectedNotice.content}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (showWriteForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowWriteForm(false)}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </div>

        <Card className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">공지사항 작성</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={newNotice.category}
                onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as Notice['category'] })}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="공지">공지</option>
                <option value="업데이트">업데이트</option>
                <option value="이벤트">이벤트</option>
                <option value="안내">안내</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <Input
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                placeholder="공지사항 제목을 입력하세요"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <Textarea
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                placeholder="공지사항 내용을 입력하세요"
                className="w-full h-64 resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleSubmitNotice} className="bg-blue-600 hover:bg-blue-700">
                공지사항 등록
              </Button>
              <Button variant="outline" onClick={() => setShowWriteForm(false)}>
                취소
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">공지사항</h1>
        <p className="text-gray-600">서비스 관련 중요한 공지사항을 확인하세요</p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded mt-4"></div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="공지사항을 검색하세요..."
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 공지사항 목록 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  조회수
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedNotices.map((notice) => (
                <tr
                  key={notice.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedNotice(notice)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {notice.isPinned && (
                        <Pin className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <Badge className={`${getCategoryColor(notice.category)} flex-shrink-0`}>
                        {notice.category}
                      </Badge>
                      <span className="font-medium text-gray-900 hover:text-blue-600">
                        {notice.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {notice.author}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {notice.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {notice.views.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8"
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}