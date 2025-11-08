import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, Eye, Copy, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';
import { templateService, TemplateData } from '../services/templateService';
import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';
import { generateCategoryMetaTags, generateTemplateListSchema } from '../utils/seoUtils';
import { ensureGuestTrialPage, resetGuestTrialPage } from '../utils/guestExperience';
import { allWidgets } from '../constants/widgetCategories';
import { createPortal } from 'react-dom';

interface PreviewTemplateProps {
  template: TemplateData | null;
  onClose: () => void;
}

const widgetNameMap = new Map(allWidgets.map((widget) => [widget.type, widget.name]));

const formatRelativeTime = (value?: Date) => {
  if (!value) return '방금 업데이트';
  const diff = Date.now() - value.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}일 전 업데이트`;
  if (hours > 0) return `${hours}시간 전 업데이트`;
  if (minutes > 0) return `${minutes}분 전 업데이트`;
  return '방금 업데이트';
};

const PreviewModal: React.FC<PreviewTemplateProps> = ({ template, onClose }) => {
  if (!template) return null;

  return createPortal(
    <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
      <div className="w-full max-w-4xl rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/85">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
              라이브 미리보기
            </span>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {template.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500 line-clamp-3 dark:text-slate-300">
              {template.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            닫기
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {template.widgets?.slice(0, 9).map((widget, index) => {
            const name = widgetNameMap.get(widget.type) || widget.title || widget.type;
            return (
              <div
                key={`${widget.id}-${index}`}
                className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-800/60"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span>{widget.size || '1x1'}</span>
                  <span>{widget.type}</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {name}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  ({widget.x ?? 0}, {widget.y ?? 0})
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const TemplatesGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewTarget, setPreviewTarget] = useState<TemplateData | null>(null);

  const rawTag = searchParams.get('tag') || '';
  const decodedTag = decodeURIComponent(rawTag);
  const categoryLabel = decodedTag || '전체';

  useEffect(() => {
    let ignore = false;
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await templateService.getAllTemplates();
        if (!ignore) {
          setTemplates(data);
        }
      } catch (err) {
        console.error('[TemplatesGalleryPage] 템플릿 로드 실패', err);
        if (!ignore) {
          setError('템플릿을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchTemplates();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredTemplates = useMemo(() => {
    if (!decodedTag) return templates;
    const tagLower = decodedTag.toLowerCase();
    return templates.filter((template) => {
      const category = template.category || '';
      const tags: string[] = Array.isArray((template as any).tags) ? (template as any).tags : [];
      return (
        category.toLowerCase().includes(tagLower) ||
        tags.some((tag) => tag.toLowerCase().includes(tagLower))
      );
    });
  }, [templates, decodedTag]);

  useEffect(() => {
    if (filteredTemplates.length > 0) {
      setActiveId(filteredTemplates[0].id);
    } else {
      setActiveId(null);
    }
  }, [filteredTemplates]);

  const activeTemplate = useMemo(() => {
    if (!activeId) return filteredTemplates[0] ?? null;
    return filteredTemplates.find((template) => template.id === activeId) ?? filteredTemplates[0] ?? null;
  }, [filteredTemplates, activeId]);

  useEffect(() => {
    const metaTags = generateCategoryMetaTags(categoryLabel);
    if (metaTags['og:title']) {
      document.title = metaTags['og:title'];
    }

    const previousValues: Array<{
      key: string;
      selector: string;
      attribute: 'name' | 'property';
      element: HTMLMetaElement;
      previous: string | null;
    }> = [];

    Object.entries(metaTags).forEach(([key, value]) => {
      if (!value) return;
      if (key.startsWith('og:')) {
        let element = document.querySelector<HTMLMetaElement>(`meta[property="${key}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('property', key);
          document.head.appendChild(element);
        }
        previousValues.push({
          key,
          selector: key,
          attribute: 'property',
          element,
          previous: element.getAttribute('content'),
        });
        element.setAttribute('content', value);
      } else if (key.startsWith('twitter:')) {
        let element = document.querySelector<HTMLMetaElement>(`meta[name="${key}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('name', key);
          document.head.appendChild(element);
        }
        previousValues.push({
          key,
          selector: key,
          attribute: 'name',
          element,
          previous: element.getAttribute('content'),
        });
        element.setAttribute('content', value);
      } else if (key.startsWith('meta:')) {
        const name = key.replace('meta:', '');
        let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('name', name);
          document.head.appendChild(element);
        }
        previousValues.push({
          key: name,
          selector: name,
          attribute: 'name',
          element,
          previous: element.getAttribute('content'),
        });
        element.setAttribute('content', value);
      }
    });

    const scriptId = 'urwebs-template-list-schema';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }
    if (filteredTemplates.length > 0) {
      const schemaScript = document.createElement('script');
      schemaScript.id = scriptId;
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify(
        generateTemplateListSchema(
          filteredTemplates.slice(0, 20).map((template) => ({
            id: template.id,
            title: template.name,
            description: template.description,
            tags: (template as any).tags || [],
            author: (template as any).author || 'URWEBS',
            createdAt: (template.createdAt || new Date()).toISOString(),
            updatedAt: (template.lastModified || new Date()).toISOString(),
            views: (template as any).views || 0,
            clones: (template as any).clones || 0,
            ogImage: (template as any).ogImage,
          }))
        )
      );
      document.head.appendChild(schemaScript);
    }

    return () => {
      previousValues.forEach(({ element, previous }) => {
        if (previous) {
          element.setAttribute('content', previous);
        } else {
          element.remove();
        }
      });
      const cleanupScript = document.getElementById(scriptId);
      if (cleanupScript) {
        cleanupScript.remove();
      }
    };
  }, [categoryLabel, filteredTemplates]);

  const handleClone = useCallback(
    (template: TemplateData) => {
      try {
        resetGuestTrialPage();
        ensureGuestTrialPage();
        const widgetPayload = (template.widgets || []).map((widget, index) => {
          const width = widget.width || 300;
          const height = widget.height || 150;
          const size =
            widget.size ||
            `${Math.max(1, Math.round(width / 150))}x${Math.max(1, Math.round(height / 150))}`;
          return {
            id: widget.id || `widget_${index}`,
            type: widget.type,
            x: widget.x ?? 0,
            y: widget.y ?? 0,
            size,
            title: widget.title || widget.type,
          };
        });
        const templateData = {
          templateId: template.id,
          name: template.name,
          category: template.category,
          source: 'category_page',
          widgets: widgetPayload,
          createdAt: Date.now(),
        };

        localStorage.setItem('selectedTemplate', JSON.stringify(templateData));
        trackEvent(ANALYTICS_EVENTS.TEMPLATE_CLONE, {
          templateId: template.id,
          templateName: template.name,
          category: template.category,
          source: 'templates_gallery',
          snapshot: {
            templateId: template.id,
            templateName: template.name,
            data: templateData,
            origin: 'templates_gallery',
          },
        });
        trackEvent(ANALYTICS_EVENTS.CTA_CLICK, {
          button: 'category_start_now',
          templateId: template.id,
          category: template.category,
        });
        navigate(`/mypage?origin=templates&template=${encodeURIComponent(template.id)}`);
      } catch (error) {
        console.error('[TemplatesGalleryPage] 템플릿 복제 실패', error);
      }
    },
    [navigate]
  );

  const handlePreview = useCallback((template: TemplateData) => {
    setPreviewTarget(template);
    trackEvent(ANALYTICS_EVENTS.TEMPLATE_PREVIEW, {
      templateId: template.id,
      category: template.category,
      origin: 'category_page',
    });
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 pb-16 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          돌아가기
        </button>

        <header className="mb-10 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/20 dark:text-indigo-200">
            템플릿 카테고리
          </span>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
            {categoryLabel === '전체' ? '모든 템플릿' : `${categoryLabel} 템플릿`}
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
            카테고리에 맞는 시작페이지를 선택하고, 10초 만에 나만의 대시보드를 완성해보세요. 모든 템플릿은
            글래스모피즘 스타일과 rounded-2xl, soft shadow 톤을 유지합니다.
          </p>
        </header>

        {activeTemplate && (
          <div className="sticky top-4 z-30 mb-8 rounded-3xl border border-white/40 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100/70 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/30 dark:text-indigo-200">
                  추천 템플릿
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  {activeTemplate.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2 dark:text-slate-300">
                  {activeTemplate.description}
                </p>
              </div>
              <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
                <button
                  onClick={() => handlePreview(activeTemplate)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-indigo-400/60"
                >
                  <Eye className="h-4 w-4" />
                  라이브 미리보기
                </button>
                <button
                  onClick={() => handleClone(activeTemplate)}
                  className="group inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                >
                  <Sparkles className="h-4 w-4" />
                  이 템플릿으로 10초 만에 시작
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            템플릿을 불러오는 중입니다...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center text-rose-600 dark:border-rose-800/60 dark:bg-rose-900/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {!loading && !error && filteredTemplates.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-12 text-center text-slate-500 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300">
            해당 카테고리에 맞는 템플릿을 준비 중입니다. 다른 카테고리를 선택해보세요.
          </div>
        )}

        {!loading && !error && filteredTemplates.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredTemplates.map((template) => {
              const widgetTags =
                (template.preview && template.preview.length > 0
                  ? template.preview
                  : template.widgets?.map((widget) => widget.type)) || [];
              const widgetBadges = Array.from(new Set(widgetTags)).slice(0, 6);
              const isActive = activeTemplate?.id === template.id;

              return (
                <div
                  key={template.id}
                  onMouseEnter={() => setActiveId(template.id)}
                  onFocus={() => setActiveId(template.id)}
                  className={`rounded-3xl border p-6 transition-all ${
                    isActive
                      ? 'border-indigo-400/80 bg-white shadow-2xl shadow-indigo-200/40 dark:border-indigo-500/60 dark:bg-slate-900/60 dark:shadow-indigo-900/30'
                      : 'border-white/60 bg-white/90 shadow-lg hover:-translate-y-1 hover:border-indigo-200/70 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {template.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-3 dark:text-slate-300">
                        {template.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-indigo-100/70 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                      위젯 {template.widgetCount ?? template.widgets?.length ?? 0}개
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {widgetBadges.map((type) => (
                      <span
                        key={`${template.id}-${type}`}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {widgetNameMap.get(type) || type}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatRelativeTime(template.lastModified)}</span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        {template.category || '일반'}
                      </span>
                      {(template as any)?.tags &&
                        (template as any).tags.slice(0, 2).map((tag: string) => (
                          <span
                            key={`${template.id}-tag-${tag}`}
                            className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-200"
                          >
                            #{tag}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handlePreview(template)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200"
                    >
                      <ExternalLink className="h-4 w-4" />
                      라이브 미리보기
                    </button>
                    <button
                      onClick={() => handleClone(template)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    >
                      <Copy className="h-4 w-4" />
                      바로 복제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <PreviewModal template={previewTarget} onClose={() => setPreviewTarget(null)} />
    </div>
  );
};

export default TemplatesGalleryPage;

