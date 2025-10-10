import React, { useState, useEffect } from 'react';
import { CategoryHoverCard } from './CategoryHoverCard';
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

const latestUpdates: LatestUpdate[] = [
  {
    id: '1',
    title: '개발자를 위한 올인원 대시보드',
    author: '김개발',
    category: '개발/기획',
    timeAgo: '2시간 전',
    views: 1240,
    likes: 89
  },
  {
    id: '2',
    title: '디자이너의 작업 공간',
    author: '박디자인',
    category: 'UI/UX 디자인',
    timeAgo: '4시간 전',
    views: 890,
    likes: 67
  },
  {
    id: '3',
    title: '투자 포트폴리오 관리',
    author: '이투자',
    category: '금융/투자',
    timeAgo: '6시간 전',
    views: 2100,
    likes: 156
  },
  {
    id: '4',
    title: '유튜버 스케줄 관리',
    author: '최유튜버',
    category: '콘텐츠 크리에이터',
    timeAgo: '8시간 전',
    views: 756,
    likes: 45
  },
  {
    id: '5',
    title: '건축학생 과제 관리',
    author: '정건축',
    category: '건축/BIM/CAD/GIS',
    timeAgo: '12시간 전',
    views: 432,
    likes: 28
  },
  {
    id: '6',
    title: '마케터 데이터 분석 도구',
    author: '이마케팅',
    category: '마케팅',
    timeAgo: '14시간 전',
    views: 620,
    likes: 42
  },
  {
    id: '7',
    title: '학생 일정 관리',
    author: '김학생',
    category: '교육',
    timeAgo: '16시간 전',
    views: 380,
    likes: 25
  },
  {
    id: '8',
    title: '쇼핑몰 운영자 통합 대시보드',
    author: '박커머스',
    category: '커머스',
    timeAgo: '18시간 전',
    views: 950,
    likes: 71
  },
  {
    id: '9',
    title: '헬스 트레이너 회원 관리',
    author: '최트레이너',
    category: '헬스/피트니스',
    timeAgo: '20시간 전',
    views: 540,
    likes: 38
  },
  {
    id: '10',
    title: '블로거 콘텐츠 플래너',
    author: '정블로거',
    category: '콘텐츠 크리에이터',
    timeAgo: '22시간 전',
    views: 720,
    likes: 55
  }
];

const popularPages: PopularPage[] = [
  {
    id: '1',
    title: '프리랜서 개발자 생산성 도구',
    description: '프로젝트 관리부터 시간 추적까지 모든 것을 한 곳에서',
    author: '김프리',
    category: '개발/기획',
    likes: 1250,
    views: 8900,
    tags: ['프로젝트관리', '시간추적', '프리랜서']
  },
  {
    id: '2',
    title: '주식 투자 정보 대시보드',
    description: '실시간 주가, 뉴스, 분석 리포트를 한눈에',
    author: '이투자왕',
    category: '금융/투자',
    likes: 2100,
    views: 15600,
    tags: ['주식', '투자', '분석']
  },
  {
    id: '3',
    title: '디자이너 영감 수집소',
    description: '아이디어부터 완성까지 디자인 워크플로우',
    author: '박크리에이터',
    category: 'UI/UX 디자인',
    likes: 980,
    views: 7200,
    tags: ['디자인', '영감', '워크플로우']
  },
  {
    id: '4',
    title: '콘텐츠 크리에이터 스튜디오',
    description: '영상 제작부터 업로드까지 모든 과정 관리',
    author: '최유튜브',
    category: '콘텐츠 크리에이터',
    likes: 1650,
    views: 12300,
    tags: ['유튜브', '콘텐츠', '편집']
  },
  {
    id: '5',
    title: '건축사 사무소 관리 시스템',
    description: '프로젝트부터 고객 관리까지 건축사업 통합 솔루션',
    author: '정건축사',
    category: '건축/BIM/CAD/GIS',
    likes: 720,
    views: 5400,
    tags: ['건축', '프로젝트관리', 'CAD']
  },
  {
    id: '6',
    title: 'SNS 마케팅 자동화 도구',
    description: '여러 채널을 한 곳에서 관리하고 예약 발행',
    author: '김소셜',
    category: '마케팅',
    likes: 890,
    views: 6700,
    tags: ['SNS', '마케팅', '자동화']
  },
  {
    id: '7',
    title: '온라인 강의 제작 워크스페이스',
    description: '강의 기획부터 촬영, 편집까지 모든 과정',
    author: '이강사',
    category: '교육',
    likes: 650,
    views: 4800,
    tags: ['강의', '교육', '온라인']
  },
  {
    id: '8',
    title: '스타트업 재무 관리 시스템',
    description: '매출, 비용, 투자 관리를 한눈에',
    author: '박스타트업',
    category: '재무/회계',
    likes: 1100,
    views: 8200,
    tags: ['재무', '회계', '스타트업']
  },
  {
    id: '9',
    title: '부동산 매물 관리 대시보드',
    description: '매물 정보부터 고객 관리까지 통합 솔루션',
    author: '최부동산',
    category: '부동산',
    likes: 780,
    views: 5900,
    tags: ['부동산', '매물', '관리']
  },
  {
    id: '10',
    title: '작가 집필 관리 스튜디오',
    description: '아이디어 정리부터 원고 관리까지',
    author: '정작가',
    category: '글쓰기',
    likes: 520,
    views: 3600,
    tags: ['집필', '작가', '글쓰기']
  }
];

export function HomePageNew({ onCategorySelect }: HomePageProps) {
  const [latestPages, setLatestPages] = useState<LatestUpdate[]>(latestUpdates);
  const [popularPagesList, setPopularPagesList] = useState<PopularPage[]>(popularPages);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPages();
  }, []);

  const fetchUserPages = async () => {
    try {
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

      const [latestSnapshot, popularSnapshot] = await Promise.all([
        getDocs(latestQuery),
        getDocs(popularQuery)
      ]);

      // 최신 업데이트 데이터 변환
      if (!latestSnapshot.empty) {
        const latest = latestSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '제목 없음',
            author: data.authorName || '익명',
            category: data.category || '일반',
            timeAgo: getTimeAgo(data.updatedAt?.toDate()),
            views: data.views || 0,
            likes: data.likes || 0
          };
        });
        setLatestPages(latest);
      }

      // 인기 페이지 데이터 변환
      if (!popularSnapshot.empty) {
        const popular = popularSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
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
      }
    } catch (error) {
      console.error('페이지 데이터 가져오기 실패:', error);
      // 에러 발생 시 기본 데이터 사용
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 히어로 섹션 */}
      <div className="relative bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 py-32">
            나만의{' '}
            <span className="text-blue-600">시작페이지</span>를{' '}
            <span className="text-purple-600">만들어보세요</span>
          </h1>
        </div>
      </div>

      {/* 최신 업데이트 & 인기 시작페이지 섹션 */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-6">
          {/* 최신 업데이트 목록 */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                최신 업데이트
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center">
                더보기 <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
            
            <div className="space-y-1.5">
              {latestPages.map((update) => (
                <div key={update.id} className="border border-gray-100 rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xs text-gray-900 mb-0.5">{update.title}</h3>
                      <div className="flex items-center text-xs text-gray-600 mb-0.5">
                        <User className="w-2.5 h-2.5 mr-0.5" />
                        <span className="text-xs">{update.author}</span>
                        <span className="mx-1">•</span>
                        <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {update.category}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
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

          {/* 인기 시작페이지 목록 */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                인기 시작페이지
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center">
                더보기 <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
            
            <div className="space-y-1.5">
              {popularPagesList.map((page) => (
                <div key={page.id} className="border border-gray-100 rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xs text-gray-900 mb-0.5">{page.title}</h3>
                      <p className="text-xs text-gray-600 mb-0.5 line-clamp-1">{page.description}</p>
                      <div className="flex items-center text-xs text-gray-600 mb-0.5">
                        <User className="w-2.5 h-2.5 mr-0.5" />
                        <span className="text-xs">{page.author}</span>
                        <span className="mx-1">•</span>
                        <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                          {page.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <ThumbsUp className="w-2.5 h-2.5 mr-0.5" />
                          {page.likes.toLocaleString()}개
                          <span className="mx-1">•</span>
                          <Eye className="w-2.5 h-2.5 mr-0.5" />
                          {page.views.toLocaleString()}회
                        </div>
                        <div className="flex flex-wrap gap-0.5">
                          {page.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
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
    </div>
  );
}