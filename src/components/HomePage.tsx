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
  Stethoscope
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
      { id: 'student', title: '학생', description: '건축 학과 학생 대상 사이트' },
      { id: 'professional', title: '직장인', description: '실무 건축가 및 설계사 대상' }
    ]
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
    id: 'development',
    icon: Code,
    title: '개발/기획',
    description: '개발 기획 및 관리',
    subCategories: [
      { id: 'frontend', title: '프론트엔드', description: 'UI/UX 및 웹 개발' },
      { id: 'backend', title: '백엔드', description: '서버 및 데이터베이스' },
      { id: 'mobile', title: '모바일', description: '앱 개발 및 배포' },
      { id: 'devops', title: 'DevOps', description: '배포 및 인프라 관리' }
    ]
  },
  {
    id: 'content-creator',
    icon: Video,
    title: '콘텐츠 크리에이터',
    description: '영상 및 콘텐츠 제작',
    subCategories: [
      { id: 'youtuber', title: '유튜버', description: '유튜브 콘텐츠 제작' },
      { id: 'streamer', title: '스트리머', description: '라이브 방송 및 스트리밍' },
      { id: 'blogger', title: '블로거', description: '블로그 및 글쓰기' },
      { id: 'influencer', title: '인플루언서', description: 'SNS 마케팅 및 브랜딩' }
    ]
  },
  {
    id: 'finance',
    icon: DollarSign,
    title: '금융/투자',
    description: '금융 및 투자 관련',
    subCategories: [
      { id: 'stock', title: '주식', description: '주식 투자 및 분석' },
      { id: 'crypto', title: '코인', description: '암호화폐 거래 및 정보' },
      { id: 'real-estate-invest', title: '부동산 투자', description: '부동산 투자 및 분석' },
      { id: 'fund', title: '펀드', description: '펀드 및 연금 관리' }
    ]
  },
  {
    id: 'wedding',
    icon: Heart,
    title: '결혼/웨딩',
    description: '결혼 준비 및 웨딩'
  },
  {
    id: 'insurance',
    icon: Shield,
    title: '보험',
    description: '보험 상품 및 관리',
    subCategories: [
      { id: 'life', title: '생명보험', description: '생명보험 상품 및 비교' },
      { id: 'health', title: '건강보험', description: '건강보험 및 의료보험' },
      { id: 'car', title: '자동차보험', description: '자동차보험 비교 및 가입' },
      { id: 'property', title: '재산보험', description: '화재보험 및 재산보험' }
    ]
  },
  {
    id: 'education',
    icon: GraduationCap,
    title: '교육',
    description: '교육 및 학습',
    subCategories: [
      { id: 'k12', title: '초중고', description: '초중고 교육 정보' },
      { id: 'university', title: '대학교', description: '대학 정보 및 입시' },
      { id: 'online', title: '온라인 강의', description: '온라인 교육 플랫폼' },
      { id: 'certification', title: '자격증', description: '자격증 준비 및 시험' }
    ]
  },
  {
    id: 'ui-ux',
    icon: Palette,
    title: 'UI/UX 디자인',
    description: '디자인 및 사용자 경험'
  },
  {
    id: 'data-ai',
    icon: Database,
    title: '데이터/AI',
    description: '데이터 분석과 인공지능'
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
    id: 'travel',
    icon: Plane,
    title: '여행',
    description: '여행 계획 및 예약'
  },
  {
    id: 'food',
    icon: Utensils,
    title: '요리/맛집',
    description: '요리 레시피 및 맛집 정보'
  },
  {
    id: 'photography',
    icon: Camera,
    title: '사진/영상',
    description: '사진 및 영상 편집'
  },
  {
    id: 'gaming',
    icon: Gamepad2,
    title: '게임',
    description: '게임 정보 및 커뮤니티'
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
  }
];

interface HomePageProps {
  onCategorySelect: (categoryId: string, subCategory?: string) => void;
}

export function HomePage({ onCategorySelect }: HomePageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
  );
}