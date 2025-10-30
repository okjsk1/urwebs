import React, { useState, useEffect, useMemo } from 'react';
import { X, Star, Clock, Link as LinkIcon, Search, Cloud, Sun, CloudRain } from 'lucide-react';
import { Button } from '../ui/button';
import { widgetCategories, getCategoryIcon, allWidgets } from '../../constants/widgetCategories';
import { WidgetType } from '../../types/mypage.types';

interface WidgetPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (type: WidgetType, size?: any) => void;
}

function PreviewCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden h-28">
      <div className="flex items-center justify-between h-8 px-3 border-b bg-white/80">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-xs font-semibold text-gray-900 truncate">{title}</h3>
        </div>
      </div>
      <div className="p-2 h-[calc(100%-2rem)] overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}

export function WidgetPanel({ isOpen, onClose, onAddWidget }: WidgetPanelProps) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('widget_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('widget_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (widgetType: string) => {
    setFavorites(prev => 
      prev.includes(widgetType) 
        ? prev.filter(t => t !== widgetType)
        : [...prev, widgetType]
    );
  };

  // 실제 위젯 느낌의 안전한 프리뷰 (PreviewCard 사용)
  const renderPreviewBox = (type: WidgetType) => {
    const def = allWidgets.find(w => w.type === type);

    const shellIcon = (
      <span className="w-4 h-4">
        {typeof def?.icon === 'string' ? def?.icon : <LinkIcon className="w-4 h-4 text-blue-600" />}
      </span>
    );

    switch (type) {
      case 'bookmark':
        return (
          <div className="mt-2">
            <PreviewCard icon={shellIcon} title={def?.name || '위젯'}>
              <div className="space-y-1">
                {[1,2].map(i => (
                  <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded px-1.5 py-1">
                    <div className="w-4 h-4 rounded bg-gray-200" />
                    <div className="text-[10px] text-gray-800 truncate">링크 {i}</div>
                  </div>
                ))}
              </div>
            </PreviewCard>
          </div>
        );
      case 'exchange':
        return (
          <div className="mt-2">
            <PreviewCard icon={shellIcon} title={def?.name || '위젯'}>
              <div className="grid grid-cols-1 gap-1 text-[10px]">
                {[
                  ['USD/KRW','1,353.2'],
                  ['EUR/KRW','1,438.5']
                ].map(([pair, price]) => (
                  <div key={pair} className="flex items-center justify-between bg-white border border-gray-200 rounded px-1.5 py-1">
                    <span className="text-gray-700">{pair}</span>
                    <span className="font-semibold text-gray-900">{price}</span>
                  </div>
                ))}
              </div>
            </PreviewCard>
          </div>
        );
      case 'crypto':
        return (
          <div className="mt-2">
            <PreviewCard icon={shellIcon} title={def?.name || '위젯'}>
              <div className="grid grid-cols-1 gap-1 text-[10px]">
                {[
                  ['BTC','104.5M'],
                  ['ETH','3.75M']
                ].map(([sym, price]) => (
                  <div key={sym} className="flex items-center justify-between bg-white border border-gray-200 rounded px-1.5 py-1">
                    <span className="text-gray-700">{sym}</span>
                    <span className="font-semibold text-gray-900">{price}</span>
                  </div>
                ))}
              </div>
            </PreviewCard>
          </div>
        );
      case 'economic_calendar':
        return (
          <div className="mt-2">
            <PreviewCard icon={shellIcon} title={def?.name || '위젯'}>
              <div className="space-y-1 text-[10px]">
                {[
                  ['비농업고용', '예상 18만'],
                  ['한국 금리', '현재 3.50%']
                ].map(([title, sub], idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded p-1.5">
                    <div className="font-medium text-gray-900 truncate">{title}</div>
                    <div className="text-[10px] text-gray-500 truncate">{sub}</div>
                  </div>
                ))}
              </div>
            </PreviewCard>
          </div>
        );
      case 'google_search':
      case 'naver_search':
        return (
          <div className="mt-2">
            <PreviewCard icon={<Search className="w-4 h-4 text-blue-600" />} title={def?.name || '검색'}>
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-1.5 py-1">
                <Search className="w-3.5 h-3.5 text-gray-500" />
                <div className="text-[10px] text-gray-400">검색어를 입력하세요</div>
              </div>
            </PreviewCard>
          </div>
        );
      case 'weather':
        return (
          <div className="mt-2">
            <PreviewCard icon={<Cloud className="w-4 h-4 text-blue-600" />} title={def?.name || '날씨'}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-yellow-500" />
                  <div className="text-[11px] font-semibold text-gray-900">15°C</div>
                </div>
                <div className="text-[10px] text-gray-500">서울</div>
              </div>
              <div className="mt-1 grid grid-cols-3 gap-1 text-[10px] text-gray-600">
                {['맑음','구름','비'].map((t, i) => (
                  <div key={i} className="flex items-center gap-1 bg-white border border-gray-200 rounded px-1 py-0.5">
                    {i===2 ? <CloudRain className="w-3 h-3 text-blue-500" /> : <Sun className="w-3 h-3 text-yellow-500" />}
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </PreviewCard>
          </div>
        );
      case 'quicknote':
        return (
          <div className="mt-2">
            <PreviewCard icon={shellIcon} title={def?.name || '위젯'}>
              <div className="text-[11px] text-gray-700 leading-4">
                간단 메모 미리보기.
              </div>
            </PreviewCard>
          </div>
        );
      default:
        return (
          <div className="mt-2">
            <PreviewCard icon={shellIcon} title={def?.name || '위젯'}>
              <div className="space-y-1 text-[10px]">
                <div className="h-2 bg-gray-200/80 rounded" />
                <div className="h-2 bg-gray-200/70 rounded w-2/3" />
              </div>
            </PreviewCard>
          </div>
        );
    }
  };

  // 최근 사용한 위젯 가져오기
  const recentWidgets = useMemo(() => {
    const stored = localStorage.getItem('recentWidgets');
    if (!stored) return [];
    const types = JSON.parse(stored);
    return allWidgets.filter(w => types.includes(w.type));
  }, []);

  const favoriteWidgets = allWidgets.filter(w => favorites.includes(w.type));
  const otherWidgets = allWidgets.filter(w => !favorites.includes(w.type));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999]">
      {/* 바깥 클릭 닫기 오버레이 */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-blue-500 shadow-2xl max-h-[60vh] overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">위젯 추가</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* 최근 사용한 위젯 섹션 */}
          {recentWidgets.length > 0 && (
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <h4 className="text-base font-semibold text-gray-800">최근 사용</h4>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {recentWidgets.map((widget) => {
                  const Icon = widget.icon as any;
                  return (
                    <div key={widget.type} className="relative">
                      <div className="p-2 bg-white border border-gray-200 rounded-xl transition-all shadow-sm relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(widget.type);
                          }}
                          className={`absolute top-2 right-2 p-1 hover:bg-gray-100 rounded transition-colors z-10 ${favorites.includes(widget.type) ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          <Star className={`w-4 h-4 ${favorites.includes(widget.type) ? 'fill-yellow-500' : ''}`} />
                        </button>
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            const addWithColumn = (window as any).__addWidgetWithColumn;
                            if (addWithColumn) {
                              addWithColumn(widget.type, '1x1');
                            } else {
                              onAddWidget(widget.type, '1x1');
                            }
                            onClose();
                          }}
                        >
                          <div className="text-xl text-gray-600">
                            {typeof Icon === 'string' ? Icon : <Icon className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-medium text-gray-800 truncate">{widget.name}</div>
                            <div className="text-[10px] text-gray-500 truncate mt-0.5">{widget.description}</div>
                          </div>
                        </div>
                        {renderPreviewBox(widget.type)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 즐겨찾기 위젯 섹션 */}
          {favoriteWidgets.length > 0 && (
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <h4 className="text-base font-semibold text-gray-800">즐겨찾기</h4>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {favoriteWidgets.map((widget) => {
                  const Icon = widget.icon as any;
                  return (
                    <div key={widget.type} className="relative">
                      <div className="p-2 bg-white border border-gray-200 rounded-xl transition-all shadow-sm relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(widget.type);
                          }}
                          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded z-10"
                        >
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        </button>
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            const addWithColumn = (window as any).__addWidgetWithColumn;
                            if (addWithColumn) {
                              addWithColumn(widget.type, '1x1');
                            } else {
                              onAddWidget(widget.type, '1x1');
                            }
                            onClose();
                          }}
                        >
                          <div className="text-xl text-gray-600">
                            {typeof Icon === 'string' ? Icon : <Icon className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-medium text-gray-800 truncate">{widget.name}</div>
                            <div className="text-[10px] text-gray-500 truncate mt-0.5">{widget.description}</div>
                          </div>
                        </div>
                        {renderPreviewBox(widget.type)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 전체 위젯 섩션 */}
          {Object.entries(widgetCategories).map(([categoryKey, category]) => (
            <div key={categoryKey} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-lg">{getCategoryIcon(categoryKey)}</div>
                <h4 className="text-base font-semibold text-gray-800">{category.name}</h4>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {category.widgets.map((widget) => {
                  const Icon = widget.icon as any;
                  const isFavorite = favorites.includes(widget.type);
                  return (
                    <div key={widget.type} className="relative">
                      <div className="p-2 bg-white border border-gray-200 rounded-xl transition-all shadow-sm relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(widget.type);
                          }}
                          className={`absolute top-2 right-2 p-1 hover:bg-gray-100 rounded transition-colors z-10 ${isFavorite ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500' : ''}`} />
                        </button>
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            const addWithColumn = (window as any).__addWidgetWithColumn;
                            if (addWithColumn) {
                              addWithColumn(widget.type, '1x1');
                            } else {
                              onAddWidget(widget.type, '1x1');
                            }
                            onClose();
                          }}
                        >
                          <div className="text-xl text-gray-600">
                            {typeof Icon === 'string' ? Icon : <Icon className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-medium text-gray-800 truncate">{widget.name}</div>
                            <div className="text-[10px] text-gray-500 truncate mt-0.5">{widget.description}</div>
                          </div>
                        </div>
                        {renderPreviewBox(widget.type)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}




