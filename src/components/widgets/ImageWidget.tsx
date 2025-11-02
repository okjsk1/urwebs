// Image/PhotoFrame 위젯 - 사진을 예쁘게 표시하는 위젯
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Image as ImageIcon, Upload, X, ChevronLeft, ChevronRight, 
  Play, Pause, Settings, Trash2, Edit2, Maximize2, RotateCw,
  GripVertical, Plus, Link as LinkIcon, Copy
} from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal } from './utils/widget-helpers';
import { trackEvent } from '../../utils/analytics';
import { createPortal } from 'react-dom';

// nanoid 대신 간단한 ID 생성 함수 사용
const generateId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 타입 정의
export interface PhotoItem {
  id: string;
  src: string; // blob URL or https URL
  caption?: string;
  createdAt: number;
}

export interface ImageWidgetState {
  items: PhotoItem[];
  mode: 'single' | 'slideshow';
  activeIndex: number;
  objectFit: 'cover' | 'contain' | 'fill';
  rounded: 'none' | 'md' | 'xl' | 'full';
  showCaption: boolean;
  showShadow: boolean;
  borderStyle: 'none' | 'subtle' | 'strong';
  autoplay: boolean;
  intervalMs: number;
  pauseOnHover: boolean;
  bgBlur: boolean;
  grayscale: boolean;
  muteGestures: boolean;
  lastUpdated: number;
}

const DEFAULT_STATE: ImageWidgetState = {
  items: [],
  mode: 'single',
  activeIndex: 0,
  objectFit: 'cover',
  rounded: 'xl',
  showCaption: false,
  showShadow: true,
  borderStyle: 'subtle',
  autoplay: false,
  intervalMs: 5000,
  pauseOnHover: true,
  bgBlur: false,
  grayscale: false,
  muteGestures: false,
  lastUpdated: Date.now()
};

export const ImageWidget = ({ widget, isEditMode, updateWidget }: WidgetProps) => {
  const [state, setState] = useState<ImageWidgetState>(() => {
    const saved = readLocal(widget.id, DEFAULT_STATE);
    // 기본값 병합
    return {
      ...DEFAULT_STATE,
      ...saved,
      items: saved.items || [],
      activeIndex: saved.activeIndex ?? 0
    };
  });

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const slideshowTimerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  
  const widgetSize = useMemo(() => {
    const gridSize = (widget as any).gridSize;
    if (gridSize) {
      return { w: gridSize.w || 1, h: gridSize.h || 1 };
    }
    const size = (widget as any).size || '1x1';
    const [w, h] = size.split('x').map(Number);
    return { w: w || 1, h: h || 1 };
  }, [(widget as any).gridSize, (widget as any).size]);
  
  const isCompact = widgetSize.w === 1 && widgetSize.h === 1;

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  // 슬라이드쇼 자동 재생
  useEffect(() => {
    if (state.mode === 'slideshow' && state.autoplay && state.items.length > 1 && !isEditMode && !isLightboxOpen) {
      slideshowTimerRef.current = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          activeIndex: (prev.activeIndex + 1) % prev.items.length
        }));
      }, state.intervalMs);
      
      return () => {
        if (slideshowTimerRef.current) {
          clearInterval(slideshowTimerRef.current);
          slideshowTimerRef.current = null;
        }
      };
    } else {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
        slideshowTimerRef.current = null;
      }
    }
  }, [state.mode, state.autoplay, state.items.length, state.intervalMs, isEditMode, isLightboxOpen]);

  // 메모리 정리 (blob URL 해제)
  useEffect(() => {
    return () => {
      state.items.forEach(item => {
        if (item.src.startsWith('blob:')) {
          URL.revokeObjectURL(item.src);
        }
      });
    };
  }, [state.items]);

  // 파일 업로드 처리
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const MAX_FILES = 20;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/') || !ALLOWED_TYPES.includes(file.type)) {
        continue;
      }
      if (file.size > MAX_SIZE) {
        continue;
      }
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) return;
    if (state.items.length + validFiles.length > MAX_FILES) {
      alert(`최대 ${MAX_FILES}장까지 업로드 가능합니다.`);
      return;
    }
    
    setIsUploading(true);
    const newItems: PhotoItem[] = [];
    
    try {
      for (const file of validFiles) {
        // EXIF 방향 보정은 간단히 pass (필요시 createImageBitmap 사용 가능)
        const blobUrl = URL.createObjectURL(file);
        newItems.push({
          id: generateId(),
          src: blobUrl,
          caption: '',
          createdAt: Date.now()
        });
      }
      
      setState(prev => ({
        ...prev,
        items: [...prev.items, ...newItems],
        lastUpdated: Date.now()
      }));
      
      trackEvent('image_widget_upload', { count: validFiles.length });
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  }, [state.items.length]);

  // URL로 추가
  const handleAddByUrl = useCallback(() => {
    const url = urlInputRef.current?.value?.trim();
    if (!url || !url.startsWith('https://')) {
      alert('올바른 URL을 입력하세요 (https://로 시작)');
      return;
    }
    
    const newItem: PhotoItem = {
      id: generateId(),
      src: url,
      caption: '',
      createdAt: Date.now()
    };
    
    setState(prev => ({
      ...prev,
      items: [...prev.items, newItem],
      lastUpdated: Date.now()
    }));
    
    if (urlInputRef.current) urlInputRef.current.value = '';
    trackEvent('image_widget_add_by_url');
  }, []);

  // 클립보드 붙여넣기
  useEffect(() => {
    if (!isEditMode) return;
    
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      
      if (files.length > 0) {
        handleFileUpload(files as any);
      }
    };
    
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isEditMode, handleFileUpload]);

  // 이미지 삭제
  const handleDelete = useCallback((id: string) => {
    setState(prev => {
      const item = prev.items.find(i => i.id === id);
      if (item?.src.startsWith('blob:')) {
        URL.revokeObjectURL(item.src);
      }
      return {
        ...prev,
        items: prev.items.filter(i => i.id !== id),
        activeIndex: prev.activeIndex >= prev.items.length - 1 
          ? Math.max(0, prev.items.length - 2)
          : prev.activeIndex,
        lastUpdated: Date.now()
      };
    });
    trackEvent('image_widget_delete', { id });
  }, []);

  // 이미지 순서 변경 (드래그&드롭)
  const handleDragStart = (id: string) => {
    setIsDragging(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (isDragging && isDragging !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!isDragging || isDragging === targetId) return;
    
    const items = [...state.items];
    const dragIndex = items.findIndex(i => i.id === isDragging);
    const targetIndex = items.findIndex(i => i.id === targetId);
    
    if (dragIndex === -1 || targetIndex === -1) return;
    
    const [removed] = items.splice(dragIndex, 1);
    items.splice(targetIndex, 0, removed);
    
    setState(prev => ({
      ...prev,
      items,
      lastUpdated: Date.now()
    }));
    
    setIsDragging(null);
    setDragOverId(null);
    trackEvent('image_widget_reorder');
  };

  // 이전/다음 이미지
  const goPrevious = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeIndex: prev.activeIndex > 0 ? prev.activeIndex - 1 : prev.items.length - 1
    }));
  }, []);

  const goNext = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeIndex: (prev.activeIndex + 1) % prev.items.length
    }));
  }, []);

  // 라이트박스 열기
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
    trackEvent('image_widget_view_lightbox');
  }, []);

  // 라이트박스 닫기
  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);

  // 라이트박스 키보드 내비게이션
  useEffect(() => {
    if (!isLightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => prev > 0 ? prev - 1 : state.items.length - 1);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => (prev + 1) % state.items.length);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, state.items.length, closeLightbox]);

  // 설정 토글
  const toggleSetting = useCallback((key: keyof ImageWidgetState, value: any) => {
    setState(prev => ({
      ...prev,
      [key]: value,
      lastUpdated: Date.now()
    }));
    trackEvent('image_widget_toggle', { key, value });
  }, []);

  // 현재 표시할 이미지
  const currentItem = state.items[state.activeIndex];
  
  // 스타일 계산
  const roundedClass = {
    none: 'rounded-none',
    md: 'rounded-md',
    xl: 'rounded-xl',
    full: 'rounded-full'
  }[state.rounded];

  const borderClass = {
    none: '',
    subtle: 'border border-gray-200 dark:border-[var(--border)]',
    strong: 'border-2 border-gray-300 dark:border-[var(--border)]'
  }[state.borderStyle];

  const shadowClass = state.showShadow ? 'shadow-md' : '';
  const objectFitClass = `object-${state.objectFit}`;

  if (!currentItem && state.items.length === 0) {
    // 빈 상태
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        {isEditMode ? (
          <>
            <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 mb-4">사진을 추가하세요</p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                파일 선택
              </button>
              <div className="flex gap-2">
                <input
                  ref={urlInputRef}
                  type="text"
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddByUrl()}
                />
                <button
                  onClick={handleAddByUrl}
                  className="px-4 py-2 bg-gray-100 dark:bg-[var(--input-background)] text-gray-700 dark:text-[var(--foreground)] rounded-lg hover:bg-gray-200 dark:hover:bg-[var(--accent)] transition-colors text-sm flex items-center gap-1"
                >
                  <LinkIcon className="w-4 h-4" />
                  추가
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Ctrl+V로 클립보드 이미지 붙여넣기 가능</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </>
        ) : (
          <>
            <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">표시할 사진이 없습니다</p>
          </>
        )}
      </div>
    );
  }

  if (!currentItem) return null;

  return (
    <div 
      ref={containerRef}
      className="h-full flex flex-col overflow-hidden"
      onMouseEnter={() => {
        if (state.mode === 'slideshow' && state.pauseOnHover && slideshowTimerRef.current) {
          clearInterval(slideshowTimerRef.current);
          slideshowTimerRef.current = null;
        }
      }}
      onMouseLeave={() => {
        if (state.mode === 'slideshow' && state.autoplay && state.items.length > 1 && !isEditMode) {
          slideshowTimerRef.current = window.setInterval(() => {
            setState(prev => ({
              ...prev,
              activeIndex: (prev.activeIndex + 1) % prev.items.length
            }));
          }, state.intervalMs);
        }
      }}
    >
      {/* 편집 모드: 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* 메인 이미지 표시 영역 */}
      <div 
        className={`flex-1 relative ${state.bgBlur ? 'backdrop-blur-sm' : ''} ${state.grayscale ? 'grayscale' : ''}`}
        style={{ 
          filter: state.grayscale ? 'grayscale(100%)' : 'none',
          minHeight: 0 
        }}
      >
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-10">
            <div className="text-sm text-gray-600 dark:text-[var(--foreground)]">업로드 중...</div>
          </div>
        )}

        <img
          src={currentItem.src}
          alt={currentItem.caption || '사진'}
          className={`w-full h-full ${objectFitClass} ${roundedClass} ${borderClass} ${shadowClass} transition-all duration-300 ${!state.muteGestures ? 'cursor-pointer' : ''}`}
          loading="lazy"
          onError={(e) => {
            console.error('이미지 로드 실패:', currentItem.src);
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y3RjNGNiIvPgo8cGF0aCBkPSJNMTYgMTBMMTIgMThIMjBMMTYgMTBaIiBmaWxsPSIjNkI3MjgwIi8+Cjwvc3ZnPgo=';
          }}
          onClick={() => !isEditMode && openLightbox(state.activeIndex)}
          draggable={false}
        />

        {/* 네비게이션 버튼 (hover 시 표시) */}
        {!isEditMode && state.items.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrevious();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity z-10"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity z-10"
              aria-label="다음 이미지"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* 인디케이터 (슬라이드쇼 모드) */}
        {!isEditMode && state.mode === 'slideshow' && state.items.length > 1 && !isCompact && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {state.items.map((_, index) => (
              <button
                key={index}
                onClick={() => setState(prev => ({ ...prev, activeIndex: index }))}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === state.activeIndex 
                    ? 'bg-white' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`이미지 ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* 캡션 (하단) */}
        {state.showCaption && currentItem.caption && (
          <div className={`absolute bottom-0 left-0 right-0 bg-black/60 text-white ${isCompact ? 'text-[10px] px-1.5 py-1' : 'text-xs px-3 py-2'} rounded-b-xl`}>
            <p className="truncate">{currentItem.caption}</p>
          </div>
        )}
      </div>

      {/* 편집 모드: 설정 패널 */}
      {isEditMode && (
        <div className="border-t border-gray-200 dark:border-[var(--border)] bg-white dark:bg-[var(--card)] p-2 space-y-2 max-h-40 overflow-y-auto scrollbar-none">
          {/* 기본 설정 */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-[var(--accent)] rounded transition-colors"
              title="설정"
            >
              <Settings className="w-4 h-4" />
            </button>
            <span className="text-gray-500 dark:text-[var(--muted-foreground)]">
              {state.items.length}장
            </span>
            {state.items.length > 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="ml-auto px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-3 h-3 inline mr-1" />
                추가
              </button>
            )}
          </div>

          {/* 설정 패널 (확장) */}
          {showSettings && (
            <div className="space-y-2 text-xs border-t pt-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={state.showCaption}
                    onChange={(e) => toggleSetting('showCaption', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>캡션 표시</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={state.showShadow}
                    onChange={(e) => toggleSetting('showShadow', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>그림자</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={state.bgBlur}
                    onChange={(e) => toggleSetting('bgBlur', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>배경 블러</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={state.grayscale}
                    onChange={(e) => toggleSetting('grayscale', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>그레이스케일</span>
                </label>
              </div>

              {state.items.length > 1 && (
                <>
                  <div>
                    <label className="block text-xs mb-1">모드</label>
                    <select
                      value={state.mode}
                      onChange={(e) => toggleSetting('mode', e.target.value)}
                      className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-[var(--input-background)] text-gray-900 dark:text-[var(--foreground)]"
                    >
                      <option value="single">단일</option>
                      <option value="slideshow">슬라이드쇼</option>
                    </select>
                  </div>

                  {state.mode === 'slideshow' && (
                    <>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={state.autoplay}
                          onChange={(e) => toggleSetting('autoplay', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span>자동 재생</span>
                      </label>
                      {state.autoplay && (
                        <div>
                          <label className="block text-xs mb-1">간격 (초)</label>
                          <input
                            type="range"
                            min="3"
                            max="20"
                            value={state.intervalMs / 1000}
                            onChange={(e) => toggleSetting('intervalMs', Number(e.target.value) * 1000)}
                            className="w-full"
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs mb-1">모서리</label>
                <select
                  value={state.rounded}
                  onChange={(e) => toggleSetting('rounded', e.target.value)}
                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-[var(--input-background)]"
                >
                  <option value="none">없음</option>
                  <option value="md">보통</option>
                  <option value="xl">둥글게</option>
                  <option value="full">원형</option>
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1">테두리</label>
                <select
                  value={state.borderStyle}
                  onChange={(e) => toggleSetting('borderStyle', e.target.value)}
                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-[var(--input-background)]"
                >
                  <option value="none">없음</option>
                  <option value="subtle">얇게</option>
                  <option value="strong">굵게</option>
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1">비율 조정</label>
                <select
                  value={state.objectFit}
                  onChange={(e) => toggleSetting('objectFit', e.target.value)}
                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-[var(--input-background)]"
                >
                  <option value="cover">커버</option>
                  <option value="contain">포함</option>
                  <option value="fill">채우기</option>
                </select>
              </div>
            </div>
          )}

          {/* 이미지 목록 (편집 모드) */}
          {state.items.length > 0 && (
            <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-none">
              {state.items.map((item, index) => (
                <div
                  key={item.id}
                  draggable={isEditMode}
                  onDragStart={() => handleDragStart(item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDrop={(e) => handleDrop(e, item.id)}
                  className={`flex items-center gap-2 p-1.5 rounded border border-gray-200 dark:border-[var(--border)] bg-white dark:bg-[var(--input-background)] ${
                    dragOverId === item.id ? 'ring-2 ring-blue-500' : ''
                  } ${index === state.activeIndex ? 'bg-blue-50 dark:bg-[var(--accent)]' : ''}`}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <img
                    src={item.src}
                    alt="썸네일"
                    className="w-8 h-8 object-cover rounded"
                    loading="lazy"
                  />
                  <input
                    type="text"
                    value={item.caption || ''}
                    onChange={(e) => {
                      setState(prev => ({
                        ...prev,
                        items: prev.items.map(i => 
                          i.id === item.id ? { ...i, caption: e.target.value } : i
                        ),
                        lastUpdated: Date.now()
                      }));
                    }}
                    placeholder="캡션..."
                    className="flex-1 px-2 py-0.5 text-xs border rounded bg-white dark:bg-[var(--card)] text-gray-900 dark:text-[var(--foreground)]"
                  />
                  <button
                    onClick={() => {
                      setState(prev => ({ ...prev, activeIndex: index }));
                    }}
                    className={`p-1 rounded ${index === state.activeIndex ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-[var(--accent)] text-gray-600 dark:text-[var(--foreground)]'}`}
                    title="선택"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 라이트박스 모달 */}
      {isLightboxOpen && createPortal(
        <div
          ref={lightboxRef}
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="이미지 확대 보기"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-10"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>

          {state.items[lightboxIndex] && (
            <>
              <img
                src={state.items[lightboxIndex].src}
                alt={state.items[lightboxIndex].caption || '확대된 이미지'}
                className="max-w-[90vw] max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              {state.items.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(prev => prev > 0 ? prev - 1 : state.items.length - 1);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                    aria-label="이전 이미지"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(prev => (prev + 1) % state.items.length);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                    aria-label="다음 이미지"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {state.items[lightboxIndex].caption && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg max-w-[80vw]">
                  <p>{state.items[lightboxIndex].caption}</p>
                </div>
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
