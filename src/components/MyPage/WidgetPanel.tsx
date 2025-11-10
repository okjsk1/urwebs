import React, { useState, useEffect, useMemo } from 'react';
import { X, Star, Clock, Link as LinkIcon, Search, Cloud, Sun, CloudRain, CheckSquare, BookOpen, Timer, Calendar, QrCode, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { widgetCategories, getCategoryIcon, allWidgets } from '../../constants/widgetCategories';
import { WidgetType } from '../../types/mypage.types';
import { WidgetCard } from '../ColumnsBoard/WidgetCard';

interface WidgetPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (type: WidgetType, size?: any) => void;
}

// PreviewCard는 이제 WidgetCard를 사용하므로 제거

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

  // 실제 위젯 느낌의 안전한 프리뷰 (WidgetCard 사용, 헤더 포함)
  const renderPreviewBox = (type: WidgetType, widgetName: string) => {
    const def = allWidgets.find(w => w.type === type);

    const widgetData = {
      id: `preview-${type}`,
      type: type,
      title: widgetName,
      x: 0,
      y: 0,
      width: 200,
      height: 120,
      gridSize: { w: 1, h: 1 },
      size: '1x1',
      content: {}
    };

    switch (type) {
      case 'bookmark':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="space-y-1" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              {[1,2].map(i => (
                <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded px-1.5 py-1">
                  <div className="w-4 h-4 rounded bg-gray-200" />
                  <div className="text-[10px] text-gray-800 truncate">링크 {i}</div>
                </div>
              ))}
            </div>
          </WidgetCard>
        );
      case 'exchange':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="grid grid-cols-1 gap-1 text-[10px]" style={{ pointerEvents: 'none', userSelect: 'none' }}>
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
          </WidgetCard>
        );
      case 'crypto':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="grid grid-cols-1 gap-1 text-[10px]" style={{ pointerEvents: 'none', userSelect: 'none' }}>
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
          </WidgetCard>
        );
      case 'economic_calendar':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="space-y-1 text-[10px]" style={{ pointerEvents: 'none', userSelect: 'none' }}>
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
          </WidgetCard>
        );
      case 'google_search':
      case 'naver_search':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-1.5 py-1" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              <Search className="w-3.5 h-3.5 text-gray-500" />
              <div className="text-[10px] text-gray-400">검색어를 입력하세요</div>
            </div>
          </WidgetCard>
        );
      case 'weather':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
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
            </div>
          </WidgetCard>
        );
      case 'quicknote':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="text-[11px] text-gray-700 leading-4" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              간단 메모 미리보기.
            </div>
          </WidgetCard>
        );
      case 'todo':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="space-y-1" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              {[1,2].map(i => (
                <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded px-1.5 py-1">
                  <div className="w-3 h-3 rounded border border-gray-300" />
                  <div className="text-[10px] text-gray-800 truncate">할일 {i}</div>
                </div>
              ))}
            </div>
          </WidgetCard>
        );
      case 'english_words':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="bg-white border border-gray-200 rounded p-1.5" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              <div className="text-[10px] font-semibold text-gray-900">word</div>
              <div className="text-[10px] text-gray-600 mt-0.5">단어</div>
            </div>
          </WidgetCard>
        );
      case 'timer':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="flex items-center justify-center" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              <div className="text-[16px] font-bold text-gray-900">00:00</div>
            </div>
          </WidgetCard>
        );
      case 'table':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="text-[10px] space-y-1.5" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              <div className="text-gray-400">간단한 표</div>
              <div className="rounded border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-gray-200 bg-gray-50">
                  {['항목','월','화'].map((col, idx) => (
                    <div key={idx} className="px-1.5 py-1 font-semibold text-gray-700">{col}</div>
                  ))}
                </div>
                {[
                  ['회의','10:00','14:00'],
                  ['보고서','-','13:00']
                ].map((row, idx) => (
                  <div key={idx} className="grid grid-cols-3 divide-x divide-gray-200 text-gray-700">
                    {row.map((cell, cellIdx) => (
                      <div key={cellIdx} className="px-1.5 py-1 bg-white">{cell || '-'}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </WidgetCard>
        );
      case 'calendar':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="grid grid-cols-7 gap-0.5" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              {['일','월','화','수','목','금','토'].map(d => (
                <div key={d} className="text-center">
                  <div className="text-[9px] text-gray-500">{d}</div>
                  <div className={`text-[8px] mt-0.5 ${d==='일' ? 'text-red-500' : d==='토' ? 'text-blue-500' : 'text-gray-900'}`}>1</div>
                </div>
              ))}
            </div>
          </WidgetCard>
        );
      case 'qr_code':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="flex items-center justify-center" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                <QrCode className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </WidgetCard>
        );
      case 'unified_search':
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-1.5 py-1" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              <Search className="w-3.5 h-3.5 text-gray-500" />
              <div className="text-[10px] text-gray-400">통합 검색...</div>
            </div>
          </WidgetCard>
        );
      default:
        return (
          <WidgetCard
            widget={widgetData as any}
            isEditMode={false}
            onDelete={() => {}}
            compact={true}
            showHeader={true}
            headerVariant="compact"
          >
            <div className="space-y-1 text-[10px]" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              <div className="h-2 bg-gray-200/80 rounded" />
              <div className="h-2 bg-gray-200/70 rounded w-2/3" />
            </div>
          </WidgetCard>
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
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {recentWidgets.map((widget) => {
                  const Icon = widget.icon as any;
                  return (
                    <div key={widget.type} className="relative">
                      <div 
                        className="bg-white border border-gray-200 rounded-xl transition-all shadow-sm relative cursor-pointer hover:shadow-md hover:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1"
                        onClick={() => {
                          const addWithColumn = (window as any).__addWidgetWithColumn;
                          if (addWithColumn) {
                            addWithColumn(widget.type, '1x1');
                          } else {
                            onAddWidget(widget.type, '1x1');
                          }
                          onClose();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            const addWithColumn = (window as any).__addWidgetWithColumn;
                            if (addWithColumn) {
                              addWithColumn(widget.type, '1x1');
                            } else {
                              onAddWidget(widget.type, '1x1');
                            }
                            onClose();
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`${widget.name} 위젯 추가`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(widget.type);
                          }}
                          className={`absolute top-1 right-1 p-1 hover:bg-gray-100 rounded transition-colors z-10 ${favorites.includes(widget.type) ? 'text-yellow-500' : 'text-gray-300'}`}
                          aria-label={favorites.includes(widget.type) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                        >
                          <Star className={`w-3.5 h-3.5 ${favorites.includes(widget.type) ? 'fill-yellow-500' : ''}`} />
                        </button>
                        {renderPreviewBox(widget.type, widget.name)}
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
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {favoriteWidgets.map((widget) => {
                  const Icon = widget.icon as any;
                  return (
                    <div key={widget.type} className="relative">
                      <div 
                        className="bg-white border border-gray-200 rounded-xl transition-all shadow-sm relative cursor-pointer hover:shadow-md hover:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1"
                        onClick={() => {
                          const addWithColumn = (window as any).__addWidgetWithColumn;
                          if (addWithColumn) {
                            addWithColumn(widget.type, '1x1');
                          } else {
                            onAddWidget(widget.type, '1x1');
                          }
                          onClose();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            const addWithColumn = (window as any).__addWidgetWithColumn;
                            if (addWithColumn) {
                              addWithColumn(widget.type, '1x1');
                            } else {
                              onAddWidget(widget.type, '1x1');
                            }
                            onClose();
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`${widget.name} 위젯 추가`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(widget.type);
                          }}
                          className="absolute top-1 right-1 p-1 hover:bg-gray-100 rounded transition-colors z-10 text-yellow-500"
                          aria-label="즐겨찾기 해제"
                        >
                          <Star className="w-3.5 h-3.5 fill-yellow-500" />
                        </button>
                        {renderPreviewBox(widget.type, widget.name)}
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
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {category.widgets.map((widget) => {
                  const Icon = widget.icon as any;
                  const isFavorite = favorites.includes(widget.type);
                  return (
                    <div key={widget.type} className="relative">
                      <div 
                        className="bg-white border border-gray-200 rounded-xl transition-all shadow-sm relative cursor-pointer hover:shadow-md hover:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1"
                        onClick={() => {
                          const addWithColumn = (window as any).__addWidgetWithColumn;
                          if (addWithColumn) {
                            addWithColumn(widget.type, '1x1');
                          } else {
                            onAddWidget(widget.type, '1x1');
                          }
                          onClose();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            const addWithColumn = (window as any).__addWidgetWithColumn;
                            if (addWithColumn) {
                              addWithColumn(widget.type, '1x1');
                            } else {
                              onAddWidget(widget.type, '1x1');
                            }
                            onClose();
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`${widget.name} 위젯 추가`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(widget.type);
                          }}
                          className={`absolute top-1 right-1 p-1 hover:bg-gray-100 rounded transition-colors z-10 ${isFavorite ? 'text-yellow-500' : 'text-gray-300'}`}
                          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-yellow-500' : ''}`} />
                        </button>
                        {renderPreviewBox(widget.type, widget.name)}
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




