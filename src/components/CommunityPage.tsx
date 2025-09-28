import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  Search, 
  Plus, 
  Calendar, 
  User, 
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Send
} from 'lucide-react';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: Comment[];
  category: '자유' | '질문' | '정보' | '후기' | '건의';
}

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  likes: number;
}

const mockPosts: Post[] = [
  {
    id: 1,
    title: '나만의 시작페이지 꾸미기 팁 공유',
    content: '여러분들은 시작페이지를 어떻게 꾸미시나요? 저는 색상 조합을 맞춰서 통일감 있게 만드는 걸 좋아해요. 위젯 배치도 자주 사용하는 순서대로 배치했습니다.',
    author: '디자인러버',
    date: '2024-12-20',
    views: 234,
    likes: 15,
    dislikes: 1,
    category: '정보',
    comments: [
      { id: 1, author: '코딩초보', content: '정말 유용한 정보네요! 저도 따라해봐야겠어요', date: '2024-12-20', likes: 3 },
      { id: 2, author: '웹디자이너', content: '색상 조합 부분이 특히 도움됐습니다', date: '2024-12-20', likes: 5 }
    ]
  },
  {
    id: 2,
    title: '새로운 카테고리 추가 요청 - 운동/헬스',
    content: '운동 관련 사이트들을 모아놓은 카테고리가 있으면 좋겠어요. 헬스장 정보, 운동 영상, 영양 정보 등을 한번에 볼 수 있으면 편할 것 같습니다.',
    author: '헬스매니아',
    date: '2024-12-19',
    views: 156,
    likes: 8,
    dislikes: 0,
    category: '건의',
    comments: [
      { id: 3, author: '운동좋아', content: '저도 이런 카테고리 필요하다고 생각했어요!', date: '2024-12-19', likes: 4 }
    ]
  },
  {
    id: 3,
    title: '위젯이 계속 사라져요 ㅠㅠ',
    content: '편집 모드에서 위젯을 배치하고 저장해도 새로고침하면 가끔 사라집니다. 혹시 같은 현상 겪으신 분 있나요?',
    author: '컴맹유저',
    date: '2024-12-19',
    views: 89,
    likes: 3,
    dislikes: 0,
    category: '질문',
    comments: [
      { id: 4, author: '테크전문가', content: '브라우저 캐시를 지워보세요', date: '2024-12-19', likes: 2 },
      { id: 5, author: '개발자', content: 'localStorage 문제일 수 있어요. 다른 브라우저에서도 확인해보세요', date: '2024-12-19', likes: 6 }
    ]
  },
  {
    id: 4,
    title: '이 서비스 정말 유용해요!',
    content: '평소에 자주 가는 사이트들이 다 정리되어 있어서 북마크바가 깔끔해졌어요. 특히 카테고리별로 나눠져 있는게 너무 좋습니다.',
    author: '만족한사용자',
    date: '2024-12-18',
    views: 312,
    likes: 22,
    dislikes: 0,
    category: '후기',
    comments: []
  },
  {
    id: 5,
    title: '모바일 버전은 언제 나오나요?',
    content: '모바일에서도 편하게 사용할 수 있는 앱이나 모바일 최적화 버전이 있으면 좋겠어요.',
    author: '모바일유저',
    date: '2024-12-17',
    views: 198,
    likes: 12,
    dislikes: 2,
    category: '질문',
    comments: []
  }
];

export function CommunityPage() {
  const [posts] = useState<Post[]>(mockPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '자유' as Post['category']
  });
  const [newComment, setNewComment] = useState('');

  const categories = ['전체', '자유', '질문', '정보', '후기', '건의'];
  const itemsPerPage = 10;

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = filteredPosts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const totalPages = Math.ceil(sortedPosts.length / itemsPerPage);
  const paginatedPosts = sortedPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCategoryColor = (category: Post['category']) => {
    switch (category) {
      case '자유': return 'bg-blue-100 text-blue-800 border-blue-200';
      case '질문': return 'bg-orange-100 text-orange-800 border-orange-200';
      case '정보': return 'bg-green-100 text-green-800 border-green-200';
      case '후기': return 'bg-purple-100 text-purple-800 border-purple-200';
      case '건의': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSubmitPost = () => {
    console.log('새 게시글:', newPost);
    setShowWriteForm(false);
    setNewPost({ title: '', content: '', category: '자유' });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    console.log('새 댓글:', newComment);
    setNewComment('');
  };

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedPost(null)}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </div>

        <Card className="p-8 mb-6">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge className={getCategoryColor(selectedPost.category)}>
                {selectedPost.category}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedPost.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {selectedPost.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {selectedPost.date}
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                조회 {selectedPost.views}
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                댓글 {selectedPost.comments.length}
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none mb-6">
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {selectedPost.content}
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              좋아요 {selectedPost.likes}
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ThumbsDown className="w-4 h-4" />
              {selectedPost.dislikes}
            </Button>
          </div>
        </Card>

        {/* 댓글 섹션 */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            댓글 {selectedPost.comments.length}
          </h3>
          
          {/* 댓글 작성 */}
          <div className="mb-6">
            <div className="flex gap-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 작성하세요..."
                className="flex-1 resize-none"
                rows={3}
              />
              <Button onClick={handleSubmitComment} className="self-end">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {selectedPost.comments.map((comment) => (
              <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-gray-900">{comment.author}</span>
                  <span className="text-sm text-gray-500">{comment.date}</span>
                </div>
                <p className="text-gray-800 mb-2">{comment.content}</p>
                <Button variant="ghost" size="sm" className="text-xs">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {comment.likes}
                </Button>
              </div>
            ))}
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">게시글 작성</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value as Post['category'] })}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="자유">자유</option>
                <option value="질문">질문</option>
                <option value="정보">정보</option>
                <option value="후기">후기</option>
                <option value="건의">건의</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <Input
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="게시글 제목을 입력하세요"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <Textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="게시글 내용을 입력하세요"
                className="w-full h-64 resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleSubmitPost} className="bg-blue-600 hover:bg-blue-700">
                게시글 등록
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
        <h1 className="text-4xl font-bold text-gray-900 mb-3">자유게시판</h1>
        <p className="text-gray-600">자유롭게 소통하고 정보를 나눠보세요</p>
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
              placeholder="게시글을 검색하세요..."
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
          
          <Button onClick={() => setShowWriteForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            글쓰기
          </Button>
        </div>
      </div>

      {/* 게시글 목록 */}
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
                  조회/추천
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPosts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getCategoryColor(post.category)} flex-shrink-0`}>
                        {post.category}
                      </Badge>
                      <div>
                        <div className="font-medium text-gray-900 hover:text-blue-600">
                          {post.title}
                        </div>
                        {post.comments.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <MessageSquare className="w-3 h-3 text-blue-500" />
                            <span className="text-xs text-blue-500">{post.comments.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.author}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>{post.views}</span>
                      <span>/</span>
                      <span className="text-green-600">{post.likes}</span>
                    </div>
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