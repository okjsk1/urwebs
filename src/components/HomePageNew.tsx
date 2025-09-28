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
  Zap
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
      { id: 'interior', title: '인테리어', description: '인테리어 디자인 및 시공' },
      { id: 'design', title: '설계', description: '건축 설계 및 도면' },
      { id: 'bim', title: 'BIM', description: 'BIM 모델링 및 관리' },
      { id: 'student', title: '학생', description: '건축 학과 학생 대상 사이트' }
    ]
  },
  {
    id: 'finance',
    icon: DollarSign,
    title: '금융/투자',
    description: '주식, 코인 등 투자',
    subCategories: [
      { id: 'stock', title: '주식', description: '주식 투자 및 분석' },
      { id: 'crypto', title: '코인', description: '암호화폐 거래 및 정보' }
    ]
  },
  {
    id: 'development',
    icon: Code,
    title: '개발/기획',
    description: '개발 기획 및 관리'
  },
  {
    id: 'ui-ux',
    icon: Palette,
    title: 'UI/UX 디자인',
    description: '디자인 및 사용자 경험'
  },
  {
    id: 'content-creator',
    icon: Video,
    title: '콘텐츠 크리에이터',
    description: '영상 및 콘텐츠 제작',
    subCategories: [
      { id: 'youtuber', title: '유튜버', description: '유튜브 콘텐츠 제작' },
      { id: 'streamer', title: '스트리머', description: '라이브 방송 및 스트리밍' }
    ]
  },
  {
    id: 'wedding',
    icon: Heart,
    title: '결혼/웨딩',
    description: '결혼 준비 및 웨딩'
  },
  {
    id: 'real-estate',
    icon: Home,
    title: '부동산',
    description: '부동산 관련 정보',
    subCategories: [
      { id: 'landlord', title: '임대인', description: '임대 관리 및 운영' },
      { id: 'tenant', title: '임차인', description: '임대 물건 찾기 및 관리' },
      { id: 'agent', title: '공인중개사', description: '중개업무 및 자격관리' }
    ]
  },
  {
    id: 'insurance',
    icon: Shield,
    title: '보험',
    description: '보험 상품 및 관리'
  },
  {
    id: 'education',
    icon: GraduationCap,
    title: '교육',
    description: '교육 및 학습'
  },
  {
    id: 'travel',
    icon: Plane,
    title: '여행',
    description: '여행 계획 및 예약'
  },
  {
    id: 'gaming',
    icon: Gamepad2,
    title: '게임',
    description: '게임 정보 및 커뮤니티'
  },
  {
    id: 'cooking',
    icon: Utensils,
    title: '요리/레시피',
    description: '요리 레시피 및 맛집 정보'
  },
  {
    id: 'accounting',
    icon: Calculator,
    title: '회계/세무',
    description: '회계 및 세무 관리'
  },
  {
    id: 'marketing',
    icon: Megaphone,
    title: '마케팅',
    description: '디지털 마케팅 및 광고'
  },
  {
    id: 'photography',
    icon: Camera,
    title: '사진/영상',
    description: '사진 및 영상 편집'
  },
  {
    id: 'music',
    icon: Music,
    title: '음악',
    description: '음악 제작 및 스트리밍'
  },
  {
    id: 'fitness',
    icon: Dumbbell,
    title: '운동/건강',
    description: '운동 및 건강 관리'
  },
  {
    id: 'parenting',
    icon: Baby,
    title: '육아',
    description: '육아 정보 및 용품'
  },
  {
    id: 'healthcare',
    icon: Stethoscope,
    title: '의료/건강',
    description: '의료 정보 및 건강 관리'
  },
  // 새로운 취미/전문 분야들
  {
    id: 'fashion',
    icon: Shirt,
    title: '패션/뷰티',
    description: '패션 트렌드 및 뷰티 정보'
  },
  {
    id: 'drone',
    icon: Zap,
    title: '드론/항공',
    description: '드론 및 항공 촬영'
  },
  {
    id: 'sports',
    icon: Trophy,
    title: '스포츠',
    description: '축구, 농구, 야구 등 스포츠'
  },
  {
    id: 'auto',
    icon: Car,
    title: '자동차',
    description: '자동차 정보 및 관리'
  },
  {
    id: 'pets',
    icon: Heart,
    title: '펫/반려동물',
    description: '반려동물 정보 및 관리'
  },
  {
    id: 'hobby',
    icon: Coffee,
    title: '취미/여가',
    description: '다양한 취미 활동'
  }
];

interface HomePageProps {
  onCategorySelect: (categoryId: string, subCategory?: string) => void;
}

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
            커뮤니티에서 만든{' '}
            <span className="text-blue-600">라이브러리</span>,{' '}
            <span className="text-purple-600">플러그인</span>,{' '}
            <br />
            <span className="text-blue-600">아이콘 세트</span> 등을 살펴보세요.
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

      {/* 여백 추가 */}
      <div className="h-5"></div>
      
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