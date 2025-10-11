import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryHoverCard } from './CategoryHoverCard';
import { Footer } from './Footer';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
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
  Calculator,
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
  Music,
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

const latestUpdates: LatestUpdate[] = [];

const popularPages: PopularPage[] = [];

export function HomePageNew({ onCategorySelect }: HomePageProps) {
  const navigate = useNavigate();
  const [latestPages, setLatestPages] = useState<LatestUpdate[]>(latestUpdates);
  const [popularPagesList, setPopularPagesList] = useState<PopularPage[]>(popularPages);
  const [allPagesList, setAllPagesList] = useState<PopularPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      
      console.log('Firebase에서 페이지 데이터 가져오기 시작...');
      
      // 사용자 페이지 컬렉션에서 공개된 페이지들 가져오기
      const pagesRef = collection(db, 'userPages');
      
      // 최신 업데이트 가져오기 (공개된 페이지, 최신순으로 10개)
      const latestQuery = query(
        pagesRef,
        where('isPublic', '==', true),
        orderBy('updatedAt', 'desc'),
        limit(10)
      );
      
      // 인기 페이지 가져오기 (공개된 페이지, 조회수 순으로 10개)
      const popularQuery = query(
        pagesRef,
        where('isPublic', '==', true),
        orderBy('views', 'desc'),
        limit(10)
      );
      
      // 전체 페이지 가져오기 (공개된 페이지, 생성일 기준 10개)
      const allPagesQuery = query(
        pagesRef,
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const [latestSnapshot, popularSnapshot, allPagesSnapshot] = await Promise.all([
        getDocs(latestQuery),
        getDocs(popularQuery),
        getDocs(allPagesQuery)
      ]);

      console.log('최신 업데이트 개수:', latestSnapshot.docs.length);
      console.log('인기 페이지 개수:', popularSnapshot.docs.length);
      console.log('전체 페이지 개수:', allPagesSnapshot.docs.length);

      // 최신 업데이트 데이터 변환
      if (!latestSnapshot.empty) {
        const latest = latestSnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('최신 업데이트 문서:', doc.id, data);
          return {
            id: doc.id,
            urlId: data.urlId || doc.id, // URL ID 추가
            title: data.title || '제목 없음',
            author: data.authorName || '익명',
            category: data.category || '일반',
            timeAgo: getTimeAgo(data.updatedAt?.toDate()),
            views: data.views || 0,
            likes: data.likes || 0
          };
        });
        setLatestPages(latest);
        console.log('최신 업데이트 설정 완료:', latest);
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
            tags: data.tags || []
          };
        });
        setPopularPagesList(popular);
        console.log('인기 페이지 설정 완료:', popular);
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
            tags: data.tags || []
          };
        });
        setAllPagesList(allPages);
        console.log('전체 페이지 설정 완료:', allPages);
      }
    } catch (error) {
      console.error('페이지 데이터 가져오기 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPages();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 상단 히어로 섹션 */}
      <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center py-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            나만의{' '}
            <span className="text-blue-600 dark:text-blue-400">시작페이지</span>를{' '}
            <span className="text-purple-600 dark:text-purple-400">만들어보세요</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            원하는 위젯으로 나만의 맞춤형 시작페이지를 만들어보세요. 
            간단하고 직관적인 인터페이스로 누구나 쉽게 만들 수 있습니다.
          </p>
          <button
            onClick={() => navigate('/mypage')}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Sparkles className="w-6 h-6 mr-3" />
            페이지 만들기
            <ArrowRight className="w-5 h-5 ml-3" />
          </button>
          <div className="mt-6 flex justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              간편한 드래그앤드롭
            </div>
            <div className="flex items-center">
              <Puzzle className="w-4 h-4 mr-2 text-blue-500" />
              다양한 위젯
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 text-purple-500" />
              무료 사용
            </div>
          </div>
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
              {latestPages.map((update) => (
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
              ))}
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
              {allPagesList.map((page) => (
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
              ))}
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
              {popularPagesList.map((page) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 푸터 */}
      <Footer />
    </div>
  );
}