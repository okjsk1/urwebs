import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Pin,
  Calendar,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: '공지' | '업데이트' | '이벤트' | '안내';
  isPinned: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  author: string;
}

export function NoticesTab() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '공지' as Notice['category'],
    isPinned: false
  });

  useEffect(() => {
    // 실제 구현에서는 Firestore에서 데이터를 가져와야 함
    const mockNotices: Notice[] = [
      {
        id: '1',
        title: 'URWEBS 서비스 업데이트 안내',
        content: '새로운 위젯과 템플릿이 추가되었습니다. 더욱 풍부한 기능으로 시작페이지를 꾸며보세요!',
        category: '업데이트',
        isPinned: true,
        views: 1247,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        author: '관리자'
      },
      {
        id: '2',
        title: '서비스 점검 안내',
        content: '더 나은 서비스를 위해 시스템 점검을 진행합니다. 점검 시간: 2024년 1월 20일 02:00-04:00',
        category: '안내',
        isPinned: false,
        views: 892,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        author: '관리자'
      },
      {
        id: '3',
        title: '신규 사용자 환영 이벤트',
        content: 'URWEBS에 가입해주신 모든 분들께 특별한 혜택을 드립니다!',
        category: '이벤트',
        isPinned: false,
        views: 2341,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
        author: '관리자'
      }
    ];

    setTimeout(() => {
      setNotices(mockNotices);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredNotices = notices.filter(notice => {
    const matchesCategory = filterCategory === 'all' || notice.category === filterCategory;
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedNotices = filteredNotices.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const getCategoryColor = (category: Notice['category']) => {
    switch (category) {
      case '공지': return 'bg-red-100 text-red-800 border-red-200';
      case '업데이트': return 'bg-blue-100 text-blue-800 border-blue-200';
      case '이벤트': return 'bg-green-100 text-green-800 border-green-200';
      case '안내': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNotice) {
      // 수정
      setNotices(prev => prev.map(notice => 
        notice.id === editingNotice.id 
          ? { ...notice, ...formData, updatedAt: new Date() }
          : notice
      ));
    } else {
      // 새 공지사항 추가
      const newNotice: Notice = {
        id: Date.now().toString(),
        ...formData,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: '관리자'
      };
      setNotices(prev => [newNotice, ...prev]);
    }
    
    setFormData({ title: '', content: '', category: '공지', isPinned: false });
    setShowForm(false);
    setEditingNotice(null);
  };

  const handleEdit = (notice: Notice) => {
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      isPinned: notice.isPinned
    });
    setEditingNotice(notice);
    setShowForm(true);
  };

  const handleDelete = (noticeId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setNotices(prev => prev.filter(notice => notice.id !== noticeId));
    setSelectedNotice(null);
  };

  const togglePin = (noticeId: string) => {
    setNotices(prev => prev.map(notice => 
      notice.id === noticeId 
        ? { ...notice, isPinned: !notice.isPinned }
        : notice
    ));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">공지사항 관리</h2>
            <p className="text-gray-600">
              총 {notices.length}개의 공지사항 (고정: {notices.filter(n => n.isPinned).length}개)
            </p>
          </div>
          <Button 
            onClick={() => {
              setShowForm(true);
              setEditingNotice(null);
              setFormData({ title: '', content: '', category: '공지', isPinned: false });
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 공지사항
          </Button>
        </div>
      </Card>

      {/* 필터 & 검색 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="제목, 내용으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">전체 카테고리</option>
            <option value="공지">공지</option>
            <option value="업데이트">업데이트</option>
            <option value="이벤트">이벤트</option>
            <option value="안내">안내</option>
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 공지사항 목록 */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <Card className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">로딩 중...</p>
            </Card>
          ) : sortedNotices.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">공지사항이 없습니다.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedNotices.map((notice) => (
                <Card
                  key={notice.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedNotice?.id === notice.id ? 'ring-2 ring-blue-500' : ''
                  } ${notice.isPinned ? 'bg-yellow-50 border-yellow-200' : ''}`}
                  onClick={() => setSelectedNotice(notice)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {notice.isPinned && (
                          <Pin className="w-4 h-4 text-yellow-600" />
                        )}
                        <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{notice.content}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge className={getCategoryColor(notice.category)}>
                        {notice.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="w-3 h-3" />
                        {notice.views}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{notice.author}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {notice.createdAt.toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 공지사항 상세/편집 */}
        <div className="lg:col-span-1">
          {showForm ? (
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingNotice ? '공지사항 수정' : '새 공지사항 작성'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제목
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Notice['category'] }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="공지">공지</option>
                    <option value="업데이트">업데이트</option>
                    <option value="이벤트">이벤트</option>
                    <option value="안내">안내</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    내용
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="isPinned" className="text-sm text-gray-700">
                    상단 고정
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingNotice ? '수정' : '작성'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingNotice(null);
                    }}
                  >
                    취소
                  </Button>
                </div>
              </form>
            </Card>
          ) : selectedNotice ? (
            <Card className="p-6 sticky top-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {selectedNotice.isPinned && (
                    <Pin className="w-4 h-4 text-yellow-600" />
                  )}
                  <Badge className={getCategoryColor(selectedNotice.category)}>
                    {selectedNotice.category}
                  </Badge>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedNotice.title}
                </h2>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">작성자</div>
                  <div className="text-sm">{selectedNotice.author}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">작성일</div>
                  <div className="text-sm">{selectedNotice.createdAt.toLocaleString('ko-KR')}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">조회수</div>
                  <div className="text-sm">{selectedNotice.views}</div>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="text-xs text-gray-500 mb-2">내용</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {selectedNotice.content}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(selectedNotice)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  수정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePin(selectedNotice.id)}
                  className={selectedNotice.isPinned ? 'bg-yellow-100 text-yellow-700' : ''}
                >
                  <Pin className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(selectedNotice.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">공지사항을 선택하세요</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}





















