import React from 'react';
import { CategoryHoverCard } from './CategoryHoverCard';
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
  }
];

export function HomePageNew({ onCategorySelect }: HomePageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* 상단 히어로 섹션 */}
      <div className="relative bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          {/* 작은 장식용 아이콘들 */}
          <div className="flex justify-center mb-8 space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💻</span>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            나만의{' '}
            <span className="text-blue-600">시작페이지</span>를{' '}
            <span className="text-purple-600">만들어보세요</span>
            <br />
            <span className="text-green-600">창의적이고 개성있는</span> 디지털 공간을 시작하세요
          </h1>
          
          {/* 검색창 */}
          <div className="flex justify-center mt-8 mb-32">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center justify-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-60 pl-10 pr-3 py-3 text-sm text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="건축, 웹개발, 디자이너와 같은 리소스 검색"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 최신 업데이트 & 인기 시작페이지 섹션 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 최신 업데이트 목록 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-blue-600" />
                최신 업데이트
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                더보기 <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="space-y-4">
              {latestUpdates.map((update) => (
                <div key={update.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{update.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="w-4 h-4 mr-1" />
                        {update.author} • 
                        <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {update.category}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {update.timeAgo}
                        <span className="mx-2">•</span>
                        <Eye className="w-3 h-3 mr-1" />
                        {update.views.toLocaleString()}회
                        <span className="mx-2">•</span>
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {update.likes}개
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 인기 시작페이지 목록 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-500" />
                인기 시작페이지
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                더보기 <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="space-y-4">
              {popularPages.map((page) => (
                <div key={page.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{page.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{page.description}</p>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="w-4 h-4 mr-1" />
                        {page.author} • 
                        <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                          {page.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          {page.likes.toLocaleString()}개
                          <span className="mx-2">•</span>
                          <Eye className="w-3 h-3 mr-1" />
                          {page.views.toLocaleString()}회
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {page.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
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
      
      {/* 카테고리 섹션 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
          {categories.map((category) => (
            <CategoryHoverCard
              key={category.id}
              icon={category.icon}
              title={category.title}
              description={category.description}
              subCategories={category.subCategories}
              onClick={(subCategoryId) => onCategorySelect(category.id, subCategoryId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}