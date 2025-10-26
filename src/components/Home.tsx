import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { QuickStart } from './home/QuickStart';
import { AutoRail } from './home/AutoRail';
import { TemplateChipsSearch } from './home/TemplateChipsSearch';
import { PopularTemplatesGrid } from './home/PopularTemplatesGrid';
import { SocialProof } from './home/SocialProof';
import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';

export function Home() {
  const navigate = useNavigate();

  const handleStartNow = () => {
    trackEvent(ANALYTICS_EVENTS.CTA_CLICK, { button: 'start_now' });
    navigate('/mypage');
  };

  const handleBrowseTemplates = () => {
    trackEvent(ANALYTICS_EVENTS.CTA_CLICK, { button: 'browse_templates' });
    navigate('/templates');
  };

  return (
    <main className="min-w-[1280px] max-w-[1280px] mx-auto px-6">
      {/* 히어로 섹션 (폴드) */}
      <section className="py-16">
        <div className="flex flex-nowrap items-start gap-8">
          {/* 좌측: 헤드라인 + CTA */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              나만의 시작페이지를<br />
              <span className="text-indigo-600">드래그 한 번으로.</span><br />
              <span className="text-purple-600">링크 하나로 공유.</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              즐겨찾기·위젯·메모를 배치해<br />
              대시보드를 1분 만에 완성.
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleStartNow}
                className="h-12 px-5 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                지금 시작하기
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleBrowseTemplates}
                className="h-12 px-5 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-200 bg-white border hover:bg-slate-50 text-gray-700 flex items-center gap-2"
              >
                템플릿 둘러보기
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 우측: QuickStart 카드 스택 */}
          <QuickStart />
        </div>
      </section>

      {/* AutoRail 섹션 */}
      <section className="py-8">
        <AutoRail />
      </section>

      {/* 카테고리 칩 + 검색 섹션 */}
      <section className="py-8">
        <TemplateChipsSearch />
      </section>

      {/* 인기/최신 템플릿 그리드 섹션 */}
      <section className="py-12">
        <PopularTemplatesGrid />
      </section>

      {/* 사회적 증거 섹션 */}
      <section className="py-12">
        <SocialProof />
      </section>

      {/* 배경 그라디언트 블롭 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
      </div>
    </main>
  );
}
