import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryHoverCard } from './CategoryHoverCard';
import { db, auth } from '../firebase/config';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Clipboard, 
  Database, 
  Cloud, 
  Pen, 
  Shield, 
  Code, 
  Palette, 
  TrendingUp, 
  Building, 
  Briefcase, 
  Globe, 
  Megaphone,
  BarChart3,
  Video,
  Heart,
  Home,
  DollarSign,
  Bitcoin,
  GraduationCap,
  Car,
  Plane,
  Utensils,
  Camera,
  Gamepad2,
  Dumbbell,
  Baby,
  Users,
  BookOpen,
  Stethoscope,
  Shirt,
  Trophy,
  Coffee,
  Zap,
  Lightbulb,
  Puzzle,
  Activity,
  Sparkles,
  Headphones,
  Wrench,
  Clock,
  Star,
  Eye,
  ThumbsUp,
  User,
  ArrowRight
} from 'lucide-react';

interface SubCategory {
  id: string;
  title: string;
  description: string;
}

interface Category {
  id: string;
  icon: any;
  title: string;
  description: string;
  subCategories?: SubCategory[];
}

const categories: Category[] = [
  {
    id: 'architecture',
    icon: Building,
    title: '건축/BIM/CAD/GIS',
    description: '건축 건설 관련 솔루션',
    subCategories: [
      { id: 'design', title: '설계', description: '건축 설계 및 도면' },
      { id: 'student', title: '학생', description: '건축 학과 학생 대상 사이트' }
    ]
  }
];

interface LatestUpdate {
  id: string;
  urlId?: string;
  title: string;
  author: string;
  category: string;
  timeAgo: string;
  thumbnail?: string;
  views: number;
  likes: number;
}

interface PopularPage {
  id: string;
  urlId?: string;
  title: string;
  description: string;
  author: string;
  category: string;
  likes: number;
  views: number;
  thumbnail?: string;
  tags: string[];
}

interface HomePageProps {
  onCategorySelect: (categoryId: string, subCategory?: string) => void;
}

// 기본 샘플 데이터 (데이터가 없을 때 표시)
const defaultLatestUpdates: LatestUpdate[] = [
  {
    id: 'sample1',
    title: '샘플 페이지 1',
    author: '샘플 사용자',
    category: '일반',
    timeAgo: '방금 전',
    views: 5,
    likes: 2
  },
  {
    id: 'sample2', 
    title: '샘플 페이지 2',
    author: '샘플 사용자',
    category: '건축',
    timeAgo: '1시간 전',
    views: 12,
    likes: 5
  }
];

const defaultPopularPages: PopularPage[] = [
  {
    id: 'sample1',
    title: '인기 페이지 1',
    description: '이것은 샘플 설명입니다.',
    author: '샘플 사용자',
    category: '일반',
    likes: 15,
    views: 100,
    tags: ['샘플', '테스트']
  },
  {
    id: 'sample2',
    title: '인기 페이지 2', 
    description: '또 다른 샘플 설명입니다.',
    author: '샘플 사용자',
    category: '건축',
    likes: 8,
    views: 75,
    tags: ['건축', '설계']
  }
];

const latestUpdates: LatestUpdate[] = [];
const popularPages: PopularPage[] = [];

export function HomePageNew({ onCategorySelect }: HomePageProps) {
  const navigate = useNavigate();
  const [latestPages, setLatestPages] = useState<LatestUpdate[]>(latestUpdates);
  const [popularPagesList, setPopularPagesList] = useState<PopularPage[]>(popularPages);
  const [allPagesList, setAllPagesList] = useState<PopularPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Firebase Auth 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      console.log('HomePageNew Auth 상태:', user ? '로그인됨' : '로그아웃됨');
    });

    return () => unsubscribe();
  }, []);

  // 시간 경과 계산
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

  const fetchUserPages = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // 로그인하지 않은 상태에서는 샘플 데이터만 표시
      if (!isAuthenticated) {
        console.log('로그인하지 않은 상태 - 샘플 데이터 표시');
        setLatestPages(defaultLatestUpdates);
        setPopularPagesList(defaultPopularPages);
        setAllPagesList(defaultPopularPages);
        setLoading(false);
        return;
      }
      
      console.log('Firebase에서 페이지 데이터 가져오기 시작...');
      
      // 사용자 페이지 컬렉션에서 공개된 페이지들 가져오기
      const pagesRef = collection(db, 'userPages');
      
      // 먼저 모든 페이지를 가져와서 데이터 구조 확인
      console.log('전체 페이지 데이터 확인 중...');
      const debugSnapshot = await getDocs(query(pagesRef, limit(20)));
      console.log('전체 페이지 개수:', debugSnapshot.docs.length);
      
      if (!debugSnapshot.empty) {
        debugSnapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`페이지 ${index + 1}:`, {
            id: doc.id,
            title: data.title,
            isPublic: data.isPublic,
            isDeleted: data.isDeleted,
            authorName: data.authorName,
            authorEmail: data.authorEmail,
            updatedAt: data.updatedAt,
            createdAt: data.createdAt,
            views: data.views,
            likes: data.likes
          });
        });
      }
      
      // 최신 업데이트 가져오기 (공개 + 삭제되지 않은 페이지, 최신순 10개)
      const latestQuery = query(
        pagesRef,
        where('isPublic', '==', true),
        where('isDeleted', '==', false),
        orderBy('updatedAt', 'desc'),
        limit(10)
      );
      
      // 인기 페이지 가져오기 (공개 + 삭제되지 않은 페이지, 조회수 순 10개)
      const popularQuery = query(
        pagesRef,
        where('isPublic', '==', true),
        where('isDeleted', '==', false),
        orderBy('views', 'desc'),
        limit(10)
      );
      
      // 전체 페이지 가져오기 (공개 + 삭제되지 않은 페이지, 생성일 기준 10개)
      const allPagesQuery = query(
        pagesRef,
        where('isPublic', '==', true),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      let latestSnapshot, popularSnapshot, allPagesSnapshot;
      try {
        [latestSnapshot, popularSnapshot, allPagesSnapshot] = await Promise.all([
          getDocs(latestQuery),
          getDocs(popularQuery),
          getDocs(allPagesQuery)
        ]);
      } catch (e: any) {
        // 색인 미구성/빌드 중(failed-precondition)일 때 임시 폴백: 서버에서 넓게 가져와 클라이언트 필터링
        console.warn('색인 폴백 사용:', e?.message || e);
        const latestFallback = await getDocs(query(pagesRef, orderBy('updatedAt', 'desc'), limit(50)));
        const popularFallback = await getDocs(query(pagesRef, orderBy('views', 'desc'), limit(50)));
        const allFallback = await getDocs(query(pagesRef, orderBy('createdAt', 'desc'), limit(50)));
        latestSnapshot = latestFallback as any;
        popularSnapshot = popularFallback as any;
        allPagesSnapshot = allFallback as any;
      }

      // 데이터가 전혀 없는 경우 더 간단한 쿼리 시도
      if (latestSnapshot.empty && popularSnapshot.empty && allPagesSnapshot.empty) {
        console.log('필터링된 데이터가 없음. 모든 페이지 가져오기 시도...');
        const simpleQuery = await getDocs(query(pagesRef, limit(50)));
        latestSnapshot = simpleQuery;
        popularSnapshot = simpleQuery;
        allPagesSnapshot = simpleQuery;
      }

      console.log('최신 업데이트 개수:', latestSnapshot.docs.length);
      console.log('인기 페이지 개수:', popularSnapshot.docs.length);
      console.log('전체 페이지 개수:', allPagesSnapshot.docs.length);

      // 최신 업데이트 데이터 변환
      if (!latestSnapshot.empty) {
        const latest = latestSnapshot.docs
          .map((doc) => {
          const data = doc.data();
          console.log('최신 업데이트 문서:', doc.id, data);
          const updatedAt = (data.updatedAt && typeof (data.updatedAt as any).toDate === 'function')
            ? (data.updatedAt as any).toDate()
            : (typeof data.updatedAt === 'string' || typeof data.updatedAt === 'number')
              ? new Date(data.updatedAt)
              : undefined;
          return {
            id: doc.id,
            urlId: data.urlId || doc.id, // URL ID 추가
            title: data.title || '제목 없음',
            author: data.authorName || '익명',
            category: data.category || '일반',
            timeAgo: getTimeAgo(updatedAt),
            views: data.views || 0,
            likes: data.likes || 0,
            authorEmail: data.authorEmail || data.authorId // 이메일 정보 추가
          };
        })
          .filter((p) => {
            // 로컬 테스트 페이지 필터링
            const email = p.authorEmail;
            if (!email) return true; // 이메일이 없으면 포함
            
            // 로컬 테스트 이메일들 제외
            const isLocalTest = email.includes('localhost') || 
                               email.includes('127.0.0.1') || 
                               email.includes('test@') ||
                               email.includes('okjsk1@gmail.com') ||
                               email.includes('okjsk2@gmail.com');
            
            return !isLocalTest;
          })
          .filter((p) => (p as any) && (latestSnapshot as any) ? true : true);
        // 폴백일 경우 공개/삭제 필터 적용
        const latestFiltered = latestSnapshot.query === latestQuery ? latest : latest.filter((_, idx) => {
          const d = latestSnapshot.docs[idx].data();
          return d.isPublic === true && d.isDeleted === false;
        });
        setLatestPages(latestFiltered as any);
        console.log('최신 업데이트 설정 완료:', latest);
      } else {
        // 데이터가 없으면 기본 샘플 데이터 사용
        console.log('최신 업데이트 데이터가 없음. 샘플 데이터 사용');
        setLatestPages(defaultLatestUpdates);
      }

      // 인기 페이지 데이터 변환
      if (!popularSnapshot.empty) {
        const popular = popularSnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('인기 페이지 문서:', doc.id, data);
          return {
            id: doc.id,
            urlId: data.urlId || doc.id,
            title: data.title || '제목 없음',
            description: data.description || '설명 없음',
            author: data.authorName || '익명',
            category: data.category || '일반',
            likes: data.likes || 0,
            views: data.views || 0,
            tags: data.tags || [],
            authorEmail: data.authorEmail || data.authorId
          };
        })
        .filter((p) => {
          // 로컬 테스트 페이지 필터링
          const email = p.authorEmail;
          if (!email) return true;
          
          const isLocalTest = email.includes('localhost') || 
                             email.includes('127.0.0.1') || 
                             email.includes('test@') ||
                             email.includes('okjsk1@gmail.com') ||
                             email.includes('okjsk2@gmail.com');
          
          return !isLocalTest;
        });
        const popularFiltered = popularSnapshot.query === popularQuery ? popular : popular.filter((_, idx) => {
          const d = popularSnapshot.docs[idx].data();
          return d.isPublic === true && d.isDeleted === false;
        });
        setPopularPagesList(popularFiltered as any);
        console.log('인기 페이지 설정 완료:', popular);
      } else {
        // 데이터가 없으면 기본 샘플 데이터 사용
        console.log('인기 페이지 데이터가 없음. 샘플 데이터 사용');
        setPopularPagesList(defaultPopularPages);
      }
      
      // 전체 페이지 데이터 변환
      if (!allPagesSnapshot.empty) {
        const allPages = allPagesSnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('전체 페이지 문서:', doc.id, data);
          return {
            id: doc.id,
            urlId: data.urlId || doc.id,
            title: data.title || '제목 없음',
            description: data.description || '설명 없음',
            author: data.authorName || '익명',
            category: data.category || '일반',
            likes: data.likes || 0,
            views: data.views || 0,
            tags: data.tags || [],
            authorEmail: data.authorEmail || data.authorId
          };
        })
        .filter((p) => {
          // 로컬 테스트 페이지 필터링
          const email = p.authorEmail;
          if (!email) return true;
          
          const isLocalTest = email.includes('localhost') || 
                             email.includes('127.0.0.1') || 
                             email.includes('test@') ||
                             email.includes('okjsk1@gmail.com') ||
                             email.includes('okjsk2@gmail.com');
          
          return !isLocalTest;
        });
        const allFiltered = allPagesSnapshot.query === allPagesQuery ? allPages : allPages.filter((_, idx) => {
          const d = allPagesSnapshot.docs[idx].data();
          return d.isPublic === true && d.isDeleted === false;
        });
        setAllPagesList(allFiltered as any);
        console.log('전체 페이지 설정 완료:', allPages);
      } else {
        // 데이터가 없으면 기본 샘플 데이터 사용
        console.log('전체 페이지 데이터가 없음. 샘플 데이터 사용');
        setAllPagesList(defaultPopularPages);
      }
    } catch (error) {
      console.error('페이지 데이터 가져오기 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
      
      // 오류 발생 시에도 기본 샘플 데이터 표시
      setLatestPages(defaultLatestUpdates);
      setPopularPagesList(defaultPopularPages);
      setAllPagesList(defaultPopularPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPages();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 상단 히어로 섹션 */}
      <div className="relative bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white py-32">
            나만의{' '}
            <span className="text-blue-600 dark:text-blue-400">시작페이지</span>를{' '}
            <span className="text-purple-600 dark:text-purple-400">만들어보세요</span>
          </h1>
        </div>
      </div>

      {/* 최신 업데이트 & 전체 페이지 & 인기 시작페이지 섹션 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 최신 업데이트 목록 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                최신 업데이트
              </h2>
              <button 
                onClick={() => navigate('/pages?type=latest')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium flex items-center"
              >
                더보기 <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
            
            <div className="space-y-1.5">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">로딩 중...</p>
                </div>
              ) : latestPages.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500">아직 등록된 페이지가 없습니다.</p>
                  <p className="text-xs text-gray-400 mt-1">첫 번째 페이지를 만들어보세요!</p>
                </div>
              ) : (
                latestPages.map((update) => (
                  <div 
                    key={update.id} 
                    className="border border-gray-100 dark:border-gray-600 rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => update.urlId && navigate(`/${update.urlId}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-xs text-gray-900 dark:text-white mb-0.5">{update.title}</h3>
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mb-0.5">
                          <User className="w-2.5 h-2.5 mr-0.5" />
                          <span className="text-xs">{update.author}</span>
                          <span className="mx-1">•</span>
                          <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full text-xs">
                            {update.category}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-300">
                          <Clock className="w-2.5 h-2.5 mr-0.5" />
                          {update.timeAgo}
                          <span className="mx-1">•</span>
                          <Eye className="w-2.5 h-2.5 mr-0.5" />
                          {update.views.toLocaleString()}회
                          <span className="mx-1">•</span>
                          <ThumbsUp className="w-2.5 h-2.5 mr-0.5" />
                          {update.likes}개
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 전체 페이지 목록 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                전체 페이지
              </h2>
              <button 
                onClick={() => navigate('/pages?type=all')}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center"
              >
                더보기 <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
            
            <div className="space-y-1.5">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">로딩 중...</p>
                </div>
              ) : allPagesList.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500">아직 등록된 페이지가 없습니다.</p>
                  <p className="text-xs text-gray-400 mt-1">첫 번째 페이지를 만들어보세요!</p>
                </div>
              ) : (
                allPagesList.map((page) => (
                <div 
                  key={page.id} 
                  className="border border-gray-100 dark:border-gray-600 rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => page.urlId && navigate(`/${page.urlId}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xs text-gray-900 dark:text-white mb-0.5">{page.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-0.5 line-clamp-1">{page.description}</p>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mb-0.5">
                        <User className="w-2.5 h-2.5 mr-0.5" />
                        <span className="text-xs">{page.author}</span>
                        <span className="mx-1">•</span>
                        <span className="px-1 py-0.5 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full text-xs">
                          {page.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <ThumbsUp className="w-2.5 h-2.5 mr-0.5" />
                          {page.likes.toLocaleString()}개
                          <span className="mx-1">•</span>
                          <Eye className="w-2.5 h-2.5 mr-0.5" />
                          {page.views.toLocaleString()}회
                        </div>
                        <div className="flex flex-wrap gap-0.5">
                          {page.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-1 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-200 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* 인기 시작페이지 목록 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                인기 시작페이지
              </h2>
              <button 
                onClick={() => navigate('/pages?type=popular')}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center"
              >
                더보기 <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
            
            <div className="space-y-1.5">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">로딩 중...</p>
                </div>
              ) : popularPagesList.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500">아직 등록된 페이지가 없습니다.</p>
                  <p className="text-xs text-gray-400 mt-1">첫 번째 페이지를 만들어보세요!</p>
                </div>
              ) : (
                popularPagesList.map((page) => (
                <div 
                  key={page.id} 
                  className="border border-gray-100 dark:border-gray-600 rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => page.urlId && navigate(`/${page.urlId}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xs text-gray-900 dark:text-white mb-0.5">{page.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-0.5 line-clamp-1">{page.description}</p>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mb-0.5">
                        <User className="w-2.5 h-2.5 mr-0.5" />
                        <span className="text-xs">{page.author}</span>
                        <span className="mx-1">•</span>
                        <span className="px-1 py-0.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded-full text-xs">
                          {page.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <ThumbsUp className="w-2.5 h-2.5 mr-0.5" />
                          {page.likes.toLocaleString()}개
                          <span className="mx-1">•</span>
                          <Eye className="w-2.5 h-2.5 mr-0.5" />
                          {page.views.toLocaleString()}회
                        </div>
                        <div className="flex flex-wrap gap-0.5">
                          {page.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-1 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-200 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}