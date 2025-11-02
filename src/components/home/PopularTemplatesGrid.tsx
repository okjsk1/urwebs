import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Copy, Star, Users, ExternalLink, Grid } from 'lucide-react';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { widgetCategories } from '../../constants/widgetCategories';

interface BackgroundSettings {
  type?: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: {
    from?: string;
    to?: string;
    direction?: string;
  };
  image?: string;
  opacity?: number;
}

interface Widget {
  id: string;
  type: string;
  x: number;
  y: number;
  gridSize?: { w: number; h: number };
  size?: string | { w: number; h: number };
  width?: number;
  height?: number;
}

interface Template {
  id: string;
  urlId: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail?: string;
  likes: number;
  views: number;
  author: string;
  authorName?: string;
  backgroundSettings?: BackgroundSettings;
  widgets?: Widget[];
}

export function PopularTemplatesGrid() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'popular' | 'latest'>('popular');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // 시간 경과 계산 헬퍼
  const getTimeAgo = (date: Date | null) => {
    if (!date) return '방금 전';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return '방금 전';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    const weeks = Math.floor(days / 7);
    return `${weeks}주 전`;
  };

  // Firebase에서 페이지 데이터 로드
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        const pagesRef = collection(db, 'userPages');
        let q;
        
        if (activeTab === 'popular') {
          // 인기 페이지: 조회수 순
          q = query(
            pagesRef,
            where('isPublic', '==', true),
            where('isDeleted', '==', false),
            orderBy('views', 'desc'),
            limit(8)
          );
        } else {
          // 최신 페이지: 업데이트 시간 순
          q = query(
            pagesRef,
            where('isPublic', '==', true),
            where('isDeleted', '==', false),
            orderBy('updatedAt', 'desc'),
            limit(8)
          );
        }
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const pagesData: Template[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              urlId: data.urlId || doc.id,
              title: data.title || '제목 없음',
              description: data.description || '설명 없음',
              tags: data.tags || [],
              thumbnail: data.thumbnail || data.pageThumbnail,
              likes: data.likes || data.likesCount || 0,
              views: data.views || 0,
              author: data.authorName || data.authorEmail?.split('@')[0] || '익명',
              authorName: data.authorName,
              backgroundSettings: data.backgroundSettings || { type: 'solid', color: '#f8fafc' },
              widgets: data.widgets || []
            };
          });
          
          // 조회수가 0인 경우 최신순으로 대체 정렬 (인기 탭인 경우)
          if (activeTab === 'popular') {
            pagesData.sort((a, b) => {
              // 조회수가 같으면 좋아요순
              if (b.views === a.views) {
                return b.likes - a.likes;
              }
              return b.views - a.views;
            });
          }
          
          setTemplates(pagesData);
        } else {
          setTemplates([]);
        }
      } catch (error: any) {
        console.error(`${activeTab === 'popular' ? '인기' : '최신'} 페이지 로드 실패:`, error);
        // Firestore 인덱스가 없을 수 있으므로 views 대신 updatedAt으로 폴백
        if (error.code === 'failed-precondition' && activeTab === 'popular') {
          try {
            const pagesRef = collection(db, 'userPages');
            const fallbackQ = query(
              pagesRef,
              where('isPublic', '==', true),
              where('isDeleted', '==', false),
              orderBy('updatedAt', 'desc'),
              limit(8)
            );
            const fallbackSnapshot = await getDocs(fallbackQ);
            const pagesData: Template[] = fallbackSnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                urlId: data.urlId || doc.id,
                title: data.title || '제목 없음',
                description: data.description || '설명 없음',
                tags: data.tags || [],
                thumbnail: data.thumbnail || data.pageThumbnail,
                likes: data.likes || data.likesCount || 0,
                views: data.views || 0,
                author: data.authorName || data.authorEmail?.split('@')[0] || '익명',
                authorName: data.authorName,
                backgroundSettings: data.backgroundSettings || { type: 'solid', color: '#f8fafc' },
                widgets: data.widgets || []
              };
            });
            // 클라이언트에서 조회수순으로 정렬
            pagesData.sort((a, b) => {
              if (b.views === a.views) {
                return b.likes - a.likes;
              }
              return b.views - a.views;
            });
            setTemplates(pagesData);
          } catch (fallbackError) {
            console.error('폴백 쿼리 실패:', fallbackError);
            setTemplates([]);
          }
        } else {
          setTemplates([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [activeTab]);

  const handleGoToTemplate = (template: Template) => {
    trackEvent(ANALYTICS_EVENTS.TEMPLATE_PREVIEW, { template_id: template.id });
    // 실제 페이지 URL로 이동
    navigate(`/${template.urlId}`);
  };

  // 배경 스타일 생성
  const getBackgroundStyle = (bg: BackgroundSettings | undefined) => {
    if (!bg) {
      return { backgroundColor: '#f8fafc' };
    }

    if (bg.type === 'gradient' && bg.gradient) {
      const direction = bg.gradient.direction || 'to-br';
      return {
        background: `linear-gradient(${direction}, ${bg.gradient.from || '#ffffff'}, ${bg.gradient.to || '#ffffff'})`,
        opacity: bg.opacity || 1
      };
    } else if (bg.type === 'image' && bg.image) {
      return {
        backgroundImage: `url(${bg.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: bg.opacity || 1
      };
    } else {
      return {
        backgroundColor: bg.color || '#f8fafc',
        opacity: bg.opacity || 1
      };
    }
  };

  // 위젯 타입별 아이콘 찾기
  const getWidgetIcon = (widgetType: string) => {
    for (const category of Object.values(widgetCategories)) {
      const widget = category.widgets.find(w => w.type === widgetType);
      if (widget && widget.icon) {
        const IconComponent = widget.icon;
        return <IconComponent className="w-3 h-3" />;
      }
    }
    return <Grid className="w-3 h-3" />;
  };

  // 미리보기 렌더링
  const renderPreview = (template: Template) => {
    const bgStyle = getBackgroundStyle(template.backgroundSettings);
    const widgets = template.widgets || [];
    
    // 미리보기 스케일 (8칸 그리드를 작은 미리보기에 맞게 축소)
    const previewScale = 0.08; // 1/12.5 축소
    const cellWidth = 150;
    const cellHeight = 160;
    const gap = 12;
    
    return (
      <div 
        className="relative w-full h-32 rounded-lg overflow-hidden"
        style={bgStyle}
      >
        {/* 위젯 미리보기 */}
        {widgets.length > 0 ? (
          <div className="absolute inset-0" style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>
            {widgets.slice(0, 8).map((widget) => {
              // 위젯 크기 계산
              const parseSize = (size: any) => {
                if (typeof size === 'string' && /(\d+)x(\d+)/.test(size)) {
                  const [, w, h] = size.match(/(\d+)x(\d+)/) || [];
                  return { w: Number(w) || 1, h: Number(h) || 1 };
                }
                if (widget.gridSize) return widget.gridSize;
                if (widget.width && widget.height) {
                  return {
                    w: Math.ceil(widget.width / (cellWidth + gap)),
                    h: Math.ceil(widget.height / (cellHeight + gap))
                  };
                }
                return { w: 1, h: 1 };
              };
              
              const size = parseSize(widget.size);
              const x = (widget.x || 0) * (cellWidth + gap);
              const y = (widget.y || 0) * (cellHeight + gap);
              const width = size.w * cellWidth + (size.w - 1) * gap;
              const height = size.h * cellHeight + (size.h - 1) * gap;
              
              return (
                <div
                  key={widget.id}
                  className="absolute border border-white/30 rounded bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                  title={widget.type}
                >
                  <div className="text-white drop-shadow-sm">
                    {getWidgetIcon(widget.type)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 dark:text-gray-500 text-xs">위젯 없음</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 탭 헤더 */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('popular')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'popular'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          지금 인기
        </button>
        <button
          onClick={() => setActiveTab('latest')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'latest'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          최신
        </button>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'popular' ? '인기 페이지가 아직 없습니다.' : '최신 페이지가 아직 없습니다.'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            페이지를 공개 설정하면 여기에 표시됩니다.
          </p>
        </div>
      )}

      {/* 템플릿 그리드 */}
      {!loading && templates.length > 0 && (
      <div className="grid grid-cols-4 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleGoToTemplate(template)}
            >
              {/* 썸네일 - 실제 페이지 미리보기 */}
              <div className="w-full h-32 rounded-lg mb-3 overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">
                {template.thumbnail ? (
                  <img 
                    src={template.thumbnail} 
                    alt={template.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 이미지 로드 실패 시 미리보기 렌더링
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        const preview = renderPreview(template);
                        // React.createElement를 사용하여 렌더링
                      }
                    }}
                  />
                ) : (
                  renderPreview(template)
                )}
            </div>

            {/* 템플릿 정보 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-1">
                {template.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                {template.description}
              </p>
              
              {/* 태그 */}
                {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
                )}

              {/* 통계 */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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
                    <span className="truncate max-w-[80px]">{template.author}</span>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="mt-4">
              <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGoToTemplate(template);
                  }}
                className="w-full px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                바로가기
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
