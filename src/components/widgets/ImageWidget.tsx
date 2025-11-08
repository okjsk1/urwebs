// Image/PhotoFrame 위젯 - 사진을 예쁘게 표시하는 위젯
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Image as ImageIcon,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  Plus,
  Settings,
  Link as LinkIcon
} from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';
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
  objectFit: 'contain',
  rounded: 'xl',
  showCaption: false,
  showShadow: false,
  borderStyle: 'none',
  autoplay: false,
  intervalMs: 5000,
  pauseOnHover: true,
  bgBlur: false,
  grayscale: false,
  muteGestures: false,
  lastUpdated: Date.now()
};

export const ImageWidget = ({ widget, isEditMode, updateWidget }: WidgetProps) => {
  const [state, setState] = useState(() => {
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [isDropActive, setIsDropActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  
  const fileInputRef = useRef(null);
  const urlInputRef = useRef(null);
  const slideshowTimerRef = useRef(null as any);
  const containerRef = useRef(null);
  const lightboxRef = useRef(null);
  const persistTimerRef = useRef(null as any);
  
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
  const [isWideLayout, setIsWideLayout] = useState(false);

  // 실제 렌더 박스의 가로/세로를 기준으로 와이드 여부 판단
  useEffect(() => {
    const el = containerRef.current as any;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setIsWideLayout(rect.width > rect.height);
    };
    update();

    const ResizeObs = (window as any).ResizeObserver;
    const ro = ResizeObs ? new ResizeObs(() => update()) : null;
    if (ro) ro.observe(el);

    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      if (ro && el) ro.unobserve(el);
    };
  }, []);

  // 상태 저장 (300ms 디바운스, 핵심 키 변경 시만)
  useEffect(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }
    persistTimerRef.current = window.setTimeout(() => {
      persistOrLocal(widget.id, state, updateWidget);
    }, 300);

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
    };
  }, [
    widget.id,
    updateWidget,
    state.items,
    state.mode,
    state.activeIndex,
    state.objectFit,
    state.rounded,
    state.showCaption,
    state.showShadow,
    state.borderStyle,
    state.autoplay,
    state.intervalMs,
    state.pauseOnHover,
    state.bgBlur,
    state.grayscale,
    state.muteGestures
  ]);

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

  // 파일 업로드 처리 (유형 검증 완화 + HEIC/HEIF 안내 + 로깅)
  const handleFileUpload = useCallback(async (filesInput: File[] | FileList | null) => {
    const list = filesInput ? Array.from(filesInput as any) as File[] : [];
    if (!list.length) return;

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    let selectedFile: File | null = null;

    for (const file of list) {
      if (!file.type || !file.type.startsWith('image/')) {
        console.warn('[ImageWidget] rejected non-image', file);
        showToast(`이미지 파일이 아닙니다 (${file.name})`, 'error');
        continue;
      }
      if (/image\/heic|image\/heif/i.test(file.type)) {
        console.warn('[ImageWidget] non-previewable (HEIC/HEIF?)', file.type);
        showToast('HEIC/HEIF는 브라우저 미리보기가 어려워요. JPG/PNG/WebP로 변환해 주세요.', 'info');
        continue;
      }
      if (file.size > MAX_SIZE) {
        console.warn('[ImageWidget] oversized', file.size);
        showToast(`파일이 너무 큽니다 (${file.name}). 최대 10MB`, 'error');
        continue;
      }
      selectedFile = file;
      break;
    }

    if (!selectedFile) {
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: 1, percentage: 0 });

    try {
      const blobUrl = URL.createObjectURL(selectedFile);

      setUploadProgress({ current: 1, total: 1, percentage: 100 });

      setState(prev => {
        const prevItem = prev.items[0];
        if (prevItem?.src.startsWith('blob:')) {
          try { URL.revokeObjectURL(prevItem.src); } catch {}
        }

        return {
          ...prev,
          items: [{
            id: generateId(),
            src: blobUrl,
            caption: prevItem?.caption || '',
            createdAt: Date.now()
          }],
          activeIndex: 0,
          lastUpdated: Date.now()
        };
      });

      trackEvent('image_widget_upload', { count: 1 });
      showToast('사진이 업데이트되었습니다.', 'success');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      showToast('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0, percentage: 0 });
    }
  }, []);

  // 유틸: 이미지 로드
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // 회전 (90도 단위)
  const rotateImage = useCallback(async (item: PhotoItem, degree: number) => {
    try {
      const img = await loadImage(item.src);
      const rad = (degree * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const newW = Math.floor(img.width * cos + img.height * sin);
      const newH = Math.floor(img.width * sin + img.height * cos);
      const canvas = document.createElement('canvas');
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');
      ctx.translate(newW / 2, newH / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      const blob: Blob | null = await new Promise(res => canvas.toBlob(b => res(b), 'image/jpeg', 0.92));
      if (!blob) throw new Error('Image export failed');
      const newUrl = URL.createObjectURL(blob);
      setState(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === item.id ? { ...i, src: newUrl } : i),
        lastUpdated: Date.now()
      }));
      if (item.src.startsWith('blob:')) URL.revokeObjectURL(item.src);
      showToast('이미지를 회전했어요.', 'success');
    } catch (e) {
      console.error(e);
      showToast('회전에 실패했습니다.', 'error');
    }
  }, []);

  // 중앙 정사각형 크롭
  const cropImageCenterSquare = useCallback(async (item: PhotoItem) => {
    try {
      const img = await loadImage(item.src);
      const size = Math.min(img.width, img.height);
      const sx = Math.floor((img.width - size) / 2);
      const sy = Math.floor((img.height - size) / 2);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');
      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
      const blob: Blob | null = await new Promise(res => canvas.toBlob(b => res(b), 'image/jpeg', 0.92));
      if (!blob) throw new Error('Image export failed');
      const newUrl = URL.createObjectURL(blob);
      setState(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === item.id ? { ...i, src: newUrl } : i),
        lastUpdated: Date.now()
      }));
      if (item.src.startsWith('blob:')) URL.revokeObjectURL(item.src);
      showToast('이미지를 크롭했어요.', 'success');
    } catch (e) {
      console.error(e);
      showToast('크롭에 실패했습니다.', 'error');
    }
  }, []);

  // 선택/일괄 기능 제거됨

  // URL로 추가
  const handleAddByUrl = useCallback(() => {
    const url = urlInputRef.current?.value?.trim();
    if (!url || !url.startsWith('https://')) {
      showToast('올바른 URL을 입력하세요 (https://로 시작)', 'error');
      return;
    }
    if (state.items.some(i => i.src === url)) {
      showToast('이미 추가된 이미지 URL입니다.', 'info');
      return;
    }
    
    const newItem: PhotoItem = {
      id: generateId(),
      src: url,
      caption: '',
      createdAt: Date.now()
    };
    
    setState(prev => {
      const prevItem = prev.items[0];
      if (prevItem?.src.startsWith('blob:')) {
        try { URL.revokeObjectURL(prevItem.src); } catch {}
      }
      return {
        ...prev,
        items: [newItem],
        activeIndex: 0,
        lastUpdated: Date.now()
      };
    });
    
    if (urlInputRef.current) urlInputRef.current.value = '';
    showToast('사진이 업데이트되었습니다.', 'success');
    trackEvent('image_widget_add_by_url');
  }, []);

  // Alt+클릭용 빠른 URL 추가 (prompt)
  const handleQuickAddByUrl = useCallback(() => {
    const input = window.prompt('이미지 URL을 입력하세요 (https://...)');
    const url = (input || '').trim();
    if (!url) return;
    if (!url.startsWith('https://')) {
      showToast('https로 시작하는 올바른 URL을 입력하세요.', 'error');
      return;
    }
    if (state.items.some(i => i.src === url)) {
      showToast('이미 추가된 이미지 URL입니다.', 'info');
      return;
    }
    const newItem: PhotoItem = { id: generateId(), src: url, caption: '', createdAt: Date.now() };
    setState(prev => {
      const prevItem = prev.items[0];
      if (prevItem?.src.startsWith('blob:')) {
        try { URL.revokeObjectURL(prevItem.src); } catch {}
      }
      return {
        ...prev,
        items: [newItem],
        activeIndex: 0,
        lastUpdated: Date.now()
      };
    });
    showToast('사진이 업데이트되었습니다.', 'success');
    trackEvent('image_widget_add_by_url_quick');
  }, [state.items]);

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
              accept="image/*"
      onChange={(e) => {
        const list = e.currentTarget.files;
        if (!list || list.length === 0) return;
        const files = Array.from(list);
        const action = fileActionRef.current || 'add';
        if (action === 'replace' && state.items.length > 0) {
          // 교체: 첫 번째 유효 이미지 1장만 사용
          (async () => {
            const picked = files[0];
            await handleReplaceFile(picked);
          })();
        } else {
          handleFileUpload(files as any);
        }
        e.currentTarget.value = '';
      }}
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
      className={`h-full flex flex-col overflow-hidden ${isEditMode && isDropActive ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
      onDragOver={(e) => {
        if (!isEditMode) return;
        if (!e.dataTransfer) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsDropActive(true);
      }}
      onDragLeave={(e) => {
        if (!isEditMode) return;
        setIsDropActive(false);
      }}
      onDrop={(e) => {
        if (!isEditMode) return;
        e.preventDefault();
        setIsDropActive(false);
        const dt = e.dataTransfer;
        if (dt?.files && dt.files.length > 0) {
          handleFileUpload(Array.from(dt.files) as any);
        }
      }}
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
        accept="image/*"
        onChange={(e) => {
          const list = e.currentTarget.files;
          if (!list || list.length === 0) return;
          handleFileUpload(list);
          e.currentTarget.value = '';
        }}
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
        {/* 전역 교체 버튼 - 편집모드 전용 */}
        {isEditMode && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.altKey) {
                handleQuickAddByUrl();
              } else {
                fileInputRef.current?.click();
              }
            }}
            title="사진 교체 (일반 클릭: 파일, Alt+클릭: URL)"
            aria-label="사진 교체"
            className="absolute top-2 right-2 z-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}

        {/* 드롭 가이드 오버레이 */}
        {isEditMode && isDropActive && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-100/60 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 rounded-xl">
            <div className="text-blue-700 dark:text-blue-200 text-sm font-medium">여기로 이미지를 드롭해서 업로드</div>
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-10">
            <div className="text-center space-y-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                업로드 중... {uploadProgress.current}/{uploadProgress.total}
              </div>
              <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {uploadProgress.percentage}%
              </div>
            </div>
          </div>
        )}

        <div className="w-full h-full flex items-center justify-center">
          <img
            src={currentItem.src}
            alt={currentItem.caption || '사진'}
            className={`max-w-full max-h-full object-contain object-center ${roundedClass} ${borderClass} ${shadowClass} transition-all duration-300 ${!state.muteGestures ? 'cursor-pointer' : ''}`}
            loading="lazy"
            onError={(e) => {
              console.error('이미지 로드 실패:', currentItem.src);
              console.log('[ImageWidget] state summary', { count: state.items.length, activeIndex: state.activeIndex });
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y3RjNGNiIvPgo8cGF0aCBkPSJNMTYgMTBMMTIgMThIMjBMMTYgMTBaIiBmaWxsPSIjNkI3MjgwIi8+Cjwvc3ZnPgo=';
            }}
            onClick={() => !isEditMode && openLightbox(state.activeIndex)}
            draggable={false}
          />
        </div>

        {/* 네비게이션 버튼 숨김 */}

        {/* 인디케이터 숨김 */}

        {/* 썸네일 스트립 숨김 */}

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
          {/* 일괄 작업 바 제거됨 */}
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
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => {
                    fileActionRef.current = 'add';
                    fileInputRef.current?.click();
                  }}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  추가
                </button>
                <button
                  onClick={() => {
                    fileActionRef.current = 'replace';
                    fileInputRef.current?.click();
                  }}
                  className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
                  title="현재 사진 교체"
                >
                  교체
                </button>
              </div>
            )}
          </div>

          {/* 설정 패널 (축소: 모드/자동재생만 유지) */}
          {showSettings && (
            <div className="space-y-2 text-xs border-t pt-2">
              {state.items.length > 1 && (
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
              )}

              {state.items.length > 1 && state.mode === 'slideshow' && (
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
            </div>
          )}

          {/* 이미지 목록 (편집 모드) 제거됨 */}
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
