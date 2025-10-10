import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { Clock, Star, Globe, ArrowLeft, Eye, ThumbsUp, User } from 'lucide-react';

interface PageItem {
  id: string;
  urlId?: string;
  title: string;
  description: string;
  author: string;
  category: string;
  timeAgo?: string;
  views: number;
  likes: number;
  tags: string[];
}

export function AllPagesListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'latest'; // latest, popular, all
  
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTimeAgo = (date: Date | undefined): string => {
    if (!date) return '알 수 없음';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return '방금 전';
  };

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const pagesRef = collection(db, 'userPages');
        let q;
        
        // 타입에 따라 다른 쿼리 실행
        switch (type) {
          case 'latest':
            q = query(
              pagesRef,
              where('isPublic', '==', true),
              orderBy('updatedAt', 'desc'),
              limit(50)
            );
            break;
          case 'popular':
            q = query(
              pagesRef,
              where('isPublic', '==', true),
              orderBy('views', 'desc'),
              limit(50)
            );
            break;
          case 'all':
            q = query(
              pagesRef,
              where('isPublic', '==', true),
              orderBy('createdAt', 'desc'),
              limit(50)
            );
            break;
          default:
            q = query(
              pagesRef,
              where('isPublic', '==', true),
              orderBy('updatedAt', 'desc'),
              limit(50)
            );
        }
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const pagesData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              urlId: data.urlId || doc.id,
              title: data.title || '제목 없음',
              description: data.description || '설명 없음',
              author: data.authorName || '익명',
              category: data.category || '일반',
              timeAgo: getTimeAgo(data.updatedAt?.toDate()),
              views: data.views || 0,
              likes: data.likes || 0,
              tags: data.tags || []
            };
          });
          setPages(pagesData);
        }
      } catch (err) {
        console.error('페이지 목록 가져오기 실패:', err);
        setError('페이지 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPages();
  }, [type]);

  const getTitle = () => {
    switch (type) {
      case 'latest': return '최신 업데이트';
      case 'popular': return '인기 시작페이지';
      case 'all': return '전체 페이지';
      default: return '페이지 목록';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'latest': return <Clock className="w-6 h-6 text-blue-600" />;
      case 'popular': return <Star className="w-6 h-6 text-yellow-500" />;
      case 'all': return <Globe className="w-6 h-6 text-purple-600" />;
      default: return <Globe className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">메인으로</span>
            </button>
            <div className="flex items-center gap-2">
              {getIcon()}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getTitle()}</h1>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            총 <span className="font-bold text-blue-600 dark:text-blue-400">{pages.length}</span>개
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          // 로딩 상태
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex gap-2">
                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // 에러 상태
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              다시 시도
            </button>
          </div>
        ) : pages.length === 0 ? (
          // 데이터 없음
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 dark:text-gray-600 mb-4">{getIcon()}</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">아직 페이지가 없습니다</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">첫 번째 페이지를 만들어보세요!</p>
            <button
              onClick={() => navigate('/mypage')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              나만의 페이지 만들기
            </button>
          </div>
        ) : (
          // 페이지 목록
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div
                key={page.id}
                onClick={() => page.urlId && navigate(`/${page.urlId}`)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer border border-transparent hover:border-blue-300 dark:hover:border-blue-500"
              >
                {/* 제목 */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                  {page.title}
                </h3>
                
                {/* 설명 */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {page.description}
                </p>
                
                {/* 작성자 및 카테고리 */}
                <div className="flex items-center gap-3 mb-3 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4 mr-1" />
                    {page.author}
                  </div>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    {page.category}
                  </span>
                </div>
                
                {/* 시간 (최신 업데이트만) */}
                {type === 'latest' && page.timeAgo && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <Clock className="w-3 h-3 mr-1" />
                    {page.timeAgo}
                  </div>
                )}
                
                {/* 통계 및 태그 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {page.views.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {page.likes}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {page.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

