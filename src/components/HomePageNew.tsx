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

  // 시간 경과 계산 - 완전히 새로운 안전한 처리 (v2.0)
  const getTimeAgo = (dateInput: any): string => {
    // null이나 undefined 체크
    if (!dateInput) {
      return '알 수 없음';
    }
    
    try {
      let timestamp: number;
      
      // Firebase Timestamp 객체 (toDate 메서드가 있는 경우)
      if (dateInput && typeof dateInput.toDate === 'function') {
        timestamp = dateInput.toDate().getTime();
      }
      // Date 객체인 경우
      else if (dateInput instanceof Date) {
        timestamp = dateInput.getTime();
      }
      // 숫자 타임스탬프인 경우
      else if (typeof dateInput === 'number') {
        timestamp = dateInput;
      }
      // seconds 속성이 있는 객체 (Firebase Timestamp)
      else if (dateInput && typeof dateInput.seconds === 'number') {
        timestamp = dateInput.seconds * 1000;
      }
      // _seconds 속성이 있는 객체
      else if (dateInput && typeof dateInput._seconds === 'number') {
        timestamp = dateInput._seconds * 1000;
      }
      // 문자열인 경우
      else if (typeof dateInput === 'string') {
        const parsed = new Date(dateInput);
        if (isNaN(parsed.getTime())) {
          return '알 수 없음';
        }
        timestamp = parsed.getTime();
      }
      // 기타 경우
      else {
        console.warn('알 수 없는 날짜 형태:', dateInput);
        return '알 수 없음';
      }
      
      // 유효한 타임스탬프인지 확인
      if (isNaN(timestamp) || timestamp <= 0) {
        return '알 수 없음';
      }
      
      const now = Date.now();
      const diff = now - timestamp;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days}일 전`;
      if (hours > 0) return `${hours}시간 전`;
      return '방금 전';
      
    } catch (error) {
      console.error('날짜 처리 오류:', error, '입력 데이터:', dateInput);
      return '알 수 없음';
    }
  };

  const fetchUserPages = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // 로그인 상태와 관계없이 실제 데이터 가져오기
      console.log('Firebase 데이터 가져오기 시작...');
      console.log('현재 사용자:', auth.currentUser?.email);
      console.log('인증 상태:', !!auth.currentUser);
      
      console.log('Firebase에서 페이지 데이터 가져오기 시작...');
      
      // 사용자 페이지 컬렉션에서 공개된 페이지들 가져오기
      const pagesRef = collection(db, 'userPages');
      
      // 간단한 쿼리로 시작 - 복합 쿼리 대신 기본 쿼리 사용
      const simpleQuery = query(
        pagesRef,
        where('isPublic', '==', true),
        limit(20)
      );

      // 간단한 쿼리로 데이터 가져오기
      console.log('간단한 쿼리 실행 중...');
      const snapshot = await getDocs(simpleQuery);
      console.log('쿼리 결과:', snapshot.docs.length, '개 문서');

      // 데이터 처리
      const allPages = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('페이지 데이터:', doc.id, data);
        
        // 날짜 처리 개선 - 더 안전한 처리
        let timeAgo = '알 수 없음';
        try {
          timeAgo = getTimeAgo(data.updatedAt || data.createdAt);
        } catch (dateError) {
          console.warn('날짜 처리 오류:', dateError, '데이터:', data.updatedAt || data.createdAt);
          timeAgo = '알 수 없음';
        }
        
        return {
          id: doc.id,
          urlId: data.urlId || doc.id,
          title: data.title || '제목 없음',
          description: data.description || '설명 없음',
          authorName: data.authorName || '익명',
          authorEmail: data.authorEmail || '',
          category: data.category || '일반',
          isPublic: data.isPublic || false,
          isDeleted: data.isDeleted || false,
          views: data.views || 0,
          likes: data.likes || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          timeAgo: timeAgo
        };
      }).filter(page => page.isPublic && !page.isDeleted);

      console.log('처리된 페이지 개수:', allPages.length);

      // 최신 업데이트 데이터 설정
      const latestPages = allPages
        .sort((a, b) => {
          // 시간순 정렬 (최신순)
          const timeA = a.timeAgo.includes('방금') ? 0 : 
                       a.timeAgo.includes('분') ? 1 :
                       a.timeAgo.includes('시간') ? 2 : 3;
          const timeB = b.timeAgo.includes('방금') ? 0 : 
                       b.timeAgo.includes('분') ? 1 :
                       b.timeAgo.includes('시간') ? 2 : 3;
          return timeA - timeB;
        })
        .slice(0, 10);

      setLatestPages(latestPages as any);
      console.log('최신 업데이트 설정 완료:', latestPages.length, '개');

      // 인기 페이지 데이터 설정
      const popularPages = allPages
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 10);

      setPopularPagesList(popularPages as any);
      console.log('인기 페이지 설정 완료:', popularPages.length, '개');

      // 전체 페이지 데이터 설정
      setAllPagesList(allPages as any);
      console.log('전체 페이지 설정 완료:', allPages.length, '개');


    } catch (error) {
      console.error('페이지 데이터 가져오기 실패:', error);
      console.error('오류 상세:', {
        errorType: error.constructor.name,
        errorMessage: error.message,
        errorCode: error.code,
        userEmail: auth.currentUser?.email,
        isAuthenticated: !!auth.currentUser
      });
      setError('데이터를 불러오는데 실패했습니다.');
      
      // 오류 발생 시 빈 배열 표시
      setLatestPages([]);
      setPopularPagesList([]);
      setAllPagesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPages();
  }, []); // 로그인 상태와 관계없이 페이지 로드 시 데이터 가져오기

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
                          {(page.tags || []).slice(0, 2).map((tag) => (
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
                          {(page.tags || []).slice(0, 2).map((tag) => (
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