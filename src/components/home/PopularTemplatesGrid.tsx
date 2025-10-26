import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Copy, Star, Users, ExternalLink } from 'lucide-react';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';

interface Template {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
  likes: number;
  views: number;
  author: string;
}

export function PopularTemplatesGrid() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'popular' | 'latest'>('popular');

  // 더미 데이터
  const popularTemplates: Template[] = [
    {
      id: '1',
      title: '개발자 대시보드',
      description: 'GitHub, 스택오버플로우, 기술 뉴스를 한눈에',
      tags: ['개발자', '기술'],
      thumbnail: '/api/placeholder/300/200',
      likes: 142,
      views: 1205,
      author: 'devmaster'
    },
    {
      id: '2',
      title: '디자이너 워크스페이스',
      description: 'Dribbble, Behance, 디자인 도구 모음',
      tags: ['디자인', '크리에이티브'],
      thumbnail: '/api/placeholder/300/200',
      likes: 98,
      views: 856,
      author: 'designer_pro'
    },
    {
      id: '3',
      title: '학생 학습 관리',
      description: '할 일, 캘린더, 노트, 학습 자료 정리',
      tags: ['학생', '학습'],
      thumbnail: '/api/placeholder/300/200',
      likes: 76,
      views: 634,
      author: 'student_life'
    },
    {
      id: '4',
      title: '마케터 인사이트',
      description: '소셜미디어, 분석도구, 트렌드 모니터링',
      tags: ['마케팅', '분석'],
      thumbnail: '/api/placeholder/300/200',
      likes: 89,
      views: 742,
      author: 'marketing_guru'
    }
  ];

  const latestTemplates: Template[] = [
    {
      id: '5',
      title: '부동산 투자 대시보드',
      description: '부동산 시세, 투자 정보, 계산기',
      tags: ['부동산', '투자'],
      thumbnail: '/api/placeholder/300/200',
      likes: 23,
      views: 156,
      author: 'realestate_investor'
    },
    {
      id: '6',
      title: '캠핑 여행 계획',
      description: '날씨, 캠핑장 정보, 체크리스트',
      tags: ['캠핑', '여행'],
      thumbnail: '/api/placeholder/300/200',
      likes: 45,
      views: 298,
      author: 'camping_lover'
    },
    {
      id: '7',
      title: '자영업자 관리',
      description: '매출, 고객, 재고 관리 도구',
      tags: ['자영업', '관리'],
      thumbnail: '/api/placeholder/300/200',
      likes: 34,
      views: 267,
      author: 'small_business'
    },
    {
      id: '8',
      title: '금융 투자 포트폴리오',
      description: '주식, 암호화폐, 환율 모니터링',
      tags: ['금융', '투자'],
      thumbnail: '/api/placeholder/300/200',
      likes: 67,
      views: 445,
      author: 'finance_trader'
    }
  ];

  const templates = activeTab === 'popular' ? popularTemplates : latestTemplates;

  const handleGoToTemplate = (templateId: string) => {
    trackEvent(ANALYTICS_EVENTS.TEMPLATE_PREVIEW, { template_id: templateId });
    navigate(`/template/${templateId}`);
  };

  return (
    <div className="space-y-6">
      {/* 탭 헤더 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('popular')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'popular'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          지금 인기
        </button>
        <button
          onClick={() => setActiveTab('latest')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'latest'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          최신
        </button>
      </div>

      {/* 템플릿 그리드 */}
      <div className="grid grid-cols-4 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* 썸네일 */}
            <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
              <div className="text-gray-400 text-sm">미리보기 이미지</div>
            </div>

            {/* 템플릿 정보 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                {template.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2">
                {template.description}
              </p>
              
              {/* 태그 */}
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* 통계 */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {template.likes}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {template.views}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {template.author}
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="mt-4">
              <button
                onClick={() => handleGoToTemplate(template.id)}
                className="w-full px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                바로가기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
