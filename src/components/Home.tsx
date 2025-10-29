import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { QuickStart } from './home/QuickStart';
import { AutoRail } from './home/AutoRail';
import { TemplateChipsSearch } from './home/TemplateChipsSearch';
import { PopularTemplatesGrid } from './home/PopularTemplatesGrid';
import { SocialProof } from './home/SocialProof';
import { TemplateSelectModal } from './modals/TemplateSelectModal';
import { Onboarding } from './Onboarding';
import { HelpTooltip } from './HelpTooltip';
import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';

export function Home() {
  const navigate = useNavigate();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleStartNow = () => {
    trackEvent(ANALYTICS_EVENTS.CTA_CLICK, { button: 'start_now' });
    setShowTemplateModal(true);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('urwebs-onboarding-seen', 'true');
    setShowOnboarding(false);
    trackEvent(ANALYTICS_EVENTS.CTA_CLICK, { button: 'onboarding_completed' });
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleSelectTemplate = (templateId: string) => {
    trackEvent(ANALYTICS_EVENTS.TEMPLATE_SELECTED, { template_id: templateId });
    
    // 템플릿에 따른 기본 위젯 설정
    const templateConfigs = {
      default: {
        widgets: [
          { type: 'bookmark', size: '1x1', x: 0, y: 0 },
          { type: 'todo', size: '2x2', x: 1, y: 0 },
          { type: 'weather', size: '1x2', x: 3, y: 0 },
          { type: 'calendar', size: '1x1', x: 0, y: 1 }
        ]
      },
      business: {
        widgets: [
          { type: 'bookmark', size: '1x1', x: 0, y: 0 },
          { type: 'todo', size: '2x2', x: 1, y: 0 },
          { type: 'exchange', size: '1x2', x: 3, y: 0 },
          { type: 'news', size: '2x2', x: 0, y: 1 }
        ]
      },
      student: {
        widgets: [
          { type: 'bookmark', size: '1x1', x: 0, y: 0 },
          { type: 'todo', size: '2x2', x: 1, y: 0 },
          { type: 'calendar', size: '1x2', x: 3, y: 0 },
          { type: 'english_words', size: '1x1', x: 0, y: 1 }
        ]
      },
      creative: {
        widgets: [
          { type: 'bookmark', size: '1x1', x: 0, y: 0 },
          { type: 'todo', size: '2x2', x: 1, y: 0 },
          { type: 'weather', size: '1x2', x: 3, y: 0 },
          { type: 'quote', size: '1x1', x: 0, y: 1 }
        ]
      }
    };

    const config = templateConfigs[templateId as keyof typeof templateConfigs] || templateConfigs.default;
    
    // localStorage에 템플릿 설정 저장
    const templateData = {
      templateId,
      widgets: config.widgets,
      createdAt: Date.now()
    };
    
    localStorage.setItem('selectedTemplate', JSON.stringify(templateData));
    
    // MyPage로 이동
    navigate('/mypage');
  };

  const handleBrowseTemplates = () => {
    trackEvent(ANALYTICS_EVENTS.CTA_CLICK, { button: 'browse_popular_pages' });
    navigate('/pages?type=popular');
  };

  return (
    <main className="min-w-[1280px] max-w-[1280px] mx-auto px-6">
      {/* 히어로 섹션 (폴드) */}
      <section className="py-16">
        <div className="flex flex-nowrap items-start gap-8">
          {/* 좌측: 헤드라인 + CTA */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              구글,네이버가 아닌<br />
              <span className="text-indigo-600 dark:text-indigo-400">`나만의` 시작페이지를</span><br />
              <span className="text-purple-600 dark:text-purple-400">만들어보세요 :)</span>
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-200 mb-8 leading-relaxed">
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
                className="h-12 px-5 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2"
              >
                인기 페이지 둘러보기
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleShowOnboarding}
                className="h-12 px-4 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-300 dark:border-gray-600"
                title="사용 가이드 보기"
              >
                가이드
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
               <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-sky-200/20 rounded-full blur-3xl"></div>
               <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
             </div>

             {/* 템플릿 선택 모달 */}
             <TemplateSelectModal
               isOpen={showTemplateModal}
               onClose={() => setShowTemplateModal(false)}
               onSelectTemplate={handleSelectTemplate}
             />

             {/* 온보딩 모달 */}
             <Onboarding
               isOpen={showOnboarding}
               onClose={() => setShowOnboarding(false)}
               onComplete={handleOnboardingComplete}
             />
           </main>
         );
       }
