import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Monitor, LayoutDashboard, Palette, Copy } from 'lucide-react';
import { TemplateSelectModal } from './modals/TemplateSelectModal';
import { Onboarding } from './Onboarding';
import {
  trackEvent,
  ANALYTICS_EVENTS,
  getPopularTemplates,
  getRecentTemplates,
  getTemplateSnapshot,
  subscribeAnalytics,
} from '../utils/analytics';
import { useAuth } from '../contexts/AuthContext';
import { useVisitExperience } from '../hooks/useVisitExperience';
import { useTutorialProgress } from '../hooks/useTutorialProgress';
import { ensureGuestTrialPage, resetGuestTrialPage } from '../utils/guestExperience';

const templatesShowcase = [
  {
    id: 'focus',
    templateId: 'default',
    name: '모닝 포커스',
    description: '할 일과 일정으로 하루를 정리하는 기본 레이아웃',
    accent: 'from-indigo-500/70 to-sky-400/50',
    stats: '3분 만에 완성',
    preview: [
      { size: 'col-span-2 row-span-2', label: '할 일', tone: 'bg-white/80 border-white/60 text-indigo-600' },
      { size: 'row-span-2', label: '북마크', tone: 'bg-indigo-100/60 border-indigo-300/40 text-indigo-700' },
      { label: '날씨', tone: 'bg-sky-100/80 border-sky-200/60 text-sky-700' },
      { label: '메모', tone: 'bg-emerald-100/70 border-emerald-200/50 text-emerald-700' },
    ],
  },
  {
    id: 'creative',
    templateId: 'creative',
    name: '크리에이터 하이라이트',
    description: '영감 카드와 인용구로 아이디어를 담는 대시보드',
    accent: 'from-purple-500/70 to-fuchsia-400/50',
    stats: '디자이너 추천',
    preview: [
      { size: 'col-span-2', label: '인용구', tone: 'bg-purple-100/70 border-purple-200/60 text-purple-700' },
      { size: 'row-span-2', label: '영감 갤러리', tone: 'bg-white/70 border-white/50 text-purple-600' },
      { label: '링크', tone: 'bg-amber-100/70 border-amber-200/60 text-amber-700' },
      { label: '캘린더', tone: 'bg-indigo-100/70 border-indigo-200/60 text-indigo-700' },
    ],
  },
  {
    id: 'planner',
    templateId: 'business',
    name: '팀 플래너',
    description: '회의, 환율, 뉴스까지 한눈에 확인하는 팀 전용 보드',
    accent: 'from-slate-500/70 to-blue-400/50',
    stats: '팀 리더 인기',
    preview: [
      { size: 'col-span-2 row-span-2', label: '프로젝트', tone: 'bg-white/75 border-white/50 text-slate-700' },
      { label: '환율', tone: 'bg-slate-100/70 border-slate-200/60 text-slate-700' },
      { label: '뉴스', tone: 'bg-blue-100/70 border-blue-200/60 text-blue-700' },
      { label: '회의 노트', tone: 'bg-emerald-100/70 border-emerald-200/60 text-emerald-700' },
    ],
  },
];

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const visitExperience = useVisitExperience();
  const { progress, start: startTutorial, complete: completeStep } = useTutorialProgress();

  useEffect(() => {
    ensureGuestTrialPage();
  }, []);

  const [activeTemplate, setActiveTemplate] = useState(0);
  const [parallax, setParallax] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [popularTemplates, setPopularTemplates] = useState<
    Array<{
      templateId: string;
      templateName?: string;
      count: number;
      snapshot?: { templateId: string; templateName?: string; data: any; origin?: string; updatedAt: number } | null;
    }>
  >([]);
  const [recentTemplates, setRecentTemplates] = useState<
    Array<{
      id: string;
      name?: string;
      timestamp: number;
      source: string;
      snapshot?: { templateId: string; templateName?: string; data: any; origin?: string; updatedAt: number } | null;
    }>
  >([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReveal(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setParallax(window.scrollY * 0.15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const refreshTemplateInsights = useCallback(() => {
    const popular = getPopularTemplates({ limit: 6 }).map((item) => {
      const snapshot = getTemplateSnapshot(item.templateId);
      return {
        templateId: item.templateId,
        templateName: item.templateName || snapshot?.templateName,
        count: item.count,
        snapshot,
      };
    });
    setPopularTemplates(popular);

    const recent = getRecentTemplates(6).map((item) => {
      const snapshot = getTemplateSnapshot(item.id);
      return {
        id: item.id,
        name: item.name || snapshot?.templateName,
        timestamp: item.timestamp,
        source: item.source,
        snapshot,
      };
    });
    setRecentTemplates(recent);
  }, []);

  useEffect(() => {
    refreshTemplateInsights();
    const unsubscribe = subscribeAnalytics((event) => {
      if (event.event === ANALYTICS_EVENTS.TEMPLATE_CLONE) {
        refreshTemplateInsights();
      }
    });
    const storageListener = (event: StorageEvent) => {
      if (
        event.key === 'analytics-event-log-v1' ||
        event.key === 'analytics-recent-templates-v1' ||
        event.key === 'analytics-template-snapshots-v1'
      ) {
        refreshTemplateInsights();
      }
    };
    window.addEventListener('storage', storageListener);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', storageListener);
    };
  }, [refreshTemplateInsights]);

  const cloneTemplateById = useCallback(
    (templateId: string, templateName?: string, origin: string = 'home_clone') => {
      const snapshot = getTemplateSnapshot(templateId);
      if (!snapshot?.data) {
        navigate('/templates');
        return;
      }

      try {
        ensureGuestTrialPage();
        localStorage.setItem('selectedTemplate', JSON.stringify(snapshot.data));
      } catch (error) {
        console.warn('[Home] template snapshot persist failed', error);
      }

      trackEvent(ANALYTICS_EVENTS.TEMPLATE_CLONE, {
        templateId,
        templateName: templateName || snapshot.templateName,
        source: origin,
        snapshot: {
          templateId,
          templateName: templateName || snapshot.templateName,
          data: snapshot.data,
          origin,
        },
      });
      navigate(`/mypage?origin=${origin}&template=${encodeURIComponent(templateId)}`);
    },
    [navigate]
  );

  const formatRelativeTime = useCallback((timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  }, []);

  const handleStartTrial = useCallback(
    (forceReset: boolean = false) => {
      if (forceReset) {
        resetGuestTrialPage();
      }
      ensureGuestTrialPage();
      if (!progress || progress.completedAt) {
        startTutorial();
      }
      trackEvent(ANALYTICS_EVENTS.TRY_DEMO_CLICK, {
        source: forceReset ? 'hero_restart' : 'hero_primary',
      });
      trackEvent(ANALYTICS_EVENTS.CTA_CLICK, { button: forceReset ? 'trial_restart' : 'trial_start' });
      navigate('/mypage?origin=hero_trial');
    },
    [navigate, progress, startTutorial]
  );

  const handleOnboardingComplete = () => {
    localStorage.setItem('urwebs-onboarding-seen', 'true');
    setShowOnboarding(false);
    trackEvent(ANALYTICS_EVENTS.CTA_CLICK, { button: 'onboarding_completed' });
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleSelectTemplate = (templateId: string) => {
    const templateLabels: Record<string, string> = {
      default: '베이직',
      business: '비즈니스',
      student: '학생',
      creative: '크리에이티브',
    };

    trackEvent(ANALYTICS_EVENTS.TEMPLATE_SELECTED, {
      templateId,
      templateName: templateLabels[templateId] || '커스텀 템플릿',
    });
    completeStep('template', { templateId });
    
    // 템플릿에 따른 기본 위젯 설정
    const templateConfigs = {
      default: {
        widgets: [
          { type: 'bookmark', size: '1x2', x: 0, y: 0 },
          { type: 'todo', size: '2x2', x: 1, y: 0 },
          { type: 'weather', size: '1x2', x: 3, y: 0 },
          { type: 'calendar', size: '1x1', x: 0, y: 1 }
        ]
      },
      business: {
        widgets: [
          { type: 'bookmark', size: '1x2', x: 0, y: 0 },
          { type: 'todo', size: '2x2', x: 1, y: 0 },
          { type: 'exchange', size: '1x2', x: 3, y: 0 },
          { type: 'news', size: '2x2', x: 0, y: 1 }
        ]
      },
      student: {
        widgets: [
          { type: 'bookmark', size: '1x2', x: 0, y: 0 },
          { type: 'todo', size: '2x2', x: 1, y: 0 },
          { type: 'calendar', size: '1x2', x: 3, y: 0 },
          { type: 'english_words', size: '1x1', x: 0, y: 1 }
        ]
      },
      creative: {
        widgets: [
          { type: 'bookmark', size: '1x2', x: 0, y: 0 },
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

    trackEvent(ANALYTICS_EVENTS.TEMPLATE_CLONE, {
      templateId,
      templateName: templateLabels[templateId] || '커스텀 템플릿',
      source: 'home_template_modal',
      snapshot: {
        templateId,
        templateName: templateLabels[templateId] || '커스텀 템플릿',
        data: templateData,
        origin: 'home_template_modal',
      },
    });
    
    // MyPage로 이동
    navigate('/mypage');
  };

  const handleBrowseTemplates = () => {
    trackEvent(ANALYTICS_EVENTS.CTA_CLICK, { button: 'browse_popular_pages' });
    navigate('/pages?type=popular');
  };

  const heroFade = reveal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6';
  const activeShowcase = templatesShowcase[activeTemplate] || templatesShowcase[0];
  const visitCopy = useMemo(() => {
    if (visitExperience.isLoading) return null;
    if (visitExperience.isFirstVisit) {
      return '처음 오셨나요? 1분 안에 첫 시작 페이지를 완성할 수 있어요.';
    }
    return `Welcome back! ${visitExperience.visitCount}번째 URWEBS 사용 중입니다.`;
  }, [visitExperience]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ transform: `translateY(${parallax * -0.2}px)` }}
      >
        <div className="absolute left-[10%] top-[12%] h-72 w-72 rounded-full bg-indigo-200/40 blur-[120px] dark:bg-indigo-600/30" />
        <div className="absolute right-[8%] top-[30%] h-80 w-80 rounded-full bg-sky-200/50 blur-[140px] dark:bg-sky-500/20" />
        <div className="absolute bottom-[8%] left-1/2 h-72 w-[420px] -translate-x-1/2 rounded-[50%] bg-purple-200/40 blur-[160px] dark:bg-purple-600/20" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className={`flex flex-col gap-12 lg:flex-row lg:items-center ${heroFade} transition-all duration-700`}>
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-1 text-sm font-medium text-indigo-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-indigo-200">
              <Sparkles className="w-4 h-4" />
              모든 시작의 페이지, URWEBS
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl">
              나만의 데스크톱처럼
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500">
                감성적인 시작을 설계하세요
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              즐겨찾기, 일정, 영감 위젯을 자유롭게 배치해 당신만의 Morning Ritual을 만들어보세요. 템플릿으로 시작하고, 위젯으로 채우고, 저장으로 마무리하세요.
            </p>
            {visitCopy && (
              <p className="text-sm text-indigo-600/80 dark:text-indigo-200">{visitCopy}</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleStartTrial(true)}
                  className="group inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                >
                  <Sparkles className="h-4 w-4" />
                  지금 바로 10초 체험
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              <button
                onClick={handleBrowseTemplates}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/70 px-5 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-indigo-400/60"
              >
                <LayoutDashboard className="h-4 w-4" />
                템플릿 둘러보기
              </button>
              <button
                onClick={() => navigate('/mypage')}
                className="inline-flex items-center gap-2 rounded-2xl border border-transparent px-5 py-3 text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300"
              >
                <Heart className="h-4 w-4" />
                내 페이지 열기
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Monitor className="h-4 w-4 text-indigo-500" />
                템플릿 미리보기
              </div>
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1">
                <Palette className="h-4 w-4 text-purple-500" />
                글래스모피즘 & 그라디언트 스타일
              </div>
            </div>
          </div>

          <div className="relative flex-1">
            <div className="absolute inset-0 -z-10 rounded-[32px] bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl dark:bg-slate-900/40" />
            <div className="relative rounded-[32px] border border-white/30 bg-white/70 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">템플릿 미리보기</p>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {activeShowcase.name}
                  </h2>
                  <p className="text-xs text-indigo-500 dark:text-indigo-300">{activeShowcase.stats}</p>
                </div>
                <button
                  onClick={() => handleSelectTemplate(activeShowcase.templateId)}
                  className="rounded-full border border-indigo-200/70 px-4 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-400/40 dark:text-indigo-200 dark:hover:bg-indigo-500/10"
                >
                  적용하기
                </button>
              </header>

              <div className="mt-5 grid grid-cols-3 grid-rows-3 gap-3">
                {activeShowcase.preview.map((block, index) => (
                  <div
                    key={`${activeShowcase.id}-${index}`}
                    className={`rounded-2xl border p-3 text-xs font-medium shadow-sm backdrop-blur ${block.tone} ${
                      block.size || ''
                    }`}
                  >
                    {block.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {templatesShowcase.map((template, index) => {
                const isActive = activeTemplate === index;
                return (
                  <button
                    key={template.id}
                    onMouseEnter={() => setActiveTemplate(index)}
                    onClick={() => handleSelectTemplate(template.templateId)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                      isActive
                        ? 'border-indigo-400 bg-white/90 shadow-lg shadow-indigo-200/60 dark:border-indigo-500/70 dark:bg-slate-900/60'
                        : 'border-white/40 bg-white/60 shadow-sm hover:-translate-y-0.5 hover:border-indigo-200 dark:border-white/10 dark:bg-white/10'
                    }`}
                  >
                    <div className={`mb-2 h-1 w-12 rounded-full bg-gradient-to-r ${template.accent}`} />
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{template.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {template.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {popularTemplates.length > 0 && (
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">최근 인기 템플릿</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                지난 7일 동안 가장 많이 복제된 템플릿입니다.
              </p>
            </div>
            <button
              onClick={() => navigate('/templates')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200"
            >
              전체 보기
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popularTemplates.map((template) => (
              <div
                key={`popular-${template.templateId}`}
                className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-lg transition hover:-translate-y-1 hover:border-indigo-200/60 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {template.templateName || `템플릿 ${template.templateId}`}
                    </h3>
                    <p className="mt-1 text-xs text-indigo-500 dark:text-indigo-300">
                      지난 7일간 {template.count}회 복제
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-100/80 px-3 py-1 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                    인기
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() =>
                      cloneTemplateById(template.templateId, template.templateName, 'home_popular_template')
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    disabled={!template.snapshot?.data}
                    title={
                      template.snapshot?.data
                        ? '바로 복제'
                        : '템플릿 데이터를 불러올 수 없어 템플릿 목록으로 이동합니다.'
                    }
                  >
                    <Copy className="h-3.5 w-3.5" />
                    바로 복제
                  </button>
                  <button
                    onClick={() => navigate('/templates')}
                    className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
                  >
                    더 보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {recentTemplates.length > 0 && (
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">최근에 본 템플릿</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
              다시 열어보고 싶은 템플릿을 한 번에 복제해보세요.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentTemplates.map((item) => (
              <div
                key={`recent-${item.id}`}
                className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200/60 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/40"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.name || item.snapshot?.templateName || `템플릿 ${item.id}`}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {formatRelativeTime(item.timestamp)} • {item.source}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      cloneTemplateById(item.id, item.name || item.snapshot?.templateName, 'home_recent_template')
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-indigo-600 shadow-sm hover:-translate-y-0.5 hover:bg-indigo-50 dark:bg-slate-900/60 dark:text-indigo-300"
                    disabled={!item.snapshot?.data}
                    title={
                      item.snapshot?.data
                        ? '바로 복제'
                        : '템플릿 데이터를 불러올 수 없어 템플릿 목록으로 이동합니다.'
                    }
                  >
                    다시 복제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <TemplateSelectModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <Onboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </main>
  );
}
