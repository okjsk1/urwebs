import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Star, Clock, Globe, Settings, Palette, Grid, Link, Type, Image, Save, Eye, Trash2, Edit, Move, Maximize2, Minimize2, RotateCcw, Download, Upload, Layers, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, MousePointer, Square, Circle, Triangle, Share2, Copy, ExternalLink, Lock, Unlock, Calendar, User, Users, BarChart3, TrendingUp, DollarSign, Target, CheckSquare, FileText, Image as ImageIcon, Youtube, Twitter, Instagram, Github, Mail, Phone, MapPin, Thermometer, Cloud, Sun, CloudRain, CloudSnow, Zap, Battery, Wifi, Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Heart, ThumbsUp, MessageCircle, Bell, Search, Filter, SortAsc, SortDesc, MoreHorizontal, MoreVertical, Sun as SunIcon, Moon, MessageCircle as ContactIcon, Rss, QrCode, Smile, Laugh, Quote, BookOpen, RefreshCw, X, ChevronUp, ChevronDown, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { auth, googleProvider, db } from '../firebase/config';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

// 타입 및 상수 import
import { Widget, WidgetSize, BackgroundSettings, ShareSettings, Page, Bookmark, FontSettings, LayoutSettings } from '../types/mypage.types';
import { uploadImage, validateImageFile } from '../utils/imageUpload';
import { getAuth } from 'firebase/auth';
import { isWidgetEditable, readLocal, persistOrLocal } from './widgets/utils/widget-helpers';
import { useIsMobile } from './ui/use-mobile';
import { widgetCategories, getCategoryIcon, fontOptions, allWidgets } from '../constants/widgetCategories';
import { getWidgetDimensions, isWidgetOverlapping, getNextAvailablePosition, getColumnLastWidget as getColumnLastWidgetUtil, getColumnBottomY as getColumnBottomYUtil } from '../utils/widgetHelpers';
import { 
  COLS, SPACING, GRID_H, COL_INNER, COL_TRACK,
  toGridX, toGridY, toGridW, toGridH,
  colToX, rowToY, gridWToPx, gridHToPx,
  snapX, snapY, snapColIndex
} from '../utils/layoutConfig';
import { templates, getDefaultWidgets } from '../constants/pageTemplates';
import { templateService } from '../services/templateService';
import { WidgetPanel } from './MyPage/WidgetPanel';
import { WidgetContentRenderer } from './MyPage/WidgetContentRenderer';
import DashboardGrid, { SizePicker } from './DashboardGrid';
import DraggableDashboardGrid from './DraggableDashboardGrid';

// 위젯 컴포넌트들 import
import { TodoWidget } from './widgets/TodoWidget';
import { ExchangeWidget } from './widgets/ExchangeWidget';
import { NewsWidget } from './widgets/NewsWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { BookmarkWidget } from './widgets/BookmarkWidget';
import { EnglishWordsWidget } from './widgets/EnglishWordsWidget';
import { GoogleAdWidget } from './widgets/GoogleAdWidget';
import { FrequentSitesWidget } from './widgets/FrequentSitesWidget';
import { CryptoWidget } from './widgets/CryptoWidget';
import { EconomicCalendarWidget } from './widgets/EconomicCalendarWidget';
import { QRCodeWidget } from './widgets/QRCodeWidget';
import { UnifiedSearchWidget } from './widgets/UnifiedSearchWidget';
import { GoogleSearchWidget } from './widgets/GoogleSearchWidget';
import { NaverSearchWidget } from './widgets/NaverSearchWidget';
import { LawSearchWidget } from './widgets/LawSearchWidget';
import { QuoteWidget } from './widgets/QuoteWidget';
import { QuickNoteWidget } from './widgets/QuickNoteWidget';
import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';
import { completeTutorialStep } from '../hooks/useTutorialProgress';

// 인터페이스들은 이제 types에서 import

export function MyPage() {
  const { theme, toggleTheme } = useTheme();
  const { pageId } = useParams<{ pageId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, authChecked } = useAuth();
  const isMobile = useIsMobile();
  
  // Public View 모드 계산: ?view=public 또는 로그인 미상태에서 읽기 전용
  const viewMode = useMemo(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'public') {
      return 'public' as const;
    }
    // 로그인 미상태일 때도 public으로 처리
    if (authChecked && !user) {
      return 'public' as const;
    }
    return 'edit' as const;
  }, [searchParams, user, authChecked]);
  
  const isPublicView = viewMode === 'public';
  
  // Stealth Mode 감지: ?mode=stealth 또는 FEATURE_STEALTH 플래그
  const isStealthMode = useMemo(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'stealth') {
      return true;
    }
    // Feature Flag 확인 (환경 변수 우선)
    try {
      const { getFlag } = require('../flags/featureFlags');
      return getFlag('STEALTH') || false;
    } catch {
      return false;
    }
  }, [searchParams]);
  
  // Public View일 때는 편집 모드 비활성화
  const [isEditModeState, setIsEditModeState] = useState(true);
  const isEditMode = isPublicView ? false : isEditModeState;
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [toast, setToast] = useState<{type:'success'|'error'|'info', msg:string, actionLabel?: string, onAction?: () => void} | null>(null);
  const [recentlyAddedWidgetId, setRecentlyAddedWidgetId] = useState<string | null>(null);
  const addAnimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoStackRef = useRef<{ widget: Widget; index: number; pageId: string | null } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasShownDragToast, setHasShownDragToast] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('urwebs-drag-toast-shown') === 'true';
  });
  const [showContinueModal, setShowContinueModal] = useState(false);
  const continuePromptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [continuePromptDismissed, setContinuePromptDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('urwebs-continue-dismissed') === 'true';
  });
  const [highlightedWidgetId, setHighlightedWidgetId] = useState<string | null>(null);
  const [showFirstWidgetTooltip, setShowFirstWidgetTooltip] = useState(false);
  const firstWidgetFeedbackShownRef = useRef<boolean>(
    typeof window !== 'undefined' && localStorage.getItem('urwebs-first-widget-feedback-shown') === 'true'
  );
  
  // 하위 호환성을 위한 별칭
  const spacing = 12; // DraggableDashboardGrid와 동일한 gap 값 사용
  const MAIN_COLUMNS = COLS;
  const SUB_COLUMNS = 1;
  const [subCellWidth, setSubCellWidth] = useState(COL_INNER);
  const [cellHeight] = useState(GRID_H);
  const mainColumnWidth = COL_INNER;
  const cellWidth = COL_INNER;
  
  // 위젯 상태 관리 - 지연 초기화로 성능 개선
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [weatherData] = useState({
    temperature: 22,
    condition: '맑음',
    humidity: 60,
    windSpeed: 5,
    location: '서울',
    feelsLike: 24,
    uvIndex: 6,
    pressure: 1013,
    visibility: 10,
    sunrise: '06:30',
    sunset: '19:45',
    hourly: [
      { time: '14:00', temp: 22, icon: '☀️' },
      { time: '15:00', temp: 24, icon: '⛅' },
      { time: '16:00', temp: 23, icon: '☁️' },
      { time: '17:00', temp: 21, icon: '🌧️' }
    ]
  });
  const [englishWordsSettings] = useState({
    interval: 5000, // 5초 기본값
    isAutoPlay: false
  });

  // 설정들
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>({
    type: 'solid',
    color: '#f8fafc',
    gradient: {
      from: '#ffffff',
      to: '#ffffff',
      direction: 'to-br'
    },
    opacity: 1
  });

  const [fontSettings, setFontSettings] = useState<FontSettings>({
    family: 'Inter',
    size: 14,
    weight: 'normal',
    style: 'normal',
    color: '#1F2937'
  });

  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    gridSize: 20,
    snapToGrid: true,
    showGrid: true,
    spacing: 10
  });

  // 그리드 셀 높이 설정 상태 (160px 고정)
  const responsiveCellHeights = {
    default: 160, // 모바일
    sm: 160,     // 작은 화면
    md: 160,     // 중간 화면
    lg: 160,     // 큰 화면
    xl: 160      // 매우 큰 화면
  };

  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isPublic: false, // 기본값을 비공개로 변경하여 로컬 저장 페이지가 최신 업데이트에 표시되지 않도록 함
    customDomain: 'user123', // 실제로는 사용자 ID나 사용자명을 가져와야 함
    allowComments: true,
    showStats: true
  });

  // 사용자 정보 (실제로는 인증 시스템에서 가져와야 함)
  // 이메일에서 사용자 이름 추출 함수
  const getUsernameFromEmail = (email: string) => {
    return email.split('@')[0];
  };

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const [pageTitle, setPageTitle] = useState("'김사용자'님의 페이지");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(pageTitle);
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false);
  
  // URL 관리
  const [customUrl, setCustomUrl] = useState<string>('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  
  // 페이지 관리 상태
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);

  // Firebase 인증 상태 감지 및 사용자 정보 업데이트
  useEffect(() => {
    // LocalStorage에서 수동 편집 플래그 확인
    const savedManualEditFlag = localStorage.getItem('isTitleManuallyEdited');
    if (savedManualEditFlag === 'true') {
      setIsTitleManuallyEdited(true);
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const username = getUsernameFromEmail(firebaseUser.email || '');
        const newTitle = `'${username}'님의 페이지`;
        
        setCurrentUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || username,
          email: firebaseUser.email || ''
        });
        
        // 사용자가 수동으로 제목을 편집한 경우에는 자동 업데이트 하지 않음
        if (savedManualEditFlag !== 'true') {
          // 페이지 제목 자동 업데이트
          setPageTitle(newTitle);
          setTempTitle(newTitle);
          
          // 첫 번째 페이지 제목도 업데이트
          setPages(prevPages => {
            const updatedPages = reindexPages(prevPages.map((page, index) => 
              index === 0 ? { ...page, title: newTitle } : page
            ));
            persistPagesToStorage(updatedPages);
            return updatedPages;
          });
        }
      } else {
        // 로그아웃 시 currentUser를 null로 설정
        console.log('Firebase 로그아웃 감지 - currentUser를 null로 설정');
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const [showPageManager, setShowPageManager] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  // 레이아웃 히스토리 (Ctrl+Z 되돌리기)
  const [layoutHistory, setLayoutHistory] = useState<Widget[][]>([]);

  const pushLayoutHistory = useCallback((current: Widget[]) => {
    // 위치 정보만 복제하여 저장
    const snapshot = current.map(w => ({ ...w }));
    setLayoutHistory(prev => [...prev.slice(-19), snapshot]); // 최대 20단계 저장
  }, []);

  const undoLayout = useCallback(() => {
    setLayoutHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setWidgets(last);
      return prev.slice(0, -1);
    });
  }, []);

  // Ctrl+Z 단축키로 되돌리기
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        undoLayout();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undoLayout]);

  // widgetsRef 동기화는 onLayoutChange 내부에서 prevWidgets로 처리
  
  // 페이지 관리 패널 외부 클릭 감지용 ref
  const pageManagerRef = useRef<HTMLDivElement>(null);

  // 페이지 관리 패널 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPageManager && pageManagerRef.current && !pageManagerRef.current.contains(event.target as Node)) {
        setShowPageManager(false);
      }
    };

    if (showPageManager) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPageManager]);

  // 템플릿 적용 및 위젯 초기화
  useEffect(() => {
    const selectedTemplate = localStorage.getItem('selectedTemplate');
    
    if (selectedTemplate && widgets.length === 0) {
      try {
        const templateData = JSON.parse(selectedTemplate);
        console.log('템플릿 데이터 적용:', templateData);
        
        // 템플릿 위젯들을 실제 위젯 객체로 변환
        const templateWidgets: Widget[] = templateData.widgets.map((widgetConfig: any, index: number) => {
          const dimensions = getWidgetDimensions(widgetConfig.type, widgetConfig.size, widgetConfig.x, widgetConfig.y);
          const categoryInfo = getCategoryIcon(widgetConfig.type);
          
          return {
            id: `widget-${Date.now()}-${index}`,
            type: widgetConfig.type,
            x: widgetConfig.x,
            y: widgetConfig.y,
            width: dimensions.width,
            height: dimensions.height,
            title: (typeof categoryInfo === 'string' ? categoryInfo : (categoryInfo as any)?.label) || widgetConfig.type,
            size: widgetConfig.size,
            content: {}
          };
        });
        
        setWidgets(templateWidgets);
        
        // 템플릿 적용 후 localStorage에서 제거
        localStorage.removeItem('selectedTemplate');
        
        console.log('템플릿 위젯 적용 완료:', templateWidgets);
      } catch (error) {
        console.error('템플릿 적용 중 오류:', error);
        localStorage.removeItem('selectedTemplate');
      }
    }
  }, []);

  // 처음 방문 시 소개 모달 또는 템플릿 선택 모달 자동으로 표시
  useEffect(() => {
    const shouldShowTemplateAfterLogin = localStorage.getItem('shouldShowTemplateAfterLogin');
    
    console.log('=== MyPage 모달 체크 ===');
    console.log('currentUser:', currentUser);
    console.log('shouldShowTemplateAfterLogin:', shouldShowTemplateAfterLogin);
    
    // 사용자별 방문 기록 확인
    const userVisitKey = currentUser ? `hasVisitedMyPage_${currentUser.id}` : 'hasVisitedMyPage_guest';
    const hasVisitedMyPage = localStorage.getItem(userVisitKey);
    const savedPages = currentUser ? localStorage.getItem(`myPages_${currentUser.id}`) : null;
    
    console.log('userVisitKey:', userVisitKey);
    console.log('hasVisitedMyPage:', hasVisitedMyPage);
    console.log('savedPages:', savedPages);
    
    // 비로그인 상태 - 기본 페이지 생성
    if (!currentUser) {
      const guestPages = localStorage.getItem('myPages');
      console.log('게스트 페이지 데이터:', guestPages);
      
      // 저장된 게스트 페이지가 있으면 로드, 없으면 기본 페이지 생성
      if (guestPages) {
        try {
          const parsedPages = JSON.parse(guestPages);
          if (parsedPages && parsedPages.length > 0) {
            console.log('→ 비로그인 사용자: 저장된 페이지 로드');
            const normalizedPages = reindexPages(parsedPages);
            setPages(normalizedPages);
            setCurrentPageId(normalizedPages[0].id);
            setPageTitle(normalizedPages[0].title);
            setWidgets(normalizedPages[0].widgets || []);
            persistPagesToStorage(normalizedPages);
            localStorage.setItem(userVisitKey, 'true');
            return;
          }
        } catch (error) {
          console.error('게스트 페이지 파싱 오류:', error);
        }
      }
      
      // 저장된 페이지가 없으면 빈 페이지로 바로 시작
      console.log('→ 비로그인 사용자: 빈 페이지로 시작');
      const emptyPage = {
        id: `page_${Date.now()}`,
        title: '새 페이지',
        widgets: [],
        createdAt: new Date().toISOString(),
        isActive: true,
        pageNumber: 1
      };
      setPages([emptyPage]);
      setCurrentPageId(emptyPage.id);
      setPageTitle(emptyPage.title);
      setWidgets([]);
      persistPagesToStorage([emptyPage]);
      localStorage.setItem(userVisitKey, 'true');
      return;
    }
    
    // 로그인 상태: 로그인 사용자는 템플릿 선택 없이 빈 페이지로 시작 (551-569줄에서 처리)
    localStorage.setItem(userVisitKey, 'true');
    // shouldShowTemplateAfterLogin 플래그 제거 (더 이상 사용하지 않음)
    if (shouldShowTemplateAfterLogin === 'true') {
      localStorage.removeItem('shouldShowTemplateAfterLogin');
    }
  }, [currentUser]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    firstWidgetFeedbackShownRef.current = localStorage.getItem('urwebs-first-widget-feedback-shown') === 'true';
  }, []);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
      if (addAnimTimerRef.current) {
        clearTimeout(addAnimTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!toast || toast.actionLabel) return;
    const timeout = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!showFirstWidgetTooltip) return;
    const timer = window.setTimeout(() => {
      setShowFirstWidgetTooltip(false);
      setHighlightedWidgetId(null);
    }, 3800);
    return () => window.clearTimeout(timer);
  }, [showFirstWidgetTooltip]);

  useEffect(() => {
    if (!isEditMode) return;
    if (hasShownDragToast) return;
    const timer = setTimeout(() => {
      setToast({
        type: 'info',
        msg: '위젯을 드래그하면 파란 가이드에 맞춰 정렬돼요.',
      });
      setHasShownDragToast(true);
      try {
        localStorage.setItem('urwebs-drag-toast-shown', 'true');
      } catch {
        // ignore
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [isEditMode, hasShownDragToast]);

  useEffect(() => {
    if (continuePromptTimerRef.current) {
      clearTimeout(continuePromptTimerRef.current);
      continuePromptTimerRef.current = null;
    }
    if (currentUser || continuePromptDismissed || widgets.length === 0) {
      setShowContinueModal(false);
      return;
    }
    continuePromptTimerRef.current = setTimeout(() => {
      setShowContinueModal(true);
    }, 90_000);
    return () => {
      if (continuePromptTimerRef.current) {
        clearTimeout(continuePromptTimerRef.current);
        continuePromptTimerRef.current = null;
      }
    };
  }, [currentUser, widgets.length, continuePromptDismissed]);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // 저장된 페이지 불러오기 - Firebase 우선, 없으면 localStorage
  useEffect(() => {
    const loadPages = async () => {
      // 로그인 사용자의 페이지 불러오기
      if (currentUser) {
        let firebaseSnapshot: any = null;
        try {
          // 1. Firebase에서 먼저 로드 시도
          console.log('→ Firebase에서 페이지 데이터 로드 시도...');
          const pagesRef = collection(db, 'userPages');
          // Firebase에서 모든 페이지 가져오기 (isDeleted 필터 제거 - Firestore에서 != 연산자 제한)
          const q = query(
            pagesRef, 
            where('authorId', '==', currentUser.id)
          );
          firebaseSnapshot = await getDocs(q);
          
          if (firebaseSnapshot && !firebaseSnapshot.empty) {
            console.log('→ Firebase에서', firebaseSnapshot.docs.length, '개의 페이지 발견');
            
            // Firebase 데이터를 localStorage 형식으로 변환 (삭제되지 않은 페이지만)
            const firebasePages = firebaseSnapshot.docs
              .filter(doc => {
                const data = doc.data();
                return !data.isDeleted; // 삭제되지 않은 페이지만 필터링
              })
              .map((doc, index) => {
                const data = doc.data();
                // Firebase에서 가져온 데이터를 localStorage 형식으로 변환
                const parseGridSize = (gs: any) => {
                  if (gs && typeof gs === 'object' && gs.w && gs.h) {
                    return gs;
                  }
                  return { w: 1, h: 1 };
                };
                
                return {
                  id: `page_${doc.id}`, // Firebase doc.id를 기반으로 한 안정적인 ID
                  firebaseDocId: doc.id, // Firebase 문서 ID 저장
                  title: data.title || '제목 없음',
                  widgets: (data.widgets || []).map((w: any, idx: number) => ({
                    id: w.id || `widget_${doc.id}_${idx}`,
                    type: w.type,
                    title: w.title || '',
                    // x, y는 "그리드 좌표"로 일관 유지
                    x: w.x || 0,
                    y: w.y || 0,
                    width: w.width || 1,
                    height: w.height || 1,
                    size: w.size || `${w.width || 1}x${w.height || 1}`,
                    gridSize: parseGridSize(w.gridSize),
                    content: w.content || {}
                  })),
                  createdAt: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now(),
                  pageNumber: typeof data.pageNumber === 'number' ? data.pageNumber : index + 1,
                  isActive: !data.isDeleted,
                  customUrl: data.urlId?.replace(currentUser.email?.split('@')[0] + '_', '') || undefined,
                  urlId: data.urlId || undefined
                };
              })
              .sort((a, b) => {
                if (a.pageNumber != null && b.pageNumber != null && a.pageNumber !== b.pageNumber) {
                  return a.pageNumber - b.pageNumber;
                }
                if (a.pageNumber != null && b.pageNumber == null) return -1;
                if (a.pageNumber == null && b.pageNumber != null) return 1;
                return (a.createdAt || 0) - (b.createdAt || 0);
              }); // 페이지 번호 우선 정렬
            
            const orderedPages = reindexPages(firebasePages);
            
            // 공개 설정 및 배경 설정도 Firebase에서 가져오기 (첫 번째 페이지의 설정 사용)
            if (firebasePages.length > 0) {
              // 필터링된 페이지 중 첫 번째 것의 원본 데이터 찾기
              const firstFirebasePage = firebasePages[0];
              const firstDoc = firebaseSnapshot.docs.find(doc => doc.id === firstFirebasePage.firebaseDocId);
              if (firstDoc) {
                const firstPageData = firstDoc.data();
                setShareSettings({
                  isPublic: firstPageData.isPublic || false
                });
                localStorage.setItem(`shareSettings_${currentUser.id}`, JSON.stringify({
                  isPublic: firstPageData.isPublic || false
                }));
                
                // 배경 설정도 복원
                if (firstPageData.backgroundSettings) {
                  setBackgroundSettings(firstPageData.backgroundSettings);
                  localStorage.setItem(`backgroundSettings_${currentUser.id}`, JSON.stringify(firstPageData.backgroundSettings));
                }
              }
            }
            
            // localStorage에 동기화
            localStorage.setItem(`myPages_${currentUser.id}`, JSON.stringify(orderedPages));
            
            // 페이지 데이터 설정
            setPages(orderedPages);
            
            // URL에서 페이지 찾기
            let targetPage = orderedPages[0];
            if (pageId) {
              const pageIndex = parseInt(pageId.split('_')[1]) - 1;
              if (pageIndex >= 0 && pageIndex < orderedPages.length) {
                targetPage = orderedPages[pageIndex];
              }
            } else {
              targetPage = orderedPages.find((p: any) => p.isActive) || orderedPages[0];
            }
            
            if (targetPage) {
              setCurrentPageId(targetPage.id);
              setPageTitle(targetPage.title);
              setWidgets(targetPage.widgets || []);
              
              // 선택된 페이지의 배경 설정 로드
              const targetDoc = firebaseSnapshot.docs.find(doc => {
                const data = doc.data();
                return doc.id === targetPage.firebaseDocId;
              });
              if (targetDoc && targetDoc.data().backgroundSettings) {
                setBackgroundSettings(targetDoc.data().backgroundSettings);
                localStorage.setItem(`backgroundSettings_${currentUser.id}`, JSON.stringify(targetDoc.data().backgroundSettings));
              }
              
              // URL 업데이트
              const pageIndex = orderedPages.findIndex((p: any) => p.id === targetPage.id);
              const userPrefix = currentUser.email?.split('@')[0] || 'user';
              const expectedUrl = `${userPrefix}_${pageIndex + 1}`;
              if (!pageId || pageId !== expectedUrl) {
                navigate(`/mypage/${expectedUrl}`, { replace: true });
              }
            }
            
            console.log('→ Firebase 데이터 로드 완료');
            return; // Firebase 데이터가 있으면 여기서 종료
          } else {
            console.log('→ Firebase에 저장된 페이지 없음, localStorage 확인');
          }
          } catch (error) {
            console.error('Firebase 로드 실패:', error);
            firebaseSnapshot = null; // 에러 시 null로 설정
          }
        
        // 2. Firebase에 데이터가 없으면 localStorage에서 로드
        const savedPagesData = localStorage.getItem(`myPages_${currentUser.id}`);
        const savedShareSettings = localStorage.getItem(`shareSettings_${currentUser.id}`);
        const savedBackgroundSettings = localStorage.getItem(`backgroundSettings_${currentUser.id}`);
        
        // 공개 설정 복원
        if (savedShareSettings) {
          try {
            const settings = JSON.parse(savedShareSettings);
            setShareSettings(settings);
          } catch (e) {
            console.error('공개 설정 복원 실패:', e);
          }
        }
        
        // 배경 설정 복원
        if (savedBackgroundSettings) {
          try {
            const bgSettings = JSON.parse(savedBackgroundSettings);
            setBackgroundSettings(bgSettings);
          } catch (e) {
            console.error('배경 설정 복원 실패:', e);
          }
        }
        
        if (savedPagesData) {
          try {
            const loadedPages = JSON.parse(savedPagesData);
            const normalizedPages = reindexPages(loadedPages);
            setPages(normalizedPages);
            persistPagesToStorage(normalizedPages);
            
            // URL에서 페이지 찾기 (okjsk1_2 형식)
            let targetPage = normalizedPages[0];
            if (pageId) {
              const pageIndex = parseInt(pageId.split('_')[1]) - 1;
              if (pageIndex >= 0 && pageIndex < normalizedPages.length) {
                targetPage = normalizedPages[pageIndex];
              }
            } else {
              // URL 파라미터가 없으면 활성 페이지 찾기
              targetPage = normalizedPages.find((p: any) => p.isActive) || normalizedPages[0];
            }
            
            if (targetPage) {
              setCurrentPageId(targetPage.id);
              setPageTitle(targetPage.title);
              setWidgets(targetPage.widgets || []);
              
              // URL 업데이트 (URL이 없거나 다른 경우)
              const pageIndex = normalizedPages.findIndex((p: any) => p.id === targetPage.id);
              const userPrefix = currentUser.email?.split('@')[0] || 'user';
              const expectedUrl = `${userPrefix}_${pageIndex + 1}`;
              if (!pageId || pageId !== expectedUrl) {
                navigate(`/mypage/${expectedUrl}`, { replace: true });
              }
            }
          } catch (error) {
            console.error('페이지 로드 실패:', error);
          }
        }
        
        // Firebase와 localStorage 모두에 데이터가 없으면 기본 페이지 생성
        // Firebase에서 이미 로드했으면 기본 페이지 생성하지 않음
        const hasFirebaseData = firebaseSnapshot && !firebaseSnapshot.empty;
        if (!hasFirebaseData && (!savedPagesData || (savedPagesData && JSON.parse(savedPagesData).length === 0))) {
          console.log('→ 저장된 페이지 없음: 기본 페이지 생성');
          const defaultPage = {
            id: `page_${Date.now()}`,
            title: '나만의 페이지',
            widgets: [],
            createdAt: Date.now(),
            isActive: true,
            pageNumber: 1
          };
          const defaultPages = reindexPages([defaultPage]);
          setPages(defaultPages);
          setCurrentPageId(defaultPage.id);
          setPageTitle(defaultPage.title);
          setWidgets([]);
          persistPagesToStorage(defaultPages);
        }
      } else {
        // 비로그인 사용자의 페이지 불러오기
        const guestPagesData = localStorage.getItem('myPages');
        const savedShareSettings = localStorage.getItem('shareSettings_guest');
        
        // 공개 설정 복원 (게스트)
        if (savedShareSettings) {
          try {
            const settings = JSON.parse(savedShareSettings);
            setShareSettings(settings);
          } catch (e) {
            console.error('공개 설정 복원 실패 (게스트):', e);
          }
        }
        
        if (guestPagesData) {
          try {
            const loadedPages = JSON.parse(guestPagesData);
            const normalizedPages = reindexPages(loadedPages);
            setPages(normalizedPages);
            persistPagesToStorage(normalizedPages);
            
            // 활성 페이지 찾기
            const activePage = normalizedPages.find((p: any) => p.isActive) || normalizedPages[0];
            if (activePage) {
              setCurrentPageId(activePage.id);
              setPageTitle(activePage.title);
              setWidgets(activePage.widgets || []);
            }
          } catch (error) {
            console.error('페이지 로드 실패:', error);
          }
        }
      }
    };
    
    loadPages();
  }, [currentUser, pageId, navigate]);


  const canvasRef = useRef<HTMLDivElement>(null);

  // 고정 8칸 레이아웃: 셀 크기 재계산 비활성화 (subCellWidth 고정)
  // 필요 시 브라우저 확대/축소와 무관하게 레이아웃 유지

  // 셀 크기 변경 시 기존 위젯들 크기 업데이트
  // 셀 크기 고정: 창 크기와 무관하게 위젯 위치/크기 유지

  // 현재 페이지의 위젯들 가져오기 (useMemo로 최적화)
  const currentPage = useMemo(() => 
    pages.find(page => page.id === currentPageId),
    [pages, currentPageId]
  );
  
  // 실행취소/재실행 히스토리 (최대 20회)
  const [widgetHistory, setWidgetHistory] = useState<Widget[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const MAX_HISTORY = 20;

  // 위젯 상태 변경 시 히스토리에 저장하는 래퍼 함수
  const setWidgetsWithHistory = useCallback((newWidgets: Widget[] | ((prev: Widget[]) => Widget[])) => {
    setWidgets(prevWidgets => {
      const updatedWidgets = typeof newWidgets === 'function' ? newWidgets(prevWidgets) : newWidgets;
      
      // 히스토리에 추가 (현재 인덱스 이후 제거하고 새로 추가)
      setWidgetHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(updatedWidgets))); // 깊은 복사
        
        // 최대 개수 제한
        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
          setHistoryIndex(MAX_HISTORY - 1);
        } else {
          setHistoryIndex(newHistory.length - 1);
        }
        
        return newHistory;
      });
      
      return updatedWidgets;
    });
  }, [historyIndex, MAX_HISTORY]);

  // 실행취소
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setWidgets(JSON.parse(JSON.stringify(widgetHistory[newIndex])));
    }
  }, [historyIndex, widgetHistory]);

  // 재실행
  const redo = useCallback(() => {
    if (historyIndex < widgetHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setWidgets(JSON.parse(JSON.stringify(widgetHistory[newIndex])));
    }
  }, [historyIndex, widgetHistory]);

  // Ctrl+Z, Ctrl+Y 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // 현재 페이지가 변경될 때 위젯 업데이트
  useEffect(() => {
    const page = pages.find(p => p.id === currentPageId);
    if (page) {
      setWidgets(page.widgets || []);
      setPageTitle(page.title);
    } else {
      setWidgets([]);
      setPageTitle("'김사용자'님의 페이지");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageId]); // pages는 의존성에서 제외 (무한 루프 방지)
  
  // 커스텀 URL 복원 (currentPageId 변경 시)
  useEffect(() => {
    if (currentUser && currentPageId && pages.length > 0) {
      const savedUrl = localStorage.getItem(`customUrl_${currentUser.id}_${currentPageId}`);
      if (savedUrl) {
        setCustomUrl(savedUrl);
      } else {
        const userPageIndex = pages.findIndex(p => p.id === currentPageId) + 1;
        if (userPageIndex > 0) {
          // 이메일에서 @ 앞부분 추출
          const userId = currentUser.email?.split('@')[0] || 'user';
          const defaultUrl = `${userId}_${userPageIndex}`;
          setCustomUrl(defaultUrl);
        }
      }
    } else if (!currentUser || !currentPageId) {
      setCustomUrl('');
    }
  }, [currentPageId, currentUser, pages.length]);

  // 템플릿은 이제 import한 templates 사용

  // 페이지 관리 함수들
  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      await templateService.initializeDefaultTemplates();
      const templatesData = await templateService.getAllTemplates();
      
      // 활성화된 템플릿만 필터링
      const activeTemplates = templatesData.filter(template => template.isActive);
      
      // Firebase에서 가져온 템플릿이 없으면 로컬 템플릿 사용
      if (activeTemplates.length === 0) {
        console.log('Firebase에 템플릿이 없음 - 로컬 템플릿 사용');
        const localTemplates = Object.entries(templates).map(([key, template]) => ({ 
          id: key, 
          ...template,
          isActive: true,
          isDefault: true
        }));
        setAvailableTemplates(localTemplates);
      } else {
        setAvailableTemplates(activeTemplates);
      }
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
      // 오류 시 로컬 템플릿 사용
      const localTemplates = Object.entries(templates).map(([key, template]) => ({ 
        id: key, 
        ...template,
        isActive: true,
        isDefault: true
      }));
      setAvailableTemplates(localTemplates);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const persistPagesToStorage = (pagesToPersist: Page[]) => {
    try {
      if (currentUser) {
        localStorage.setItem(`myPages_${currentUser.id}`, JSON.stringify(pagesToPersist));
      } else {
        localStorage.setItem('myPages', JSON.stringify(pagesToPersist));
      }
    } catch (error) {
      console.warn('페이지 저장에 실패했습니다:', error);
    }
  };

  const reindexPages = (pagesToIndex: Page[]): Page[] =>
    pagesToIndex.map((page, index) => ({
      ...page,
      pageNumber: index + 1,
    }));

  const cloneBackgroundSettings = () => ({
    ...backgroundSettings,
    gradient: { ...backgroundSettings.gradient },
  });

  const generateUniquePageTitle = (baseTitle: string) => {
    const existingTitles = new Set(pages.map(page => page.title));
    if (!existingTitles.has(baseTitle)) {
      return baseTitle;
    }
    let counter = 2;
    let candidate = `${baseTitle} (${counter})`;
    while (existingTitles.has(candidate)) {
      counter += 1;
      candidate = `${baseTitle} (${counter})`;
    }
    return candidate;
  };

  const createPageEntry = (title: string) => {
    const newPageId = `page${Date.now()}`;
    const newBackground = cloneBackgroundSettings();
    const baseNewPage: Page = {
      id: newPageId,
      title,
      widgets: [],
      createdAt: Date.now(),
      isActive: true,
      backgroundSettings: newBackground
    };

    let newPageWithIndex: Page = { ...baseNewPage, pageNumber: pages.length + 1 };

    setPages(prev => {
      const deactivated = prev.map(page => ({ ...page, isActive: false }));
      const nextPages = reindexPages([...deactivated, baseNewPage]);
      newPageWithIndex = nextPages[nextPages.length - 1];
      persistPagesToStorage(nextPages);
      return nextPages;
    });

    setCurrentPageId(newPageId);
    setPageTitle(title);
    setWidgets([]);
    setBackgroundSettings(newBackground);

    return { id: newPageId, page: newPageWithIndex };
  };

  const createNewPage = () => {
    const baseTitle = '새 페이지';
    const newTitle = generateUniquePageTitle(baseTitle);
    createPageEntry(newTitle);
    setShowTemplateModal(false);
    setShowPageManager(true);
  };

  // 휴지통 (삭제된 페이지 7일 보관)
  type TrashedPage = { page: any; deletedAt: number };
  const trashKey = currentUser ? `trash_pages_${currentUser.id}` : 'trash_pages_guest';
  const [trashPages, setTrashPages] = useState<TrashedPage[]>(() => {
    try {
      const raw = localStorage.getItem(trashKey);
      const arr = raw ? JSON.parse(raw) : [];
      const seven = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const cleaned = arr.filter((t: TrashedPage) => now - t.deletedAt < seven);
      if (cleaned.length !== arr.length) localStorage.setItem(trashKey, JSON.stringify(cleaned));
      return cleaned;
    } catch { return []; }
  });
  const [showTrash, setShowTrash] = useState(false);

  const loadTrashFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(trashKey);
      const arr = raw ? JSON.parse(raw) : [];
      const seven = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const source = Array.isArray(arr) ? (arr as TrashedPage[]) : [];
      const cleaned = source.filter((t) => typeof t?.deletedAt === 'number' && now - t.deletedAt < seven);
      if (cleaned.length !== source.length) {
        localStorage.setItem(trashKey, JSON.stringify(cleaned));
      }
      setTrashPages(cleaned);
    } catch {
      setTrashPages([]);
    }
  }, [trashKey]);

  useEffect(() => {
    loadTrashFromStorage();
  }, [loadTrashFromStorage]);

  const saveTrash = (list: TrashedPage[]) => {
    setTrashPages(list);
    try { localStorage.setItem(trashKey, JSON.stringify(list)); } catch {}
  };

  const movePageToTrash = (pageToDelete: any) => {
    const entry: TrashedPage = { page: pageToDelete, deletedAt: Date.now() };
    saveTrash([entry, ...trashPages]);
  };

  const restoreFromTrash = (pageId: string) => {
    const idx = trashPages.findIndex(t => t.page?.id === pageId);
    if (idx === -1) return;
    const entry = trashPages[idx];
    const remaining = [...trashPages];
    remaining.splice(idx, 1);
    saveTrash(remaining);
    // 복원: 활성화 상태로 추가
    const restored = { ...entry.page, isActive: true };
    setPages(prev => {
      const updated = reindexPages(prev.map(p => ({ ...p, isActive: false })).concat(restored));
      persistPagesToStorage(updated);
      return updated;
    });
    setCurrentPageId(restored.id);
    setPageTitle(restored.title);
    setWidgets(restored.widgets || []);
  };

  const purgeTrashItem = (pageId: string) => {
    saveTrash(trashPages.filter(t => t.page?.id !== pageId));
  };

  // 툴바에서 바로 새 페이지를 추가하고 페이지 관리 열기
  const addAndManageNewPage = () => {
    const userId = currentUser?.email?.split('@')[0] || 'User';
    const baseTitle = `${userId}님의 페이지`;
    const newTitle = generateUniquePageTitle(baseTitle);
    createPageEntry(newTitle);
    setShowPageManager(true);
  };

  // MyPage 첫 로드 시 템플릿 미리 불러오기
  useEffect(() => {
    loadTemplates();
  }, []);

  // 템플릿 모달이 열릴 때마다 템플릿 로드
  useEffect(() => {
    if (showTemplateModal) {
      loadTemplates();
    }
  }, [showTemplateModal]);

  const createPageWithTemplate = async (templateKey: string) => {
    try {
      // 먼저 로컬 템플릿인지 확인
      const localTemplate = templates[templateKey as keyof typeof templates];
      if (localTemplate) {
        console.log('로컬 템플릿 사용:', templateKey);
        createPageWithLocalTemplate(localTemplate);
        return;
      }

      // Firestore에서 최신 템플릿 가져오기
      const templateData = await templateService.getTemplate(templateKey);
      
      if (!templateData) {
        console.error('템플릿을 찾을 수 없습니다:', templateKey);
        alert('템플릿을 불러올 수 없습니다.');
        return;
      }

      // 사용자가 이 템플릿을 사용했다고 기록 (Firebase 사용자만)
      if (currentUser) {
        await templateService.markTemplateAsUsed(currentUser.id, templateKey);
      }

      const newPageId = `page${Date.now()}`;
      
      // 위젯 위치 설정 (동적 크기 사용)
      const positionedWidgets = templateData.widgets.map((widget, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        
        // 검색 위젯은 2x1 그리드 크기로 설정
        if (widget.type === 'google_search' || widget.type === 'naver_search') {
          return {
            ...widget,
            id: `${widget.type}_${Date.now()}_${index}`,
            gridSize: { w: 2, h: 1 }, // 2칸 너비, 1칸 높이
            x: widget.x || col * (subCellWidth + spacing),
            y: widget.y || row * (cellHeight + spacing)
          };
        }

        // 다른 위젯들의 위치 조정 (그리드 기반 배치)
        return {
          ...widget,
          id: `${widget.type}_${Date.now()}_${index}`,
          width: widget.width || cellWidth,
          height: widget.height || cellHeight,
          x: widget.x || col * (cellWidth + spacing),
          y: widget.y || row * (cellHeight + spacing)
        };
      });

      // 페이지 제목 생성 (사용자ID님의 페이지)
      const userId = currentUser?.email?.split('@')[0] || 'User';
      const pageCount = pages.length + 1; // 새로 만드는 페이지 번호
      const pageTitle = pageCount === 1 
        ? `${userId}님의 페이지`
        : `${userId}님의 페이지 (${pageCount})`;
      
      const newPage = {
        id: newPageId,
        title: pageTitle,
        widgets: positionedWidgets,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      // 페이지 목록 업데이트
      const updatedPages = reindexPages(pages.map(page => ({ ...page, isActive: false })).concat(newPage));
      setPages(updatedPages);
      setCurrentPageId(newPageId);
      setPageTitle(newPage.title);
      setWidgets(positionedWidgets);
      
      // localStorage에 즉시 저장
      persistPagesToStorage(updatedPages);
      console.log('최신 템플릿으로 페이지 생성 및 저장 완료:', newPage);
      
      setShowTemplateModal(false);
      setShowPageManager(false);
    } catch (error) {
      console.error('템플릿 페이지 생성 실패:', error);
      // 오류 시 로컬 템플릿으로 폴백
      const localTemplate = templates[templateKey as keyof typeof templates];
      if (localTemplate) {
        createPageWithLocalTemplate(localTemplate);
      }
    }
  };

  // 로컬 템플릿으로 페이지 생성 (폴백용)
  const createPageWithLocalTemplate = (template: any) => {
    const newPageId = `page${Date.now()}`;
    
    // 위젯 위치 설정 (동적 크기 사용)
    const positionedWidgets = template.widgets.map((widget: any, index: number) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      
      return {
        ...widget,
        id: `${widget.type}_${Date.now()}_${index}`, // 고유 ID 생성
        width: cellWidth,
        height: cellHeight,
        x: col * (cellWidth + spacing),
        y: row * (cellHeight + spacing)
      };
    });
    
    // 페이지 제목 생성 (사용자ID님의 페이지)
    const userId = currentUser?.email?.split('@')[0] || 'User';
    const pageCount = pages.length + 1; // 새로 만드는 페이지 번호
    const pageTitle = pageCount === 1 
      ? `${userId}님의 페이지`
      : `${userId}님의 페이지 (${pageCount})`;
    
    const newPage = {
      id: newPageId,
      title: pageTitle,
      widgets: positionedWidgets,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    // 페이지 목록 업데이트
    const updatedPages = reindexPages(pages.map(page => ({ ...page, isActive: false })).concat(newPage));
    setPages(updatedPages);
    setCurrentPageId(newPageId);
    setPageTitle(newPage.title);
    setWidgets(positionedWidgets);
    
    // localStorage에 즉시 저장
    persistPagesToStorage(updatedPages);
    console.log('로컬 템플릿으로 페이지 생성 및 저장 완료:', newPage);
    
    setShowTemplateModal(false);
    setShowPageManager(false);
  };

  const switchPage = (pageId: string) => {
    const targetPage = pages.find(page => page.id === pageId);
    if (targetPage) {
      setCurrentPageId(pageId);
      setPageTitle(targetPage.title);
      // 페이지 전환 시에도 위젯 크기와 위치를 업데이트 (동적 크기 사용)
      setWidgets(targetPage.widgets.map((widget, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        
        return {
          ...widget,
          width: cellWidth,
          height: cellHeight,
          x: col * (cellWidth + spacing),
          y: row * (cellHeight + spacing)
        };
      }));
      
      // 배경 설정 복원 (페이지별 배경색 저장/복원)
      if (targetPage.backgroundSettings) {
        setBackgroundSettings(targetPage.backgroundSettings);
        if (currentUser) {
          localStorage.setItem(`backgroundSettings_${currentUser.id}`, JSON.stringify(targetPage.backgroundSettings));
        } else {
          localStorage.setItem('backgroundSettings_guest', JSON.stringify(targetPage.backgroundSettings));
        }
      }
      
      setPages(prev => prev.map(page => ({ ...page, isActive: page.id === pageId })));
      
      // URL 업데이트
      if (currentUser) {
        const pageIndex = pages.findIndex(p => p.id === pageId);
        const userPrefix = currentUser.email?.split('@')[0] || 'user';
        const pageUrl = `${userPrefix}_${pageIndex + 1}`;
        navigate(`/mypage/${pageUrl}`, { replace: true });
      }
    }
  };

  const deletePage = async (pageId: string) => {
    if (pages.length <= 1) {
      alert('최소 하나의 페이지는 유지해야 합니다.');
      return;
    }
    // 휴지통으로 이동
    const target = pages.find(p => p.id === pageId);
    if (target) movePageToTrash(target);
    const remainingPages = reindexPages(pages.filter(page => page.id !== pageId));
    setPages(remainingPages);
    // 삭제된 페이지가 현재 페이지였다면 첫 번째 페이지로 전환
    if (currentPageId === pageId && remainingPages.length > 0) {
      const firstPage = remainingPages[0];
      setCurrentPageId(firstPage.id);
      setPageTitle(firstPage.title);
      setWidgets(firstPage.widgets);
    }

    persistPagesToStorage(remainingPages);

    // Firestore에 soft delete 표시 및 삭제된 페이지의 Firebase 문서 찾아서 업데이트
    try {
      if (currentUser) {
        const pageToDelete = pages.find(p => p.id === pageId);
        if (pageToDelete) {
          // firebaseDocId를 사용하여 직접 문서 업데이트
          if (pageToDelete.firebaseDocId) {
            const docRef = doc(db, 'userPages', pageToDelete.firebaseDocId);
            await updateDoc(docRef, { 
              isDeleted: true, 
              updatedAt: serverTimestamp() 
            });
            console.log('→ Firebase에서 페이지 삭제 완료:', pageToDelete.firebaseDocId);
          } else {
            // firebaseDocId가 없으면 urlId로 찾기
            const userIdPart = (currentUser?.email?.split('@')[0] || 'user');
            const userPageIndex = pages.findIndex(p => p.id === pageId) + 1;
            const urlId = pageToDelete.customUrl || pageToDelete.urlId || `${userIdPart}_${userPageIndex}`;
            
            const pagesRef = collection(db, 'userPages');
            const q = query(pagesRef, where('authorId', '==', currentUser.id), where('urlId', '==', urlId));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const docId = snapshot.docs[0].id;
              const docRef = doc(db, 'userPages', docId);
              await updateDoc(docRef, { 
                isDeleted: true, 
                updatedAt: serverTimestamp() 
              });
              console.log('→ Firebase에서 페이지 삭제 완료 (urlId로 찾음):', docId);
            }
          }
        }
        
        // 나머지 페이지들도 Firebase에 동기화 (urlId 업데이트)
        // 페이지 삭제 후 인덱스가 변경되므로 urlId를 재계산하여 동기화
        try {
          const userIdPart = (currentUser?.email?.split('@')[0] || 'user');
          
          for (let i = 0; i < remainingPages.length; i++) {
            const page = remainingPages[i];
            const newUrlId = page.customUrl || `${userIdPart}_${i + 1}`;
            
            const pagesRef = collection(db, 'userPages');
            let snapshot;
            
            // firebaseDocId가 있으면 직접 업데이트
            if (page.firebaseDocId) {
              const docRef = doc(db, 'userPages', page.firebaseDocId);
              await updateDoc(docRef, {
                urlId: newUrlId,
                pageNumber: i + 1,
                updatedAt: serverTimestamp()
              });
              continue;
            }
            
            // 기존 urlId로 찾기
            const oldUrlId = page.urlId || page.customUrl || `${userIdPart}_${pages.findIndex(p => p.id === page.id) + 1}`;
            snapshot = await getDocs(
              query(pagesRef, where('authorId', '==', currentUser.id), where('urlId', '==', oldUrlId))
            );
            
            if (!snapshot.empty) {
              const docId = snapshot.docs[0].id;
              const docRef = doc(db, 'userPages', docId);
              await updateDoc(docRef, {
                urlId: newUrlId,
                pageNumber: i + 1,
                updatedAt: serverTimestamp()
              });
            }
          }
          
          console.log('→ 나머지 페이지 Firebase 동기화 완료');
        } catch (error) {
          console.error('페이지 동기화 실패:', error);
        }
      }
    } catch (e) {
      console.error('페이지 삭제 플래그 저장 실패:', e);
    }
  };

  // 페이지 순서 변경 (위로 이동)
  const movePageUp = (pageId: string) => {
    const currentIndex = pages.findIndex(page => page.id === pageId);
    if (currentIndex <= 0) return; // 첫 번째 페이지는 위로 이동 불가
    
    const swappedPages = [...pages];
    [swappedPages[currentIndex - 1], swappedPages[currentIndex]] = [swappedPages[currentIndex], swappedPages[currentIndex - 1]];
    const reordered = reindexPages(swappedPages);
    
    setPages(reordered);
    persistPagesToStorage(reordered);
    if (currentUser) {
      syncAllPagesToFirebase(reordered).catch(error => {
        console.error('페이지 순서 동기화 실패:', error);
      });
    }
  };

  // 페이지 순서 변경 (아래로 이동)
  const movePageDown = (pageId: string) => {
    const currentIndex = pages.findIndex(page => page.id === pageId);
    if (currentIndex >= pages.length - 1) return; // 마지막 페이지는 아래로 이동 불가
    
    const swappedPages = [...pages];
    [swappedPages[currentIndex], swappedPages[currentIndex + 1]] = [swappedPages[currentIndex + 1], swappedPages[currentIndex]];
    const reordered = reindexPages(swappedPages);
    
    setPages(reordered);
    persistPagesToStorage(reordered);
    if (currentUser) {
      syncAllPagesToFirebase(reordered).catch(error => {
        console.error('페이지 순서 동기화 실패:', error);
      });
    }
  };

  const updateCurrentPage = (updates: any) => {
    setPages(prev => prev.map(page => 
      page.id === currentPageId 
        ? { ...page, ...updates }
        : page
    ));
  };

  // 위젯 변경 시 현재 페이지 업데이트
  useEffect(() => {
    updateCurrentPage({ widgets });
  }, [widgets]);

  // 페이지 제목 변경 시 현재 페이지 업데이트
  useEffect(() => {
    updateCurrentPage({ title: pageTitle });
  }, [pageTitle]);

  // 위젯 편집 함수
  const editWidget = (widgetId: string) => {
    setEditingWidget(widgetId);
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      if (widget.type === 'bookmark') {
        setFormData({ title: widget.title || '' });
      } else {
        setFormData(widget.content || {});
      }
    }
  };

  const saveWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(w => {
      if (w.id !== widgetId) return w;
      // 제목은 최상위, 그 외는 content에 저장
      const { title: newTitle, ...rest } = (formData || {}) as any;
      if (w.type === 'bookmark') {
        return { ...w, title: typeof newTitle === 'string' ? newTitle : (w.title || ''), content: { ...w.content } };
      }
      return { ...w, content: { ...w.content, ...rest } };
    }));
    setEditingWidget(null);
    setFormData({});
  };

  const cancelEdit = () => {
    setEditingWidget(null);
    setFormData({});
  };

  // 폼 제출 처리
  const handleFormSubmit = (widgetId: string, formType: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      // 폼 데이터를 위젯에 저장
      const newContent = { ...widget.content };
      if (formType === 'rsvp') {
        newContent.submissions = [...(newContent.submissions || []), formData];
      } else if (formType === 'join') {
        newContent.applications = [...(newContent.applications || []), formData];
      } else if (formType === 'contact') {
        newContent.messages = [...(newContent.messages || []), formData];
      }
      
      setWidgets(prev => prev.map(w => 
        w.id === widgetId 
          ? { ...w, content: newContent }
          : w
      ));
      
      alert('제출되었습니다!');
      setFormData({});
    }
  };

  // QR 코드 생성 함수
  const generateQRCode = (url: string) => {
    // 실제 QR 코드 생성 로직 (간단한 시뮬레이션)
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  };

  // D-Day 계산 함수
  const calculateDaysLeft = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // 카테고리 아이콘 함수
  // getCategoryIcon은 import로 사용

  // 위젯 미리보기 렌더링 함수
  const renderWidgetPreview = (widgetType: string) => {
    switch (widgetType) {

      case 'business_info':
        return (
          <div className="space-y-1">
            <div>
              <div className="text-xs font-semibold text-gray-800">영업시간</div>
              <div className="text-xs text-gray-600">평일 08:00-22:00</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-800">전화번호</div>
              <div className="text-xs text-gray-600">02-1234-5678</div>
            </div>
          </div>
        );

      case 'map_section':
        return (
          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg mb-1">🗺️</div>
              <p className="text-xs text-gray-600">지도 보기</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Grid className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">미리보기</p>
            </div>
          </div>
        );
    }
  };

  // 초기화 함수
  const resetToDefault = () => {
    setWidgets([]);
    setPageTitle("'김사용자'님의 페이지");
    setBackgroundSettings({
      type: 'solid',
      color: '#f8fafc',
      gradient: {
        from: '#ffffff',
        to: '#ffffff',
        direction: 'to-br'
      },
      opacity: 1
    });
    setFontSettings({
      family: 'Inter',
      size: 14,
      weight: 'normal',
      style: 'normal',
      color: '#1F2937'
    });
    setLayoutSettings({
      gridSize: 20,
      snapToGrid: true,
      showGrid: true,
      spacing: 10
    });
  };

  // 사용 가능한 위젯들 (카테고리별로 분류)
  // widgetCategories, allWidgets, fontOptions는 이제 import로 사용




  const handleUndoRemove = useCallback(() => {
    const snapshot = undoStackRef.current;
    if (!snapshot) return;

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    if (snapshot.pageId && snapshot.pageId !== currentPageId) {
      undoStackRef.current = null;
      setToast({ type: 'error', msg: '다른 페이지로 이동하여 되돌릴 수 없습니다.' });
      return;
    }

    undoStackRef.current = null;

    setWidgets(prev => {
      if (prev.some(w => w.id === snapshot.widget.id)) {
        return prev;
      }
      const next = [...prev];
      const insertIndex = Math.min(snapshot.index, next.length);
      next.splice(insertIndex, 0, { ...snapshot.widget });
      return next;
    });

    setRecentlyAddedWidgetId(snapshot.widget.id);
    if (addAnimTimerRef.current) {
      clearTimeout(addAnimTimerRef.current);
    }
    addAnimTimerRef.current = setTimeout(() => {
      setRecentlyAddedWidgetId(current => (current === snapshot.widget.id ? null : current));
    }, 600);

    setToast({ type: 'success', msg: '위젯 삭제를 취소했습니다.' });
  }, [setWidgets, currentPageId, setToast]);

  const dismissContinuePrompt = useCallback(() => {
    setShowContinueModal(false);
    setContinuePromptDismissed(true);
    try {
      sessionStorage.setItem('urwebs-continue-dismissed', 'true');
    } catch {
      // ignore storage error
    }
  }, []);

  const handleContinueLater = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.CTA_CLICK, { button: 'trial_continue_later' });
    dismissContinuePrompt();
  }, [dismissContinuePrompt]);

  const handleContinueSave = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.CTA_CLICK, { button: 'trial_continue_save' });
    dismissContinuePrompt();
    navigate('/mypage?auth=continue');
  }, [dismissContinuePrompt, navigate]);

  const continueModal = useMemo(() => {
    if (typeof document === 'undefined') return null;
    if (!showContinueModal) return null;
    return createPortal(
      <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
        <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/85 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            저장하고 계속 이어가볼까요?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            지금 로그인하거나 회원가입하면 방금 구성한 위젯을 그대로 저장해 언제든 다시 수정할 수 있어요.
          </p>
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleContinueLater}
              className="rounded-xl border-slate-300 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-400 hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
            >
              잠시 더 둘러볼게요
            </Button>
            <Button
              onClick={handleContinueSave}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/40 transition hover:bg-indigo-700"
            >
              저장하고 계속
            </Button>
          </div>
        </div>
      </div>,
      document.body
    );
  }, [showContinueModal, handleContinueLater, handleContinueSave]);

  // 위젯 추가
  const addWidget = useCallback((type: string, size: WidgetSize = '1x1', targetColumn?: number) => {
    console.log('addWidget 호출됨:', type, 'size:', size, 'targetColumn:', targetColumn);
    
    // 최근 사용한 위젯 기록
    const recentWidgets = JSON.parse(localStorage.getItem('recentWidgets') || '[]');
    const updated = [type, ...recentWidgets.filter((t: string) => t !== type)].slice(0, 5);
    localStorage.setItem('recentWidgets', JSON.stringify(updated));

    const widgetId =
      typeof window !== 'undefined' && window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `widget_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const wasEmpty = widgets.length === 0;
    
    // 특정 위젯 타입에 따라 자동 크기 설정
    let widgetSize = size;
    let width, height;
    
    if (type === 'google_search' || type === 'naver_search') {
      // 검색 위젯은 2x1 그리드 크기 - 강제로 2칸 너비 설정
      widgetSize = '2x1';
      width = 312; // 2 * 150 + 1 * 12 = 312px (강제 설정)
      height = 160; // 1 * 160 + 0 * 12 = 160px
    } else if (type === 'unified_search') {
      // 통합검색 위젯은 2x1 그리드 크기 - 강제로 2칸 너비 설정
      widgetSize = '2x1';
      width = 312; // 2 * 150 + 1 * 12 = 312px (강제 설정)
      height = 160; // 1 * 160 + 0 * 12 = 160px
      
      // 디버깅을 위한 로그 추가
      console.log('🔍 통합검색 위젯 생성:', { type, width, height, widgetSize });
    } else if (type === 'weather_small') {
      widgetSize = '4x1'; // 메인 컬럼 전체 너비
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'weather_medium') {
      widgetSize = '4x2'; // 메인 컬럼 전체 너비 + 2칸 높이
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'todo') {
      widgetSize = '2x2'; // 할일 위젯은 2칸 너비, 2칸 높이
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'crypto') {
      widgetSize = '1x2'; // 크립토 위젯은 1칸 너비, 2칸 높이
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'frequent_sites') {
      widgetSize = '1x1'; // 자주가는사이트 위젯은 1칸 너비, 1칸 높이 고정
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'bookmark') {
      // 북마크 위젯은 1x2, 1x3, 1x4 크기 가능
      if (size === '1x2' || size === '1x3' || size === '1x4') {
        widgetSize = size;
      } else {
        widgetSize = '1x2';
      }
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'quicknote') {
      // 빠른메모 위젯 기본 1x1, 텍스트가 많아지면 자동 확장
      widgetSize = (size === '1x2') ? '1x2' : '1x1';
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'table') {
      widgetSize = '2x2';
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'calendar') {
      // 캘린더 위젯은 1x1, 1x2 허용 (기본 1x1)
      widgetSize = (size === '1x2') ? '1x2' : '1x1';
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'weather') {
      // 날씨 위젯은 다양한 크기 지원 (1x1, 1x2, 1x3, 2x1, 2x2, 2x3, 3x1, 3x2, 3x3)
      const validWeatherSizes = ['1x1', '1x2', '1x3', '2x1', '2x2', '2x3', '3x1', '3x2', '3x3'];
      if (size && validWeatherSizes.includes(size)) {
        widgetSize = size;
      } else {
        widgetSize = '1x3'; // 기본값
      }
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'english_words') {
      // 영어단어 위젯은 1x1, 1x2 허용
      widgetSize = (size === '1x1' || size === '1x2') ? size : '1x1';
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'dday') {
      // D-Day 위젯은 1x1, 1x2 허용
      widgetSize = (size === '1x2') ? '1x2' : '1x1';
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'quote') {
      // 영감 명언 위젯은 1x1, 2x1 허용
      widgetSize = (size === '2x1') ? '2x1' : '1x1';
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'economic_calendar') {
      widgetSize = '2x2'; // 경제캘린더 위젯은 2칸 너비, 2칸 높이
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'qr_code') {
      widgetSize = '1x1'; // QR 접속 위젯은 1칸 너비, 1칸 높이 고정
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'law_search') {
      // 법제처 검색 위젯은 1x1, 2x1 크기 가능 (기본 1x1)
      widgetSize = (size === '1x1' || size === '2x1') ? size : '1x1';
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'news') {
      // 뉴스피드 위젯은 2x1, 2x2, 2x3 크기 가능 (기본 2x2)
      if (size === '2x1' || size === '2x2' || size === '2x3') {
        widgetSize = size;
      } else {
        widgetSize = '2x2';
      }
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else if (type === 'image') {
      // 이미지 위젯은 2x2, 3x3만 허용 (기본 2x2)
      const s = (size as any) as string;
      if (s === '2x2' || s === '3x3') {
        widgetSize = s as any;
      } else {
        widgetSize = '2x2' as any;
      }
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    } else {
      // 기본 크기
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    }
    
    setWidgets(prevWidgets => {
      // 그리드 좌표로 컬럼 하단을 계산
      const totalCols = isMobile ? 4 : (COLS || 8);
      const getColumnBottom = (colIndex: number) => {
        const widgetsInCol = prevWidgets.filter(w => (w.x ?? 0) === colIndex);
        if (widgetsInCol.length === 0) return 0;
        return Math.max(...widgetsInCol.map(w => (w.y ?? 0) + (w.gridSize?.h || 1)));
      };

      // 배치할 컬럼 선택: 지정된 컬럼 또는 가장 낮은 컬럼
      const targetCol = (typeof targetColumn === 'number' && targetColumn >= 0)
        ? targetColumn
        : (() => {
            let minBottom = Number.MAX_SAFE_INTEGER;
            let best = 0;
            for (let c = 0; c < totalCols; c++) {
              const bottom = getColumnBottom(c);
              if (bottom < minBottom) {
                minBottom = bottom;
                best = c;
              }
            }
            return best;
          })();

      const columnBottom = getColumnBottom(targetCol);
    
    // widgetSize를 gridSize로 변환 (예: '2x2' -> { w: 2, h: 2 })
    const parseGridSize = (size: string): { w: number; h: number } => {
      const [w, h] = size.split('x').map(Number);
      return { w: w || 1, h: h || 1 };
    };
    
    const gridSize = parseGridSize(widgetSize);
    
    const newWidget: Widget = {
      id: widgetId,
      type: type as any,
        // 그리드 좌표로 추가: 선택 컬럼의 맨 아래
        x: targetCol,
        y: columnBottom,
        // width/height는 그리드 단위로 저장해 일관성 유지
        width: gridSize.w,
        height: gridSize.h,
      title: allWidgets.find(w => w.type === type)?.name || '새 위젯',
      content: type === 'bookmark' 
        ? { bookmarks: [] } 
        : type === 'quicknote' 
        ? { text: '', lastSaved: null }
        : type === 'english_words'
        ? { currentWord: { word: 'Serendipity', pronunciation: '[serənˈdipəti]', meaning: '우연히 좋은 일을 발견하는 것' } }
        : undefined,
      zIndex: 1, // 모든 새 위젯은 기본 Z-index로 설정
      size: widgetSize, // 위젯 사이즈 추가
      gridSize: gridSize, // 그리드 크기 추가
      variant: (type === 'google_search' || type === 'naver_search') ? 'compact' : undefined // 검색 위젯은 컴팩트 모드
  };
      
      console.log('🎨 새 위젯 추가:', {
        type,
        size: widgetSize,
        dimensions: { w: gridSize.w, h: gridSize.h },
        position: { x: targetCol, y: columnBottom }
      });
      return [...prevWidgets, newWidget];
    });
    
    setRecentlyAddedWidgetId(widgetId);
    if (addAnimTimerRef.current) {
      clearTimeout(addAnimTimerRef.current);
    }
    addAnimTimerRef.current = setTimeout(() => {
      setRecentlyAddedWidgetId(current => (current === widgetId ? null : current));
    }, 600);
    
    if (wasEmpty && !firstWidgetFeedbackShownRef.current) {
      firstWidgetFeedbackShownRef.current = true;
      try {
        localStorage.setItem('urwebs-first-widget-feedback-shown', 'true');
      } catch (error) {
        console.warn('[MyPage] 첫 위젯 피드백 저장 실패', error);
      }
      setHighlightedWidgetId(widgetId);
      setShowFirstWidgetTooltip(true);
      completeTutorialStep('widget', { widgetType: type });
      trackEvent(ANALYTICS_EVENTS.FIRST_WIDGET_ADDED, {
        widgetType: type,
        pageId: currentPageId ?? 'guest',
        userType: currentUser ? 'member' : 'guest'
      });
    } else {
      trackEvent(ANALYTICS_EVENTS.WIDGET_ADDED, {
        widgetType: type,
        pageId: currentPageId ?? 'guest',
        userType: currentUser ? 'member' : 'guest'
      });
    }
  }, [cellWidth, cellHeight, spacing, getNextAvailablePosition, widgets, currentPageId, currentUser]);

  // 위젯 삭제
  const removeWidget = (id: string) => {
    const index = widgets.findIndex(w => w.id === id);
    if (index === -1) return;
    const removedWidget = widgets[index];

    setWidgets(prev => prev.filter(w => w.id !== id));

    if (selectedWidget === id) {
      setSelectedWidget(null);
    }
    if (highlightedWidgetId === id) {
      setHighlightedWidgetId(null);
    }

    undoStackRef.current = {
      widget: { ...removedWidget },
      index,
      pageId: currentPageId
    };

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    undoTimerRef.current = setTimeout(() => {
      undoStackRef.current = null;
      setToast(null);
    }, 5000);

    setToast({
      type: 'info',
      msg: '위젯이 삭제되었습니다.',
      actionLabel: '되돌리기',
      onAction: () => handleUndoRemove()
    });
  };

  // 모든 페이지를 Firebase에 동기화하는 헬퍼 함수
  async function syncAllPagesToFirebase(pagesToSync: Page[]) {
    if (!currentUser || pagesToSync.length === 0) return;
    
    try {
      const userIdPart = (currentUser?.email?.split('@')[0] || 'user');
      
      for (let i = 0; i < pagesToSync.length; i++) {
        const page = pagesToSync[i];
        const urlId = page.customUrl || page.urlId || `${userIdPart}_${i + 1}`;
        
        const pagesRef = collection(db, 'userPages');
        const q = query(pagesRef, where('authorId', '==', currentUser.id), where('urlId', '==', urlId));
        const snapshot = await getDocs(q);
        
        const pageData = {
          title: page.title || '제목 없음',
          description: '',
          authorId: currentUser.id || '',
          authorName: currentUser.name || '익명',
          authorEmail: currentUser.email || '',
          category: '일반',
          isPublic: shareSettings.isPublic || false,
          urlId: urlId,
          pageNumber: i + 1,
          widgets: page.widgets.map((w: any) => ({
            id: w.id,
            type: w.type,
            title: w.title || '',
            x: w.x || 0,
            y: w.y || 0,
            width: w.width || 1,
            height: w.height || 1,
            gridSize: w.gridSize || { w: w.width || 1, h: w.height || 1 },
            size: w.size || `${w.width || 1}x${w.height || 1}`,
            content: w.content || {}
          })),
          tags: [],
          views: 0,
          likes: 0,
          updatedAt: serverTimestamp()
        };
        
        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id;
          const docRef = doc(db, 'userPages', docId);
          await updateDoc(docRef, {
            ...pageData,
            isDeleted: false,
            updatedAt: serverTimestamp()
          });
        } else {
          // 새 페이지 생성
          await addDoc(pagesRef, {
            ...pageData,
            isDeleted: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            views: 0,
            likes: 0,
            copies: 0
          });
        }
      }
      
      console.log('→ 모든 페이지 Firebase 동기화 완료');
    } catch (error) {
      console.error('Firebase 동기화 실패:', error);
    }
  }

  // 페이지 저장
  const savePage = useCallback(async () => {
    console.log('=== 저장하기 버튼 클릭 ===');
    console.log('currentUser:', currentUser);
    console.log('pageTitle:', pageTitle);
    console.log('widgets 개수:', widgets.length);
    console.log('widgets 상세:', widgets);
    console.log('shareSettings.isPublic:', shareSettings.isPublic);
    console.log('currentPageId:', currentPageId);
    console.log('pages:', pages);
    
    trackEvent(ANALYTICS_EVENTS.SAVE_DASHBOARD, {
      pageId: currentPageId ?? 'guest',
      widgetCount: widgets.length,
      userType: currentUser ? 'member' : 'guest',
    });
    
    // 위젯이 비어있어도 배경 설정 등은 저장 가능하도록 허용
    // if (widgets.length === 0) {
    //   console.warn('⚠️ 저장할 위젯이 없습니다!');
    //   setToast({ type: 'error', msg: '저장할 위젯이 없습니다. 위젯을 추가한 후 다시 시도해주세요.' });
    //   return;
    // }
    
    // 현재 페이지가 없으면 새 페이지 생성
    let updatedPages = pages;
    let targetPageId = currentPageId;
    
    if (!currentPageId || !pages.find(p => p.id === currentPageId)) {
      // 새 페이지 생성
      const newPageId = `page_${Date.now()}`;
      const newPage: Page = {
        id: newPageId,
        title: pageTitle,
        widgets: widgets,
        createdAt: Date.now(),
        isActive: true,
        backgroundSettings: backgroundSettings // 새 페이지에도 배경 설정 포함
      };
      updatedPages = [...pages, newPage];
      targetPageId = newPageId;
      setCurrentPageId(newPageId);
      updatedPages = reindexPages(updatedPages);
      console.log('새 페이지 생성:', newPageId);
    } else {
      // 기존 페이지 업데이트
      updatedPages = pages.map(page => {
        if (page.id === currentPageId) {
          return {
            ...page,
            title: pageTitle,
            widgets: widgets,
            backgroundSettings: backgroundSettings // 배경 설정도 페이지에 저장
          };
        }
        return page;
      });
      updatedPages = reindexPages(updatedPages);
    }
    
    setPages(updatedPages);
    console.log('updatedPages:', updatedPages);
    
    // localStorage에 저장 (로컬 백업)
    if (currentUser) {
      localStorage.setItem(`myPages_${currentUser.id}`, JSON.stringify(updatedPages));
      // 공개 설정도 함께 저장
      localStorage.setItem(`shareSettings_${currentUser.id}`, JSON.stringify(shareSettings));
      // 배경 설정도 함께 저장
      localStorage.setItem(`backgroundSettings_${currentUser.id}`, JSON.stringify(backgroundSettings));
      // 커스텀 URL도 저장
      if (customUrl) {
        localStorage.setItem(`customUrl_${currentUser.id}_${currentPageId}`, customUrl);
      }
      console.log('페이지 저장됨 (사용자:', currentUser.id, '):', updatedPages);
      console.log('공개 설정 저장됨:', shareSettings);
      console.log('배경 설정 저장됨:', backgroundSettings);
      console.log('커스텀 URL:', customUrl);
    } else {
      localStorage.setItem('myPages', JSON.stringify(updatedPages));
      // 게스트도 공개 설정 저장
      localStorage.setItem('shareSettings_guest', JSON.stringify(shareSettings));
      // 게스트도 배경 설정 저장
      localStorage.setItem('backgroundSettings_guest', JSON.stringify(backgroundSettings));
      console.log('페이지 저장됨 (게스트):', updatedPages);
      console.log('공개 설정 저장됨 (게스트):', shareSettings);
      console.log('배경 설정 저장됨 (게스트):', backgroundSettings);
    }

    trackEvent(ANALYTICS_EVENTS.TEMPLATE_SAVED, {
      pageId: targetPageId,
      widgetCount: widgets.length,
      mode: currentUser ? 'authenticated' : 'guest',
    });

    completeTutorialStep('save', {
      pageId: targetPageId,
      widgetCount: widgets.length,
      userType: currentUser ? 'member' : 'guest'
    });
    
    // Firebase에 저장 (로그인한 사용자면 항상 저장 - 공개/비공개 무관)
    console.log('Firebase 저장 조건 체크:', { currentUser: !!currentUser, isPublic: shareSettings.isPublic });
    if (currentUser) {
      console.log('→ Firebase 저장 시작 (공개/비공개 모두 저장)');
      
      // pageData를 try 블록 밖에서 선언하여 catch에서도 접근 가능하도록
      let pageData: any = null;
      
      try {
        const currentPage = updatedPages.find(p => p.id === targetPageId);
        if (!currentPage) {
          console.error('❌ 현재 페이지를 찾을 수 없습니다:', targetPageId);
          setToast({ type: 'error', msg: '저장 실패: 현재 페이지를 찾을 수 없습니다.' });
          return;
        }

        // urlId 생성
        const userIdPart = (currentUser?.email?.split('@')[0] || 'user');
        const userPageIndex = updatedPages.findIndex(p => p.id === targetPageId) + 1;
        const urlId = customUrl || `${userIdPart}_${userPageIndex}`;
        
        console.log('🔍 URL ID 생성 정보:', {
          userIdPart,
          userPageIndex,
          customUrl,
          finalUrlId: urlId
        });

        // undefined 값을 제거하는 헬퍼 함수
        const removeUndefined = (obj: any): any => {
          if (Array.isArray(obj)) {
            return obj.map(item => removeUndefined(item));
          }
          if (obj !== null && typeof obj === 'object') {
            return Object.entries(obj).reduce((acc, [key, value]) => {
              if (value !== undefined) {
                acc[key] = removeUndefined(value);
              }
              return acc;
            }, {} as any);
          }
          return obj;
        };

        pageData = removeUndefined({
          title: pageTitle || '제목 없음',
          description: '',
          authorId: currentUser.id || '',
          authorName: currentUser.name || '익명',
          authorEmail: currentUser.email || '',
          category: '일반',
          isPublic: shareSettings.isPublic || false,
          urlId: urlId, // 공유 URL용 고유 ID
          pageNumber: userPageIndex, // 페이지 번호
          backgroundSettings: backgroundSettings, // 배경 설정 저장
          widgets: widgets.map(w => {
            const parseSize = (s: any) => {
              if (typeof s === 'string' && /(\d+)x(\d+)/.test(s)) {
                const [, sw, sh] = (s as string).match(/(\d+)x(\d+)/) as any;
                return { w: Number(sw), h: Number(sh) };
              }
              return null;
            };
      // 검색 위젯: 최소 너비 2 보장, 높이는 선택값 존중(2x2 허용)
      let gridSize;
      if (w.type === 'google_search' || w.type === 'naver_search' || w.type === 'unified_search') {
        const existing = w.gridSize || parseSize(w.size);
        const ensured = existing || { w: 2, h: 1 };
        gridSize = { w: Math.max(2, ensured.w || 2), h: Math.max(1, ensured.h || 1) };
      } else {
        gridSize = w.gridSize || parseSize(w.size) || {
          w: toGridW(w.width || 150),
          h: toGridH(w.height || 160),
        };
      }
            return ({
              id: w.id,
              type: w.type,
              title: w.title || '',
              x: w.x || 0, // 이미 그리드 좌표이므로 그대로 사용
              y: w.y || 0, // 이미 그리드 좌표이므로 그대로 사용
              width: gridSize.w,
              height: gridSize.h,
              gridSize,
              size: typeof w.size === 'string' ? w.size : `${gridSize.w}x${gridSize.h}`,
              content: w.content || {}
            });
          }),
          tags: [],
          views: 0,
          likes: 0,
          updatedAt: serverTimestamp()
        });

        console.log('📦 저장할 페이지 데이터:', {
          title: pageData.title,
          authorId: pageData.authorId,
          authorEmail: pageData.authorEmail,
          isPublic: pageData.isPublic,
          urlId: pageData.urlId,
          widgetCount: pageData.widgets.length
        });

        // 기존 페이지가 있는지 확인 (authorId, urlId 기준)
        console.log('🔍 기존 페이지 확인 중... (authorId:', currentUser.id, ', urlId:', urlId, ')');
        const pagesRef = collection(db, 'userPages');
        const q = query(pagesRef, where('authorId', '==', currentUser.id), where('urlId', '==', urlId));
        const snapshot = await getDocs(q);
        console.log('기존 페이지 검색 결과:', snapshot.docs.length, '개');

        if (!snapshot.empty) {
          // 기존 페이지 업데이트
          const docId = snapshot.docs[0].id;
          console.log('📝 기존 페이지 업데이트 중... (docId:', docId, ')');
          const docRef = doc(db, 'userPages', docId);
          await updateDoc(docRef, {
            ...pageData,
            isDeleted: false,
            updatedAt: serverTimestamp()
          });
          console.log('✅ Firebase 페이지 업데이트 완료! (docId:', docId, ')');
        } else if ((currentPage as any)?.firebaseDocId) {
          // urlId로는 못 찾았지만 로컬에 firebaseDocId가 있으면 해당 문서 업데이트
          const fallbackId = (currentPage as any).firebaseDocId as string;
          console.log('📝 fallback: firebaseDocId로 업데이트 시도 (docId:', fallbackId, ')');
          const docRef = doc(db, 'userPages', fallbackId);
          await updateDoc(docRef, {
            ...pageData,
            isDeleted: false,
            updatedAt: serverTimestamp()
          });
          console.log('✅ Firebase 페이지 업데이트 완료! (fallback docId:', fallbackId, ')');
        } else {
          // 새 페이지 생성 (처음 저장할 때만)
          console.log('🆕 새 페이지 생성 중...');
          const docRef = await addDoc(pagesRef, {
            ...pageData,
            isDeleted: false,
            // 공개 목록 노출을 위해 생성 시점에도 updatedAt 채움
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            // 메인 추천/통계를 위한 기본값 초기화
            views: 0,
            likes: 0,
            copies: 0
          });
          console.log('✅ Firebase 새 페이지 생성 완료! (docId:', docRef.id, ')');
        }
        console.log('→ 🎉 Firebase 저장 완료! 메인페이지에서 확인하세요!');
        
        // 공유 URL 생성 (위에서 이미 생성된 urlId 사용)
        const shareUrl = `${window.location.origin}/${urlId}`;
        
        console.log('🎉 공유 URL 생성됨:', shareUrl);
        
        // 성공 메시지 with 공유 URL
        setToast({ type: 'success', msg: `저장 완료! 공유 URL: ${shareUrl}` }); // 5초로 연장
        
        console.log('공유 URL:', shareUrl);
        return;
      } catch (error: any) {
        console.error('❌ Firebase 저장 실패:', error);
        console.error('에러 메시지:', error?.message);
        console.error('에러 코드:', error?.code);
        console.error('에러 스택:', error?.stack);
        if (pageData) {
          console.error('저장하려던 데이터:', {
            title: pageData.title,
            widgetCount: pageData.widgets?.length || 0,
            urlId: pageData.urlId,
            authorId: pageData.authorId
          });
        } else {
          console.error('pageData가 생성되지 않았습니다.');
        }
        
        // 사용자에게 에러 알림
        const errorMsg = error?.message || error?.code || '알 수 없는 오류';
        setToast({ type: 'error', msg: `Firebase 저장 실패: ${errorMsg}. 로컬에는 저장되었습니다.` });
        
        // Firebase 저장 실패해도 로컬에는 저장되었으므로 계속 진행
        // 하지만 에러를 다시 throw하여 개발자가 확인할 수 있도록
        throw error;
      }
    } else {
      console.log('→ Firebase 저장 조건 미충족');
      console.log('  - currentUser:', currentUser ? '로그인됨' : '로그인 안됨');
      console.log('  - shareSettings.isPublic:', shareSettings.isPublic ? '공개' : '비공개');
    }
    
    // 성공 메시지 (비공개 또는 게스트)
    if (currentUser) {
      setToast({ type: 'success', msg: shareSettings.isPublic ? '저장되었습니다 (공개)' : '저장되었습니다 (비공개)' });
    } else {
      setToast({ type: 'success', msg: '저장되었습니다 (게스트)' });
    }
  }, [pages, currentPageId, pageTitle, widgets, currentUser, shareSettings, customUrl]);

  // 위젯 변경 시 자동 저장 (localStorage에만 저장, Firebase는 수동 저장 버튼으로만)
  useEffect(() => {
    // 초기 로드 시에는 저장하지 않음
    if (widgets.length === 0) return;
    
    const timer = setTimeout(() => {
      const updated = reindexPages(pages.map(p => p.id === currentPageId ? { ...p, title: pageTitle, widgets } : p));
      persistPagesToStorage(updated);
      setPages(updated);
    }, 800);
    return () => clearTimeout(timer);
  }, [widgets, currentPageId, pageTitle, currentUser?.id]); // pages는 의존성에서 제외

  // 토스트 자동 제거
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // 위젯 업데이트 (충돌 감지 및 해결 포함)
  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    setWidgets(prevWidgets => {
      // 업데이트할 위젯 찾기
      const targetWidget = prevWidgets.find(w => w.id === id);
      if (!targetWidget) return prevWidgets;

      // 북마크 위젯 높이 증가 시 최소한의 충돌 처리만 수행
      // 복잡한 충돌 처리는 DraggableDashboardGrid의 normalizeLayout에 맡김
      // 여기서는 단순히 업데이트만 수행
      
      // 일반 업데이트 (높이 변경 없음)
      const updatedWidget = { ...targetWidget, ...updates };
      return prevWidgets.map(w => w.id === id ? updatedWidget : w);
    });
  }, [cellHeight, spacing, mainColumnWidth]);

  // 북마크를 다른 위젯으로 이동
  const handleMoveBookmarkToWidget = useCallback((bookmark: any, sourceWidgetId: string, targetWidgetId: string) => {
    // 소스 위젯의 북마크 데이터 읽기
    const sourceState = readLocal(sourceWidgetId, { bookmarks: [] });
    const updatedSourceBookmarks = sourceState.bookmarks.filter((bm: any) => bm.id !== bookmark.id);
    
    // 소스 위젯 업데이트
    persistOrLocal(sourceWidgetId, { ...sourceState, bookmarks: updatedSourceBookmarks }, updateWidget);
    
    // 타겟 위젯의 북마크 데이터 읽기
    const targetState = readLocal(targetWidgetId, { bookmarks: [] });
    const updatedTargetBookmarks = [...(targetState.bookmarks || []), { ...bookmark, id: Date.now().toString() }];
    
    // 타겟 위젯 업데이트
    persistOrLocal(targetWidgetId, { ...targetState, bookmarks: updatedTargetBookmarks }, updateWidget);
  }, [updateWidget]);

  const handleRenameWidget = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget || widget.type !== 'bookmark') {
      return;
    }

    const defaultTitle =
      widget.title?.trim() ||
      allWidgets.find(w => w.type === widget.type)?.name ||
      '위젯';

    const newTitle = window.prompt('폴더 이름을 입력하세요.', defaultTitle);
    if (newTitle === null) return;

    const trimmed = newTitle.trim();
    if (!trimmed) {
      setToast({ type: 'error', msg: '폴더 이름은 비워둘 수 없어요.' });
      return;
    }

    updateWidget(widgetId, { title: trimmed });
    setPages(prev => {
      const updated = reindexPages(
        prev.map(page =>
          page.id === currentPageId
            ? {
                ...page,
                widgets: page.widgets.map(w =>
                  w.id === widgetId ? { ...w, title: trimmed } : w
                ),
              }
            : page
        )
      );
      persistPagesToStorage(updated);
      return updated;
    });
  };

  // 위젯 선택
  const selectWidget = (id: string) => {
    if (isEditMode) {
      setSelectedWidget(id);
      // z-index를 최상위로 (드래그 중이 아닐 때만) - 하지만 페이지 관리 패널보다는 낮게
      if (!draggedWidget) {
        const maxWidgetZIndex = Math.max(...widgets.map(w => w.zIndex || 1), 1);
        const newZIndex = Math.min(maxWidgetZIndex + 1, 9999); // 페이지 관리 패널(z-[999999])보다 낮게 제한
        updateWidget(id, { zIndex: newZIndex });
      }
    }
  };

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent, widgetId: string) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    setDraggedWidget(widgetId);
    setSelectedWidget(widgetId);
    
    // 캔버스 기준으로 오프셋 계산
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - canvasRect.left - widget.x,
      y: e.clientY - canvasRect.top - widget.y
    });
    
    
    // 드래그 시작 시 순서 변경 모드 활성화
    setIsReordering(true);
  };


  // 드래그 종료
  const handleMouseUp = () => {
    if (!draggedWidget) return;

    setWidgets(prev => {
      const dw = prev.find(w => w.id === draggedWidget);
      if (!dw) return prev;

      const draggedCol = Math.floor(dw.x / COL_TRACK);
      const colliders = prev.filter(w => {
        if (w.id === draggedWidget) return false;
        const col = Math.floor(w.x / COL_TRACK);
        return col === draggedCol && isWidgetOverlapping(dw, w); // utils의 함수 사용
      });

      if (colliders.length === 0) return prev;

      const topCollider = colliders.reduce((a, b) => (a.y < b.y ? a : b));
      const draggedBottom = dw.y + dw.height;
      const moveDistance = draggedBottom + spacing - topCollider.y;

      return prev.map(w => {
        const col = Math.floor(w.x / COL_TRACK);
        if (w.id !== draggedWidget && col === draggedCol && w.y >= topCollider.y) {
          return { ...w, y: w.y + moveDistance };
        }
        return w;
      });
    });

    setDraggedWidget(null);
    setDragOverWidget(null);
    setIsReordering(false);
  };

  // 위젯 순서 변경
  const reorderWidgets = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    
    const draggedIndex = widgets.findIndex(w => w.id === draggedId);
    const targetIndex = widgets.findIndex(w => w.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newWidgets = [...widgets];
    const [draggedWidget] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, draggedWidget);
    
    setWidgets(newWidgets);
  };


  // 링크 열기
  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  // 즐겨찾기 추가
  const addBookmark = (widgetId: string) => {
    const name = prompt('사이트 이름을 입력하세요:');
    if (!name) return;
    
    const url = prompt('URL을 입력하세요 (예: https://naver.com):');
    if (!url) return;
    
    // URL이 http:// 또는 https://로 시작하지 않으면 추가
    const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    
    // 도메인에 따른 아이콘 자동 설정
    const getIconForDomain = (domain: string) => {
      const lowerDomain = domain.toLowerCase();
      if (lowerDomain.includes('naver')) return '🔍';
      if (lowerDomain.includes('google')) return '🔍';
      if (lowerDomain.includes('youtube')) return '📺';
      if (lowerDomain.includes('github')) return '💻';
      if (lowerDomain.includes('facebook')) return '📘';
      if (lowerDomain.includes('instagram')) return '📷';
      if (lowerDomain.includes('twitter')) return '🐦';
      if (lowerDomain.includes('linkedin')) return '💼';
      if (lowerDomain.includes('netflix')) return '🎬';
      if (lowerDomain.includes('spotify')) return '🎵';
      return '🌐';
    };
    
    const domain = new URL(fullUrl).hostname;
    const icon = getIconForDomain(domain);
    
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        name,
      url: fullUrl,
      icon,
        color: 'bg-blue-100'
      };
      
      setWidgets(widgets.map(w => 
        w.id === widgetId 
          ? { ...w, content: { ...w.content, bookmarks: [...(w.content?.bookmarks || []), newBookmark] }}
          : w
      ));
  };

  // 공유 관련 함수들
  const toggleShare = () => {
    setShareSettings(prev => ({ ...prev, isPublic: !prev.isPublic }));
  };

  const copyShareLink = () => {
    const shareUrl = `https://${shareSettings.customDomain}.urwebs.com`;
    navigator.clipboard.writeText(shareUrl);
    // 토스트 알림 등 추가 가능
  };

  const openSharePage = () => {
    const shareUrl = `https://${shareSettings.customDomain}.urwebs.com`;
    window.open(shareUrl, '_blank');
  };

  const generateCustomDomain = () => {
    // 실제로는 서버에서 고유한 도메인을 생성해야 함
    const randomId = Math.random().toString(36).substring(2, 8);
    setShareSettings(prev => ({ ...prev, customDomain: `user${randomId}` }));
  };

  // 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 영어 단어 자동 재생
  useEffect(() => {
    if (englishWordsSettings.isAutoPlay) {
      const words = [
        { word: 'Serendipity', pronunciation: '[serənˈdipəti]', meaning: '우연히 좋은 일을 발견하는 것' },
        { word: 'Ephemeral', pronunciation: '[ɪˈfemərəl]', meaning: '순간적인, 덧없는' },
        { word: 'Resilience', pronunciation: '[rɪˈzɪljəns]', meaning: '회복력, 탄력성' },
        { word: 'Ubiquitous', pronunciation: '[juˈbɪkwɪtəs]', meaning: '어디에나 있는, 만연한' },
        { word: 'Magnificent', pronunciation: '[mæɡˈnɪfəsənt]', meaning: '웅장한, 훌륭한' },
        { word: 'Melancholy', pronunciation: '[ˈmelənkɑːli]', meaning: '우울함, 서정적 슬픔' }
      ];
      
      const englishWordsTimer = setInterval(() => {
        const englishWordsWidget = widgets.find(w => w.type === 'english_words');
        if (englishWordsWidget) {
          const randomWord = words[Math.floor(Math.random() * words.length)];
          updateWidget(englishWordsWidget.id, { 
            content: { ...englishWordsWidget.content, currentWord: randomWord }
          });
        }
      }, englishWordsSettings.interval);

      return () => clearInterval(englishWordsTimer);
    }
  }, [englishWordsSettings.isAutoPlay, englishWordsSettings.interval, widgets]);

  // 새 창에서 위젯 추가 메시지 수신
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ADD_WIDGET') {
        const targetCol = (window as any).targetColumn;
        addWidget(event.data.widgetType, event.data.size || '1x1', targetCol);
        // 사용 후 초기화
        (window as any).targetColumn = undefined;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []); // addWidget을 의존성에서 제거 (한 번만 등록)

  // 각 컬럼의 마지막 위젯과 컬럼 하단 여백에 마우스 오버 시 위젯 추가 기능

  const openWidgetShop = () => {
    setShowWidgetModal(true);
  };
  
  // 기존 새 창 코드 제거됨
  const openWidgetShopOLD = () => {
    const widgetShopWindow = window.open(
      '',
      'widgetShop',
      'width=1400,height=900,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no'
    );
    
    if (widgetShopWindow) {
      widgetShopWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>위젯 상점</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5;
            }
            .header {
              background: white;
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 20px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .widget-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
              gap: 20px;
              padding: 20px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .widget-card {
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              cursor: pointer;
              transition: all 0.3s;
              background: white;
            }
            .widget-card:hover {
              border-color: #10b981;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              transform: translateY(-2px);
            }
            .widget-icon {
              width: 60px;
              height: 60px;
              background: #f3f4f6;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 15px;
              font-size: 24px;
            }
            .widget-title {
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              margin-bottom: 8px;
              color: #374151;
            }
            .widget-desc {
              font-size: 14px;
              color: #6b7280;
              text-align: center;
              margin-bottom: 15px;
              line-height: 1.4;
            }
            .add-btn {
              width: 100%;
              padding: 8px 16px;
              background: #10b981;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              cursor: pointer;
              transition: background 0.2s;
            }
            .add-btn:hover {
              background: #059669;
            }
            .close-btn {
              position: absolute;
              top: 20px;
              right: 20px;
              background: #ef4444;
              color: white;
              border: none;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              font-size: 18px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <!-- 왼쪽 카테고리 사이드바 -->
          <div style="width: 280px; background: white; border-right: 1px solid #e2e8f0; height: 100vh; overflow-y: auto; position: fixed; left: 0; top: 0;">
            <div style="padding: 20px; border-bottom: 1px solid #e2e8f0;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">🎨 위젯 상점</h2>
              <p style="margin: 8px 0 0; font-size: 14px; color: #64748b;">카테고리를 선택하세요</p>
            </div>
            <div id="categoryList">
              <!-- 카테고리 버튼들이 여기에 동적으로 추가됩니다 -->
            </div>
          </div>

          <!-- 메인 콘텐츠 영역 -->
          <div style="margin-left: 280px; min-height: 100vh; background: #f8fafc;">
            <div style="padding: 20px;">
              <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h3 id="categoryTitle" style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #1e293b;">카테고리를 선택하세요</h3>
                <p id="categoryDesc" style="margin: 0; color: #64748b;">왼쪽에서 원하는 카테고리를 클릭하세요</p>
              </div>
              
              <div id="widgetGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                <!-- 위젯들이 여기에 동적으로 추가됩니다 -->
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #64748b;">
                  <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                  <p style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">카테고리를 선택해주세요</p>
                  <p style="font-size: 14px;">왼쪽에서 원하는 카테고리를 클릭하세요</p>
                </div>
              </div>
            </div>
          </div>

          <button style="position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 18px; cursor: pointer; z-index: 1000;" onclick="window.close()">×</button>
          
          <script>
            // 위젯 카테고리 데이터
            const widgetCategories = ${JSON.stringify(widgetCategories)};
            
            let selectedCategory = '';
            
            function getCategoryIcon(categoryKey) {
              const icons = {
                productivity: '📊',
                finance: '💰',
                development: '🔧',
                information: '📰',
                media: '🎵',
                design: '🎨',
                education: '📚',
                social: '👥',
                system: '⚙️'
              };
              return icons[categoryKey] || '📦';
            }
            
            function renderWidgetPreview(widgetType) {
              const previews = {
                todo: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                      <div style="width: 12px; height: 12px; border: 1px solid #cbd5e1; border-radius: 2px;"></div>
                      <div style="width: 60px; height: 8px; background: #e2e8f0; border-radius: 2px;"></div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                      <div style="width: 12px; height: 12px; border: 1px solid #cbd5e1; border-radius: 2px;"></div>
                      <div style="width: 45px; height: 8px; background: #e2e8f0; border-radius: 2px;"></div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="width: 12px; height: 12px; border: 1px solid #cbd5e1; border-radius: 2px;"></div>
                      <div style="width: 70px; height: 8px; background: #e2e8f0; border-radius: 2px;"></div>
                    </div>
                  </div>
                \`,
                weather: \`
                  <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 6px; padding: 8px; width: 100%; height: 100%; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="font-size: 20px; margin-bottom: 4px;">☀️</div>
                    <div style="font-size: 12px; font-weight: 500;">22°C</div>
                    <div style="font-size: 10px; opacity: 0.8;">맑음</div>
                  </div>
                \`,
                weather_small: \`
                  <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 6px; padding: 6px; width: 100%; height: 100%; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="font-size: 16px; margin-bottom: 2px;">☀️</div>
                    <div style="font-size: 10px; font-weight: 500;">22°</div>
                    <div style="font-size: 8px; opacity: 0.8;">맑음</div>
                  </div>
                \`,
                weather_medium: \`
                  <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 6px; padding: 8px; width: 100%; height: 100%; color: white; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="font-size: 18px;">☀️</div>
                      <div>
                        <div style="font-size: 12px; font-weight: 500;">22°</div>
                        <div style="font-size: 8px; opacity: 0.8;">맑음</div>
                      </div>
                    </div>
                    <div style="text-align: right; font-size: 8px; opacity: 0.8;">
                      <div>체감 24°</div>
                      <div>습도 60%</div>
                    </div>
                  </div>
                \`,
                bookmark: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 16px; margin-bottom: 2px;">🔍</div>
                      <div style="width: 20px; height: 4px; background: #e2e8f0; border-radius: 1px;"></div>
                    </div>
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 16px; margin-bottom: 2px;">📧</div>
                      <div style="width: 20px; height: 4px; background: #e2e8f0; border-radius: 1px;"></div>
                    </div>
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 16px; margin-bottom: 2px;">🎵</div>
                      <div style="width: 20px; height: 4px; background: #e2e8f0; border-radius: 1px;"></div>
                    </div>
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 16px; margin-bottom: 2px;">📱</div>
                      <div style="width: 20px; height: 4px; background: #e2e8f0; border-radius: 1px;"></div>
                    </div>
                  </div>
                \`,
                crypto: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <div style="width: 20px; height: 20px; background: #f59e0b; border-radius: 50%;"></div>
                      <div style="width: 30px; height: 6px; background: #10b981; border-radius: 2px;"></div>
                    </div>
                    <div style="width: 40px; height: 8px; background: #1e293b; border-radius: 2px; margin-bottom: 4px;"></div>
                    <div style="width: 25px; height: 6px; background: #10b981; border-radius: 2px;"></div>
                  </div>
                \`,
                news: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%;">
                    <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 2px; margin-bottom: 6px;"></div>
                    <div style="width: 80%; height: 6px; background: #e2e8f0; border-radius: 2px; margin-bottom: 6px;"></div>
                    <div style="width: 60%; height: 6px; background: #e2e8f0; border-radius: 2px; margin-bottom: 6px;"></div>
                    <div style="width: 40%; height: 4px; background: #cbd5e1; border-radius: 2px;"></div>
                  </div>
                \`,
                timer: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">25:00</div>
                    <div style="display: flex; gap: 4px;">
                      <div style="width: 16px; height: 16px; background: #10b981; border-radius: 50%;"></div>
                      <div style="width: 16px; height: 16px; background: #ef4444; border-radius: 50%;"></div>
                      <div style="width: 16px; height: 16px; background: #6b7280; border-radius: 50%;"></div>
                    </div>
                  </div>
                \`,
                google_search: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="font-size: 20px; margin-bottom: 4px;">🔍</div>
                    <div style="width: 80%; height: 12px; background: #e2e8f0; border-radius: 2px; margin-bottom: 4px;"></div>
                    <div style="width: 60%; height: 8px; background: #3b82f6; border-radius: 2px;"></div>
                  </div>
                \`,
                naver_search: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="font-size: 20px; margin-bottom: 4px;">🔍</div>
                    <div style="width: 80%; height: 12px; background: #e2e8f0; border-radius: 2px; margin-bottom: 4px;"></div>
                    <div style="width: 60%; height: 8px; background: #10b981; border-radius: 2px;"></div>
                  </div>
                \`,
                law_search: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="font-size: 20px; margin-bottom: 4px;">⚖️</div>
                    <div style="width: 80%; height: 12px; background: #e2e8f0; border-radius: 2px; margin-bottom: 4px;"></div>
                    <div style="width: 60%; height: 8px; background: #8b5cf6; border-radius: 2px;"></div>
                  </div>
                \`,
                mail_services: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 12px; margin-bottom: 2px;">📧</div>
                      <div style="font-size: 8px; color: #666;">Gmail</div>
                    </div>
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 12px; margin-bottom: 2px;">📮</div>
                      <div style="font-size: 8px; color: #666;">Daum</div>
                    </div>
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 12px; margin-bottom: 2px;">📬</div>
                      <div style="font-size: 8px; color: #666;">Naver</div>
                    </div>
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 12px; margin-bottom: 2px;">📭</div>
                      <div style="font-size: 8px; color: #666;">Outlook</div>
                    </div>
                  </div>
                \`,
                default: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #64748b;">
                    <div style="text-align: center;">
                      <div style="font-size: 24px; margin-bottom: 4px;">📦</div>
                      <div style="font-size: 10px;">위젯</div>
                    </div>
                  </div>
                \`
              };
              return previews[widgetType] || previews.default;
            }
            
            function renderCategories() {
              const categoryList = document.getElementById('categoryList');
              categoryList.innerHTML = Object.entries(widgetCategories).map(([categoryKey, category]) => \`
                <button 
                  style="width: 100%; padding: 12px 16px; border: none; background: white; text-align: left; cursor: pointer; transition: all 0.2s; border-bottom: 1px solid #f1f5f9;" 
                  onmouseover="this.style.background='#f8fafc'" 
                  onmouseout="this.style.background='white'"
                  data-category="\${categoryKey}"
                  onclick="selectCategory('\${categoryKey}')"
                >
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 18px;">\${getCategoryIcon(categoryKey)}</div>
                    <div>
                      <div style="font-weight: 500; font-size: 14px; color: #1e293b;">\${category.name}</div>
                      <div style="font-size: 12px; color: #64748b;">\${category.widgets.length}개 위젯</div>
                    </div>
                  </div>
                </button>
              \`).join('');
            }
            
            function selectCategory(categoryKey) {
              selectedCategory = categoryKey;
              const category = widgetCategories[categoryKey];
              
              // 카테고리 버튼 스타일 업데이트
              document.querySelectorAll('[data-category]').forEach(btn => {
                btn.style.background = 'white';
                btn.style.borderRight = 'none';
                btn.style.color = '#1e293b';
              });
              
              const selectedBtn = document.querySelector(\`[data-category="\${categoryKey}"]\`);
              selectedBtn.style.background = '#dbeafe';
              selectedBtn.style.borderRight = '3px solid #3b82f6';
              selectedBtn.style.color = '#1e40af';
              
              // 제목 업데이트
              document.getElementById('categoryTitle').textContent = category.name;
              document.getElementById('categoryDesc').textContent = '\${category.widgets.length}개의 위젯이 있습니다';
              
              // 위젯 그리드 업데이트
              const grid = document.getElementById('widgetGrid');
              grid.innerHTML = category.widgets.map(widget => \`
                <div style="background: white; border-radius: 12px; padding: 16px; border: 2px solid #e2e8f0; transition: all 0.3s; cursor: pointer;" onmouseover="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 8px 25px rgba(59, 130, 246, 0.15)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'; this.style.transform='none'" onclick="addWidget('\${widget.type}')">
                  <div style="width: 100%; height: 120px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; position: relative; overflow: hidden;">
                    \${renderWidgetPreview(widget.type)}
                  </div>
                  <div style="text-align: center;">
                    <div style="font-weight: 600; font-size: 16px; color: #1e293b; margin-bottom: 4px;">\${widget.name}</div>
                    <div style="font-size: 14px; color: #64748b; margin-bottom: 12px; line-height: 1.4;">\${widget.description}</div>
                    <button style="width: 100%; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                      추가하기
                    </button>
                  </div>
                </div>
              \`).join('');
            }
            
            function addWidget(widgetType) {
              window.opener.postMessage({
                type: 'ADD_WIDGET',
                widgetType: widgetType
              }, '*');
              window.close();
            }
            
            // 페이지 로드 시 카테고리 렌더링
            renderCategories();
          </script>
        </body>
        </html>
      `);
      widgetShopWindow.document.close();
    }
  };

  // 마우스 이벤트 리스너 등록
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggedWidget) {
        e.preventDefault();
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        const rawX = e.clientX - canvasRect.left - dragOffset.x;
        const rawY = e.clientY - canvasRect.top - dragOffset.y;

        // 그리드 스냅핑 - snapX/snapY 사용
        const newX = snapX(rawX);
        const newY = snapY(rawY);

        // 드래그 중인 위젯 위치 업데이트
        setWidgets(prevWidgets => 
          prevWidgets.map(w => 
            w.id === draggedWidget ? { ...w, x: newX, y: newY } : w
          )
        );
      }
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    if (draggedWidget) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggedWidget, dragOffset, COL_TRACK, cellHeight]);

  // 위젯을 그리드 형식으로 변환 (좌표는 그리드 단위로 일관 유지)
  const convertToGridWidget = (widget: Widget) => {
    // 레거시 데이터 정규화: gridSize/size 부재 또는 픽셀 기반 좌표를 그리드 단위로 보정
    try {
      // gridSize 없고 width/height가 숫자일 경우 그리드 크기 추정
      if (!widget.gridSize && typeof (widget as any).width === 'number' && typeof (widget as any).height === 'number') {
        const gw = Math.max(1, toGridW((widget as any).width));
        const gh = Math.max(1, toGridH((widget as any).height));
        widget = { ...widget, gridSize: { w: gw, h: gh }, size: `${gw}x${gh}` } as any;
      }

      // x,y가 픽셀 기반(너무 큰 값)이면 그리드 좌표로 변환
      if (typeof (widget as any).x === 'number' && typeof (widget as any).y === 'number') {
        const xVal = (widget as any).x as number;
        const yVal = (widget as any).y as number;
        // 가정: 합리적 그리드 범위를 넘어서는 픽셀값이면 변환
        if (xVal > 100 || yVal > 100) {
          const gx = Math.max(0, toGridX(xVal));
          const gy = Math.max(0, toGridY(yVal));
          widget = { ...widget, x: gx, y: gy } as any;
        }
      }
    } catch (e) {
      console.warn('[normalizeLegacyWidget] 정규화 중 오류:', e);
    }

    // 기존 gridSize가 있으면 우선 사용
    let gridSize = widget.gridSize || { w: 1, h: 1 };
    
    // gridSize가 없는 경우에만 타입에 따라 자동 설정
    if (!widget.gridSize) {
      if (widget.type === 'google_search' || widget.type === 'naver_search' || widget.type === 'unified_search') {
        gridSize = { w: 2, h: 1 }; // 검색 위젯은 2x1 기본
      } else if (widget.type === 'bookmark') {
        gridSize = { w: 1, h: 2 }; // 북마크는 기본 1x2 (1x2, 1x3, 1x4 가능)
      } else if (widget.type === 'calendar') {
        gridSize = { w: 1, h: 1 }; // 캘린더 기본 1x1 (1x1, 1x2 허용)
      } else if (widget.type === 'crypto') {
        gridSize = { w: 1, h: 2 }; // 크립토 위젯은 1x2 기본
      } else if (widget.type === 'frequent_sites') {
        gridSize = { w: 1, h: 1 }; // 자주가는사이트 위젯은 1x1 고정
      } else if (widget.type === 'todo') {
        gridSize = { w: 2, h: 2 }; // To Do 위젯은 2x2 (2칸 너비만)
      } else if (widget.type === 'weather') {
        // 날씨 위젯은 다양한 크기 지원, 기본값은 1x3
        // size 문자열이 있으면 파싱해서 사용
        if (widget.size && typeof widget.size === 'string') {
          const [w, h] = widget.size.split('x').map(Number);
          gridSize = { w: w || 1, h: h || 3 };
        } else {
          gridSize = { w: 1, h: 3 }; // 기본값
        }
      } else if (widget.type === 'english_words') {
        gridSize = { w: 1, h: 1 }; // 영어단어 위젯 기본 1x1 (1x1, 1x2 허용)
      } else if (widget.type === 'dday') {
        gridSize = { w: 1, h: 1 }; // D-Day 위젯 기본 1x1 (1x1, 1x2 허용)
      } else if (widget.type === 'quote') {
        gridSize = { w: 1, h: 1 }; // 영감명언 위젯 기본 1x1 (1x1, 2x1 허용)
      } else if (widget.type === 'economic_calendar') {
        gridSize = { w: 2, h: 2 }; // 경제캘린더 위젯은 2x2
      } else if (widget.type === 'exchange') {
        gridSize = { w: 1, h: 2 }; // 환율 위젯은 1x2 (1칸 너비만)
      } else if (widget.type === 'quicknote') {
        gridSize = { w: 1, h: 1 }; // 빠른메모는 기본 1x1
      } else if (widget.type === 'table') {
        gridSize = { w: 2, h: 2 }; // 표 위젯은 기본 2x2
      } else if (widget.type === 'law_search') {
        gridSize = { w: 1, h: 1 }; // 법제처 검색 위젯은 기본 1x1 (1x1, 2x1 가능)
      } else if (widget.type === 'news') {
        gridSize = { w: 2, h: 2 }; // 뉴스피드 위젯은 기본 2x2 (2x1, 2x2, 2x3 가능)
      } else if (widget.type === 'image') {
        gridSize = { w: 2, h: 2 }; // 이미지 위젯 기본 2x2 (2x2, 3x3만 허용)
      } else {
        gridSize = { w: 1, h: 1 }; // 기본적으로 1x1
      }
    }
    
    return {
      ...widget,
      size: gridSize,
      // 이미 그리드 좌표라고 가정하고 사용
      x: widget.x ?? 0,
      y: widget.y ?? 0
    };
  };

  // 위젯 렌더링
  const renderWidget = (widget: any) => {
    // GridWidget에서 원본 Widget 찾기
    const originalWidget = widgets.find(w => w.id === widget.id);
    if (!originalWidget) {
      console.warn('위젯을 찾을 수 없습니다:', widget.id);
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400 text-sm">위젯 데이터를 찾을 수 없습니다</p>
        </div>
      );
    }
    
    const WidgetIcon = allWidgets.find(w => w.type === originalWidget.type)?.icon || Grid;
    const isSelected = selectedWidget === originalWidget.id;
    const isDragging = draggedWidget === originalWidget.id;

    const isHighlighted = highlightedWidgetId === originalWidget.id;
    const isNewlyAdded = recentlyAddedWidgetId === originalWidget.id;

    return (
      <div
        className={`relative h-full overflow-hidden uw-card flex flex-col transition-shadow transition-transform duration-200 ${
          isDragging ? 'opacity-75' : ''
        } ${
          dragOverWidget === originalWidget.id && draggedWidget !== originalWidget.id ? 'ring-2 ring-green-500 bg-green-50' : ''
        } ${
          isHighlighted
            ? 'ring-4 ring-indigo-300/80 shadow-indigo-500/40 animate-[pulse_1.4s_ease-in-out_infinite]'
            : isSelected
            ? 'ring-2 ring-blue-500 shadow-lg'
            : ''
        } ${isNewlyAdded ? 'animate-widget-enter' : ''}`}
        style={{
          zIndex: isHighlighted ? 12 : isDragging ? 10 : isSelected ? 5 : 1
        }}
        onClick={() => selectWidget(originalWidget.id)}
        onMouseEnter={() => {
          if (isReordering && draggedWidget && draggedWidget !== originalWidget.id) {
            setDragOverWidget(originalWidget.id);
          }
        }}
        onMouseLeave={() => {
          if (isReordering) {
            setDragOverWidget(null);
          }
        }}
        onMouseUp={() => {
          if (isReordering && draggedWidget && dragOverWidget === originalWidget.id) {
            reorderWidgets(draggedWidget, originalWidget.id);
          }
        }}
      >
        {isHighlighted && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-4 ring-indigo-300/60 shadow-[0_0_30px_rgba(99,102,241,0.35)] animate-[pulse_1.4s_ease-in-out_infinite]" aria-hidden="true" />
        )}
        {isHighlighted && showFirstWidgetTooltip && (
          <div className="absolute -top-20 left-1/2 z-30 w-64 -translate-x-1/2 rounded-2xl bg-indigo-600 px-4 py-3 text-white shadow-2xl shadow-indigo-500/50">
            <p className="text-sm font-semibold">첫 위젯이 추가되었어요!</p>
            <p className="text-xs text-indigo-100 mt-1 leading-relaxed">상단의 저장 버튼으로 페이지를 완성해보세요.</p>
          </div>
        )}
        <div className="relative z-10 flex flex-col h-full">
          {/* 위젯 헤더 - 고정 - 타이틀 영역만 드래그 가능 */}
          <div 
            data-drag-handle="true"
            data-widget-id={originalWidget.id}
            className="px-2 py-1 border-b border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex items-center justify-between cursor-move group flex-shrink-0"
          >
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {originalWidget.title || allWidgets.find(w => w.type === originalWidget.type)?.name || '위젯'}
              </span>
            </div>
            
            {isEditMode && (
              <div className="flex items-center gap-1 opacity-100 transition-opacity">
                {/* 사이즈 선택기 - 특정 위젯들은 제한된 크기만 허용 */}
                <SizePicker
                  value={originalWidget.gridSize || { w: 1, h: 1 }}
                  onChange={(newSize) => {
                    updateWidget(originalWidget.id, { ...originalWidget, gridSize: newSize });
                  }}
                  widgetType={originalWidget.type}
                />
                {originalWidget.type === 'bookmark' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameWidget(originalWidget.id);
                    }}
                    title="이름 수정"
                  >
                    <Edit className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-rose-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWidget(originalWidget.id);
                  }}
                  title="위젯 삭제"
                >
                  <X className="w-3 h-3 text-red-600" />
                </Button>
              </div>
            )}
          </div>

          {/* 위젯 콘텐츠 - 스크롤 가능 */}
          <div 
            className={`flex-1 bg-transparent ${originalWidget.type === 'quicknote' ? 'overflow-visible' : 'overflow-y-auto'}`}
            onMouseDown={(e) => {
              // 위젯 본문에서는 드래그 완전 방지
              e.stopPropagation();
            }}
            onDragStart={(e) => {
              // 위젯 내용 영역에서 드래그 시작 방지
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="p-3">
              {renderWidgetContent(originalWidget)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 위젯 콘텐츠 렌더링 - 최적화: 공통 위젯들은 WidgetContentRenderer로 위임
  const renderWidgetContent = (widget: Widget) => {
    // WidgetContentRenderer로 렌더링 가능한 위젯들
    const commonWidgets = [
      'bookmark', 'weather', 'todo', 'crypto', 'stock_alert', 'economic_calendar',
      'english_words', 'exchange', 'news', 'google_search', 'naver_search',
      'law_search', 'unified_search', 'qr_code', 'frequent_sites', 'google_ad',
      'quote', 'contact', 'quicknote', 'table', 'image'
    ];
    
    if (commonWidgets.includes(widget.type)) {
      return (
        <WidgetContentRenderer
          widget={widget}
          isEditMode={isEditMode}
          updateWidget={updateWidget}
          widgets={widgets}
          setWidgets={setWidgets}
          onMoveBookmarkToWidget={handleMoveBookmarkToWidget}
        />
      );
    }
    
    // 기존 코드는 유지하되 점진적으로 이동 예정
    try {
      switch (widget.type) {
      
      case 'expense':
        // 가계부 위젯은 더 이상 지원하지 않습니다. 안전하게 숨김 처리
        return (
          <div className="h-full flex items-center justify-center text-xs text-gray-500 bg-gray-50">
            가계부 위젯은 지원 중단되었습니다
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <ContactIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold text-gray-800">문의하기</h4>
              <p className="text-xs text-gray-600">사이트 개설자에게 문의</p>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="이름"
                id={`contact-name-${widget.id}`}
                className="w-full p-2 text-xs border rounded"
              />
              <input
                type="email"
                placeholder="이메일"
                id={`contact-email-${widget.id}`}
                className="w-full p-2 text-xs border rounded"
              />
              <input
                type="tel"
                placeholder="연락처 (예: 010-1234-5678)"
                id={`contact-phone-${widget.id}`}
                className="w-full p-2 text-xs border rounded"
              />
              <textarea
                placeholder="문의 내용"
                id={`contact-message-${widget.id}`}
                className="w-full p-2 text-xs border rounded h-16 resize-none"
              />
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={async () => {
                  const nameInput = document.getElementById(`contact-name-${widget.id}`) as HTMLInputElement;
                  const emailInput = document.getElementById(`contact-email-${widget.id}`) as HTMLInputElement;
                  const phoneInput = document.getElementById(`contact-phone-${widget.id}`) as HTMLInputElement;
                  const messageInput = document.getElementById(`contact-message-${widget.id}`) as HTMLTextAreaElement;
                  
                  const name = nameInput?.value || '';
                  const email = emailInput?.value || '';
                  const phone = phoneInput?.value || '';
                  const message = messageInput?.value || '';
                  
                  if (!name || !email || !message) {
                    alert('이름, 이메일, 문의 내용은 필수입니다.');
                    return;
                  }
                  
                  try {
                    // Web3Forms로 이메일 전송 (가장 간단한 방법!)
                    // 설정: https://web3forms.com 에서 무료 API 키 받기 (1분 소요)
                    
                    const response = await fetch('https://api.web3forms.com/submit', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        access_key: 'YOUR_WEB3FORMS_ACCESS_KEY', // web3forms.com에서 받은 키 입력
                        subject: `[문의] ${name}님의 문의`,
                        from_name: name,
                        email: email, // 보낸 사람 이메일
                        phone: phone,
                        message: message,
                        to_email: currentUser?.email || 'your-email@example.com', // 받는 사람 (사이트 개설자)
                      }),
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                      console.log('이메일 전송 성공:', data);
                      alert('문의가 성공적으로 전송되었습니다! ✅');
                      
                      // 폼 초기화
                      if (nameInput) nameInput.value = '';
                      if (emailInput) emailInput.value = '';
                      if (phoneInput) phoneInput.value = '';
                      if (messageInput) messageInput.value = '';
                    } else {
                      throw new Error(data.message || '전송 실패');
                    }
                    
                  } catch (error) {
                    console.error('이메일 전송 실패:', error);
                    alert('문의 전송에 실패했습니다. 다시 시도해주세요. ❌');
                  }
                }}
              >
                전송
              </Button>
            </div>
          </div>
        );

      case 'news':
        return (
          <div className="space-y-2">
            {(widget.content?.news || [
              { id: '1', title: '최신 기술 뉴스', source: '테크크런치', time: '2시간 전' },
              { id: '2', title: '경제 동향', source: '연합뉴스', time: '4시간 전' },
              { id: '3', title: '날씨 정보', source: '기상청', time: '6시간 전' }
            ]).map((news: any) => (
              <div key={news.id} className="p-2 bg-gray-50 rounded text-xs">
                <div className="font-medium text-gray-800 truncate">{news.title}</div>
                <div className="text-gray-500 text-xs mt-1">{news.source} • {news.time}</div>
              </div>
            ))}
          </div>
        );

      case 'calendar':
        return (
          <div className="p-2 h-full flex flex-col">
            {(() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = today.getMonth();
              const first = new Date(year, month, 1);
              const last = new Date(year, month + 1, 0);
              const start = first.getDay();
              const days: (number|null)[] = [];
              for (let i=0;i<start;i++) days.push(null);
              for (let d=1; d<=last.getDate(); d++) days.push(d);
              while (days.length % 7 !== 0) days.push(null);
              return (
                <>
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-200 dark:border-gray-600">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {year}년 {month + 1}월
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      오늘 {today.getDate()}일
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                    {['일','월','화','수','목','금','토'].map((d,i) => (
                      <div key={d} className={`text-center font-semibold ${i===0?'text-red-600 dark:text-red-400':i===6?'text-blue-600 dark:text-blue-400':''}`}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-xs flex-1">
                    {days.map((d, idx) => {
                      const isToday = d===today.getDate();
                      const col = idx % 7;
                      return (
                        <div key={idx} className={`h-8 border rounded flex items-center justify-center ${d? 'bg-white dark:bg-gray-800':'bg-gray-50 dark:bg-gray-700'} ${isToday? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 font-semibold':''} ${!isToday&&d&&col===0?'text-red-600 dark:text-red-400':''} ${!isToday&&d&&col===6?'text-blue-600 dark:text-blue-400':''} ${d?'text-gray-900 dark:text-gray-100':''}`}>
                          {d ?? ''}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        );

      case 'mail_services':
        const mailServices = [
          { name: 'Gmail', url: 'https://mail.google.com', icon: '📧', color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700' },
          { name: 'Daum', url: 'https://mail.daum.net', icon: '📮', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700' },
          { name: 'Naver', url: 'https://mail.naver.com', icon: '📬', color: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700' },
          { name: 'Outlook', url: 'https://outlook.live.com', icon: '📭', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700' },
          { name: 'Yahoo', url: 'https://mail.yahoo.com', icon: '📨', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700' },
          { name: 'Apple Mail', url: 'https://www.icloud.com/mail', icon: '🍎', color: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700' },
          { name: 'ProtonMail', url: 'https://mail.proton.me', icon: '🔒', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700' },
          { name: 'Zoho', url: 'https://mail.zoho.com', icon: '📧', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700' }
        ];

        return (
          <div className="h-full flex flex-col">
            <div className="p-3">
              <div className="text-center mb-3">
                <div className="text-2xl mb-1">📧</div>
                <h4 className="font-semibold text-sm text-gray-800">메일 서비스</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {mailServices.map((service, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    className={`h-12 text-xs ${service.color} flex flex-col items-center justify-center p-2`}
                    onClick={() => window.open(service.url, '_blank')}
                  >
                    <div className="text-lg mb-1">{service.icon}</div>
                    <div className="text-xs font-medium">{service.name}</div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );




      case 'quicknote':
        const currentGridSize = widget.gridSize || { w: 1, h: 1 };
        // 위젯 크기에 따라 rows 설정
        const getRows = () => {
          if (currentGridSize.h === 1) return 4; // 1x1: 4줄
          if (currentGridSize.h === 2) return 10; // 1x2: 10줄
          if (currentGridSize.h === 3) return 16; // 1x3: 16줄
          return 4;
        };
        
        return (
          <div className="h-full flex flex-col p-1">
            <textarea
              value={widget.content?.text || ''}
              onChange={(e) => {
                const updatedWidgets = widgets.map(w => 
                  w.id === widget.id 
                    ? { ...w, content: { ...(w.content || {}), text: e.target.value } }
                    : w
                );
                setWidgets(updatedWidgets);
                
                // 텍스트 길이에 따라 자동으로 크기 조정
                const textLength = e.target.value.length;
                const lineCount = e.target.value.split('\n').length;
                const currentGridSize = widget.gridSize || { w: 1, h: 1 };
                
                // 텍스트가 100자 이상이거나 5줄 이상이면 1x2로 확장
                if ((textLength > 100 || lineCount > 5) && currentGridSize.h < 2) {
                  updateWidget(widget.id, { ...widget, gridSize: { w: 1, h: 2 } });
                }
                // 텍스트가 짧으면 1x1로 축소
                else if (textLength < 50 && lineCount <= 3 && currentGridSize.h > 1) {
                  updateWidget(widget.id, { ...widget, gridSize: { w: 1, h: 1 } });
                }
              }}
              placeholder="메모를 작성하세요..."
              className="flex-1 w-full p-1 text-sm border-0 resize-none focus:outline-none bg-transparent"
              style={{ textAlign: 'left', verticalAlign: 'top' }}
              rows={getRows()}
            />
          </div>
        );


      case 'shopping':
        return (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {widget.content.sites?.map((site: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 text-xl">
                    {site.icon}
                  </div>
                  <div className="text-xs text-gray-700 truncate">{site.name}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'travel':
        return (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {widget.content.sites?.map((site: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2 text-xl">
                    {site.icon}
                  </div>
                  <div className="text-xs text-gray-700 truncate">{site.name}</div>
                </div>
              ))}
            </div>
          </div>
        );


      case 'download_section':
        return (
          <div className="p-4">
            <div className="space-y-3">
              <button className="w-full p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                📄 이력서 다운로드
              </button>
              <button className="w-full p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                📁 포트폴리오 다운로드
              </button>
            </div>
          </div>
        );

      case 'business_header':
        return (
          <div className="p-6 text-center bg-gradient-to-r from-orange-50 to-red-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{widget.content.name}</h2>
            <p className="text-sm text-gray-600">{widget.content.description}</p>
          </div>
        );

      case 'menu_section':
        return (
          <div className="p-4">
            <div className="space-y-4">
              {widget.content.items?.map((item: any, index: number) => (
                <div key={index} className="border-b border-gray-200 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <span className="text-lg font-bold text-orange-600">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'business_info':
        return (
          <div className="p-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">영업시간</h4>
                <p className="text-xs text-gray-600 whitespace-pre-line">{widget.content.hours}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">전화번호</h4>
                <p className="text-xs text-gray-600">{widget.content.phone}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">주소</h4>
                <p className="text-xs text-gray-600">{widget.content.address}</p>
              </div>
            </div>
          </div>
        );

      case 'map_section':
        return (
          <div className="p-4">
            <button 
              className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={() => window.open(widget.content.mapUrl, '_blank')}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🗺️</div>
                <p className="text-xs text-gray-600">지도 보기</p>
              </div>
            </button>
          </div>
        );

      case 'event_header':
        return (
          <div className="p-6 text-center bg-gradient-to-r from-pink-50 to-purple-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{widget.content.title}</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p>📅 {widget.content.date}</p>
              <p>⏰ {widget.content.time}</p>
              <p>📍 {widget.content.location}</p>
            </div>
            <p className="text-sm text-gray-600 mt-4">{widget.content.description}</p>
          </div>
        );

      case 'countdown':
        return (
          <div className="p-2 text-center">
            <div className="bg-red-100 rounded-lg p-3">
              <div className="text-xl font-bold text-red-600 mb-1">D-7</div>
              <p className="text-[11px] text-red-600">{widget.content.message}</p>
            </div>
          </div>
        );

      case 'rsvp_form':
        return (
          <div className="p-4">
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="이름" 
                className="w-full p-2 border rounded text-sm"
              />
              <input 
                type="number" 
                placeholder="인원" 
                className="w-full p-2 border rounded text-sm"
              />
              <textarea 
                placeholder="메시지" 
                className="w-full p-2 border rounded text-sm h-16 resize-none"
              />
              <button className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                참석 확인
              </button>
            </div>
          </div>
        );

      case 'event_gallery':
        return (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">📷</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'blog_header':
        return (
          <div className="p-6 text-center bg-gradient-to-r from-green-50 to-blue-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{widget.content.title}</h2>
            <p className="text-sm text-gray-600">{widget.content.description}</p>
          </div>
        );

      case 'post_list':
        return (
          <div className="p-4">
            <div className="space-y-4">
              {widget.content.posts?.map((post: any) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-800 mb-2">{post.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{post.date}</span>
                    <div className="flex gap-1">
                      {post.tags?.map((tag: string, index: number) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'blog_sidebar':
        return (
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">카테고리</h4>
                <div className="space-y-1">
                  {widget.content.categories?.map((category: string, index: number) => (
                    <div key={index} className="text-xs text-gray-600 hover:text-blue-600 cursor-pointer">
                      {category}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'shop_header':
        return (
          <div className="p-6 text-center bg-gradient-to-r from-yellow-50 to-orange-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{widget.content.brandName}</h2>
            <p className="text-sm text-gray-600">{widget.content.description}</p>
          </div>
        );

      case 'product_grid':
        return (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {widget.content.products?.map((product: any) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center">
                    <span className="text-gray-400">📦</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">{product.name}</h4>
                  <p className="text-lg font-bold text-orange-600 mb-2">{product.price}</p>
                  <div className="flex gap-1">
                    {product.options?.slice(0, 2).map((option: string, index: number) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact_order':
        return (
          <div className="p-4">
            <div className="space-y-2">
              <button className="w-full p-2 bg-yellow-400 text-black rounded text-xs hover:bg-yellow-500 transition-colors">
                💬 카톡 문의
              </button>
              <button className="w-full p-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                📧 이메일
              </button>
              <button className="w-full p-2 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors">
                📞 전화 주문
              </button>
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="p-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 mb-1">⭐ {widget.content.averageRating}</div>
              <p className="text-xs text-gray-600 mb-3">리뷰 {widget.content.reviewCount}개</p>
              <div className="space-y-2">
                {widget.content.recentReviews?.map((review: string, index: number) => (
                  <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    "{review}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'team_header':
        return (
          <div className="p-6 text-center bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{widget.content.teamName}</h2>
            <p className="text-sm text-gray-600">{widget.content.description}</p>
          </div>
        );

      case 'member_grid':
        return (
          <div className="p-4">
            <div className="space-y-4">
              {widget.content.members?.map((member: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{member.name}</h4>
                    <p className="text-xs text-blue-600">{member.role}</p>
                    <p className="text-xs text-gray-600">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'activity_calendar':
        return (
          <div className="p-4">
            <div className="space-y-2">
              {widget.content.events?.map((event: any, index: number) => (
                <div key={index} className="p-2 bg-blue-50 rounded text-xs">
                  <div className="font-semibold text-blue-800">{event.date}</div>
                  <div className="text-blue-600">{event.title}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'join_form':
        return (
          <div className="p-4">
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="이름" 
                className="w-full p-2 border rounded text-xs"
              />
              <input 
                type="text" 
                placeholder="연락처" 
                className="w-full p-2 border rounded text-xs"
              />
              <input 
                type="text" 
                placeholder="관심분야" 
                className="w-full p-2 border rounded text-xs"
              />
              <button className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs">
                가입 신청
              </button>
            </div>
          </div>
        );

      case 'exchange':
        const [exchangeRates, setExchangeRates] = useState({
          'USD/KRW': 1320.50,
          'EUR/KRW': 1450.30,
          'JPY/KRW': 8.95,
          'GBP/KRW': 1650.20,
          'CNY/KRW': 185.40
        });

        // 환율 데이터 시뮬레이션 (5분마다 업데이트)
        useEffect(() => {
          const interval = setInterval(() => {
            setExchangeRates(prev => ({
              'USD/KRW': prev['USD/KRW'] + (Math.random() - 0.5) * 10,
              'EUR/KRW': prev['EUR/KRW'] + (Math.random() - 0.5) * 15,
              'JPY/KRW': prev['JPY/KRW'] + (Math.random() - 0.5) * 0.5,
              'GBP/KRW': prev['GBP/KRW'] + (Math.random() - 0.5) * 20,
              'CNY/KRW': prev['CNY/KRW'] + (Math.random() - 0.5) * 5
            }));
          }, 300000); // 5분

          return () => clearInterval(interval);
        }, []);

        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">💱</div>
              <h4 className="font-semibold text-sm text-gray-800">실시간 환율</h4>
              <p className="text-xs text-gray-500">5분마다 업데이트</p>
            </div>
            <div className="space-y-2">
              {Object.entries(exchangeRates).map(([pair, rate]) => (
                <div key={pair} className="bg-gray-50 p-2 rounded text-xs hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{pair}</div>
                    <div className="text-gray-600 font-mono">{(rate as number).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            {isEditMode && (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full h-8 text-xs"
                onClick={() => {
                  const currency = prompt('추가할 통화를 입력하세요 (예: AUD, CAD):');
                  if (currency) {
                    const baseRate = Math.random() * 1000 + 500;
                    setExchangeRates(prev => ({
                      ...prev,
                      [`${currency}/KRW`]: baseRate
                    }));
                  }
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                통화 추가
              </Button>
            )}
          </div>
        );

      case 'unified_search':
        return <UnifiedSearchWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'google_search':
        return <GoogleSearchWidget {...({ widget, isEditMode, updateWidget } as any)} />;

      case 'naver_search':
        return <NaverSearchWidget {...({ widget, isEditMode, updateWidget } as any)} />;


      case 'github_repo':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">📂</div>
              <h4 className="font-semibold text-sm text-gray-800">GitHub Repo</h4>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">react-dashboard</div>
                <div className="text-gray-600">⭐ 1,234 | 🍴 567</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">my-portfolio</div>
                <div className="text-gray-600">⭐ 89 | 🍴 23</div>
              </div>
            </div>
            {isEditMode && (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full h-8 text-xs"
                onClick={() => {
                  const repo = prompt('GitHub 저장소 URL을 입력하세요:');
                  if (repo) {
                    updateWidget(widget.id, { 
                      content: { ...widget.content, repositories: [...(widget.content?.repositories || []), repo] }
                    });
                  }
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                저장소 추가
              </Button>
            )}
          </div>
        );

      case 'google_ad':
        return <GoogleAdWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'frequent_sites':
        return <FrequentSitesWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'english_words':
        return <EnglishWordsWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'quote':
        return <QuoteWidget {...({ widget, isEditMode, updateWidget } as any)} />;

      case 'qr_code':
        return <QRCodeWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'timer':
        return <WidgetContentRenderer widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} widgets={widgets} setWidgets={setWidgets} />;

      case 'dday':
        return <WidgetContentRenderer widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} widgets={widgets} setWidgets={setWidgets} />;

      default:
        return (
          <div className="text-center text-gray-500">
            <div className="text-lg mb-2">{widget.title}</div>
            <div className="text-xs">위젯 내용</div>
          </div>
        );
    }
    } catch (error) {
      console.error('위젯 렌더링 오류:', error, '위젯:', widget);
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400 text-sm">위젯 렌더링 오류</p>
          <p className="text-red-500 dark:text-red-500 text-xs mt-1">{widget.type}</p>
        </div>
      );
    }
  };

  // 배경 스타일 생성 함수
  const getBackgroundStyle = () => {
    switch (backgroundSettings.type) {
      case 'solid':
        return {
          backgroundColor: backgroundSettings.color,
          opacity: backgroundSettings.opacity
        };
      case 'image':
        return {
          backgroundImage: `url(${backgroundSettings.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: backgroundSettings.opacity
        };
      default:
        // gradient 등 이전 타입이 남아있을 경우 단색으로 대체
        return {
          backgroundColor: backgroundSettings.color || '#f8fafc',
          opacity: backgroundSettings.opacity
        };
    }
  };

  // 기존 그리드 뷰만 사용
  return (
    <div 
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
      style={{
        ...(backgroundSettings.type !== 'solid' && backgroundSettings.type !== 'gradient' && backgroundSettings.type !== 'image' ? {} : getBackgroundStyle()),
        ...(isStealthMode ? {
          backgroundColor: 'var(--stealth-bg)',
        } : {}),
      }}
      data-stealth-mode={isStealthMode ? 'true' : undefined}
    >
      {/* 상단 툴바 - Stealth 모드 스타일 적용 */}
      <div 
        className={`sticky top-0 z-[60] backdrop-blur-md border-b shadow-sm transition-all ${
          isStealthMode 
            ? 'bg-white/95 border-gray-200/30' 
            : 'bg-white/80 border-gray-200/50'
        }`}
        style={isStealthMode ? {
          backgroundColor: 'var(--stealth-surface)',
          borderColor: 'var(--stealth-border)',
          boxShadow: 'var(--stealth-shadow)',
        } : {}}
      >
        <div className="w-full px-2 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* URWEBS 버튼 - Stealth 모드에서는 "urwebs workspace" */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className={`font-medium transition-opacity ${
                  isStealthMode 
                    ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 opacity-80 hover:opacity-100' 
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold'
                }`}
              >
                urwebs workspace
              </Button>
              
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="text-xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-500 px-1 py-1 focus:outline-none min-w-[200px] max-w-[400px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setPageTitle(tempTitle);
                          setIsEditingTitle(false);
                          setIsTitleManuallyEdited(true);
                          localStorage.setItem('isTitleManuallyEdited', 'true');
                          // 현재 페이지의 제목도 업데이트
                          setPages(prevPages => {
                            const updatedPages = reindexPages(prevPages.map(page => 
                              page.id === currentPageId ? { ...page, title: tempTitle } : page
                            ));
                            persistPagesToStorage(updatedPages);
                            return updatedPages;
                          });
                        } else if (e.key === 'Escape') {
                          setTempTitle(pageTitle);
                          setIsEditingTitle(false);
                        }
                      }}
                      onBlur={() => {
                        setPageTitle(tempTitle);
                        setIsEditingTitle(false);
                        setIsTitleManuallyEdited(true);
                        localStorage.setItem('isTitleManuallyEdited', 'true');
                        // 현재 페이지의 제목도 업데이트
                        setPages(prevPages => {
                          const updatedPages = reindexPages(prevPages.map(page => 
                            page.id === currentPageId ? { ...page, title: tempTitle } : page
                          ));
                          persistPagesToStorage(updatedPages);
                          return updatedPages;
                        });
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    {/* 페이지 타이틀 */}
                    <div className="flex items-center gap-2">
                      <h1 
                        className="text-xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => {
                          setIsEditingTitle(true);
                          setTempTitle(pageTitle);
                        }}
                        title="클릭하여 제목 변경"
                      >
                        {pageTitle}
                      </h1>
                      <Edit className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" 
                            onClick={() => {
                              setIsEditingTitle(true);
                              setTempTitle(pageTitle);
                            }}
                            title="제목 변경" />
                    </div>
                    
                    {/* URL 표시 및 편집 (오른쪽) */}
                    {currentUser && (
                      isEditingUrl ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">urwebs.com/</span>
                          <input
                            type="text"
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setCustomUrl(tempUrl);
                                setIsEditingUrl(false);
                              } else if (e.key === 'Escape') {
                                setIsEditingUrl(false);
                              }
                            }}
                            onBlur={() => {
                              setCustomUrl(tempUrl);
                              setIsEditingUrl(false);
                            }}
                            className="text-xs px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                            placeholder="사용자정의_1"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">urwebs.com/</span>
                          <span className="text-xs text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">
                            {customUrl || `${currentUser.email?.split('@')[0] || 'user'}_${pages.findIndex(p => p.id === currentPageId) + 1}`}
                          </span>
                          <Edit 
                            className="w-3 h-3 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" 
                            onClick={() => {
                              setIsEditingUrl(true);
                              setTempUrl(customUrl || `${currentUser.email?.split('@')[0] || 'user'}_${pages.findIndex(p => p.id === currentPageId) + 1}`);
                            }}
                            title="URL 뒷부분 변경" 
                          />
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">

              {/* 배경 설정 버튼 - Stealth 모드에서는 outline */}
              <Button
                variant={isStealthMode ? "outline" : "ghost"}
                size="sm"
                onClick={() => setShowBackgroundModal(true)}
                className={isStealthMode 
                  ? "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 opacity-75 hover:opacity-100 transition-opacity"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                }
                title="배경 설정"
                style={isStealthMode ? {
                  borderColor: 'var(--stealth-button-border)',
                  transition: 'all var(--stealth-transition-duration) var(--stealth-transition-easing)',
                } : {}}
              >
                <Palette className={`w-4 h-4 mr-1 ${isStealthMode ? 'opacity-80' : ''}`} />
                배경
              </Button>

              {/* 위젯 추가 버튼 - Stealth 모드에서는 outline */}
              <Button
                variant={isStealthMode ? "outline" : "default"}
                size="sm"
                onClick={() => setShowWidgetModal(true)}
                className={isStealthMode 
                  ? "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium"
                  : "bg-green-500 hover:bg-green-600 text-white font-semibold"
                }
                title="위젯 추가"
                style={isStealthMode ? {
                  borderColor: 'var(--stealth-button-border)',
                  backgroundColor: 'transparent',
                  transition: 'all var(--stealth-transition-duration) var(--stealth-transition-easing)',
                } : {}}
              >
                <Plus className={`w-4 h-4 mr-1 ${isStealthMode ? 'opacity-80' : ''}`} />
                위젯 추가
              </Button>

              {/* 페이지 관리 및 추가 버튼 - Stealth 모드에서는 outline */}
              <Button
                variant={isStealthMode ? "outline" : "ghost"}
                size="sm"
                onClick={() => {
                  console.log('페이지 관리 버튼 클릭됨, 현재 상태:', showPageManager);
                  setShowPageManager(!showPageManager);
                  console.log('새로운 상태:', !showPageManager);
                }}
                className={isStealthMode
                  ? "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 opacity-75 hover:opacity-100 transition-opacity"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }
                title="페이지 관리"
                style={isStealthMode ? {
                  borderColor: 'var(--stealth-button-border)',
                  transition: 'all var(--stealth-transition-duration) var(--stealth-transition-easing)',
                } : {}}
              >
                <FileText className={`w-4 h-4 mr-1 ${isStealthMode ? 'opacity-80' : ''}`} />
                페이지 ({pages.length})
              </Button>
              <Button
                variant={isStealthMode ? "outline" : "default"}
                size="sm"
                onClick={addAndManageNewPage}
                className={isStealthMode 
                  ? "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium"
                  : "bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                }
                title="페이지 추가"
                style={isStealthMode ? {
                  borderColor: 'var(--stealth-button-border)',
                  backgroundColor: 'transparent',
                  transition: 'all var(--stealth-transition-duration) var(--stealth-transition-easing)',
                } : {}}
              >
                +페이지 추가
              </Button>
            
              {/* 저장하기 버튼 - Stealth 모드에서는 outline */}
              <Button 
                variant={isStealthMode ? "outline" : "default"}
                size="sm"
                onClick={currentUser ? savePage : async () => {
                  try {
                    // 로그인 전에 현재 작업 내용을 게스트로 저장
                    const updatedPages = pages.map(page => {
                      if (page.id === currentPageId) {
                        return {
                          ...page,
                          title: pageTitle,
                          widgets: widgets
                        };
                      }
                      return page;
                    });
                    localStorage.setItem('myPages', JSON.stringify(updatedPages));
                    
                    // 게스트 데이터를 임시 백업
                    const guestData = localStorage.getItem('myPages');
                    
                    // Google 로그인
                    const result = await signInWithPopup(auth, googleProvider);
                    const user = result.user;
                    
                    // 로그인 성공 시 게스트 데이터를 로그인 사용자 데이터로 이전
                    if (guestData && user) {
                      const userKey = `myPages_${user.uid}`;
                      const existingUserData = localStorage.getItem(userKey);
                      
                      // 기존 사용자 데이터가 없으면 게스트 데이터를 이전
                      if (!existingUserData) {
                        localStorage.setItem(userKey, guestData);
                        console.log('게스트 데이터를 로그인 사용자 데이터로 이전 완료');
                      }
                    }
                    
                    alert('로그인되었습니다! 작업하던 내용이 그대로 유지됩니다.');
                  } catch (error: any) {
                    console.error('로그인 오류:', error);
                    // 팝업 차단이나 사용자가 취소한 경우
                    if (error.code === 'auth/popup-closed-by-user' || 
                        error.code === 'auth/cancelled-popup-request' ||
                        error.code === 'auth/popup-blocked') {
                      console.log('로그인 팝업이 닫혔거나 차단되었습니다.');
                      // 팝업 취소는 조용히 처리 (사용자에게 알림하지 않음)
                    } else {
                      console.error('로그인 실패:', error.message);
                      alert('로그인에 실패했습니다. 다시 시도해주세요.');
                    }
                  }
                }}
                className={isStealthMode 
                  ? "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium"
                  : "bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                }
                title={currentUser ? "페이지 저장하기" : "로그인하여 페이지를 저장하고 공유하세요"}
                style={isStealthMode ? {
                  borderColor: 'var(--stealth-button-border)',
                  backgroundColor: 'transparent',
                  transition: 'all var(--stealth-transition-duration) var(--stealth-transition-easing)',
                } : {}}
              >
                {currentUser ? (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    저장하기
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-1" />
                    로그인하여 저장하기
                  </>
                )}
              </Button>

              {/* 공개/비공개 토글 버튼 */}
              <span className={`text-sm font-medium ${isStealthMode ? 'text-gray-600 opacity-80' : 'text-gray-600'}`}>공개 설정:</span>
              <Button 
                variant="outline"
                size="sm"
                onClick={toggleShare}
                className={`transition-all text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 ${
                  isStealthMode ? 'font-medium opacity-75 hover:opacity-100' : 'font-semibold'
                }`}
                style={isStealthMode ? {
                  borderColor: 'var(--stealth-button-border)',
                  transition: 'all var(--stealth-transition-duration) var(--stealth-transition-easing)',
                } : {}}
              >
                {shareSettings.isPublic ? (
                  <>
                    <Unlock className="w-4 h-4 mr-1" />
                    공개
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-1" />
                    비공개
                  </>
                )}
              </Button>
              {shareSettings.isPublic && (
                <span className="text-xs text-green-600 font-medium">
                  (저장 시 메인페이지에 표시됨)
                </span>
              )}

              {/* 빠른 액션 버튼들 - Stealth 모드에서는 opacity 조정 */}
              <Button 
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`h-8 w-8 p-0 hover:bg-gray-100 ${isStealthMode ? 'opacity-70 hover:opacity-100' : ''}`}
                title={theme === 'light' ? '다크모드' : '라이트모드'}
                style={isStealthMode ? {
                  transition: 'opacity var(--stealth-transition-duration) var(--stealth-transition-easing)',
                } : {}}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefault}
                className={`h-8 w-8 p-0 hover:bg-gray-100 text-red-500 hover:text-red-700 ${isStealthMode ? 'opacity-70 hover:opacity-100' : ''}`}
                title="초기화"
                style={isStealthMode ? {
                  transition: 'opacity var(--stealth-transition-duration) var(--stealth-transition-easing)',
                } : {}}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

            </div>
          </div>
        </div>
      </div>

      {/* 페이지 관리 패널 */}
      {showPageManager && (
        <div ref={pageManagerRef} className="fixed top-16 right-4 z-[999999] bg-white border-4 border-red-500 rounded-xl shadow-2xl p-4 min-w-[400px] max-w-[500px]" style={{zIndex: 999999, position: 'fixed'}}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">페이지 관리</h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={createNewPage}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                +페이지 추가
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTrash(!showTrash)}
                className="text-xs h-7"
                title="휴지통"
              >
                휴지통
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPageManager(false)}
                className="text-gray-500 hover:text-gray-700"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showTrash && (
            <div className="mb-3 p-2 border rounded bg-gray-50">
              <div className="text-sm font-medium mb-2">삭제된 페이지 (7일 보관)</div>
              {trashPages.length === 0 ? (
                <div className="text-xs text-gray-500">비어 있음</div>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {trashPages.map(t => (
                    <div key={t.page.id} className="flex items-center justify-between text-xs bg-white border rounded px-2 py-1">
                      <div className="truncate mr-2">
                        <span className="font-medium">{t.page.title}</span>
                        <span className="text-gray-500 ml-2">{new Date(t.deletedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" className="h-6" onClick={() => restoreFromTrash(t.page.id)}>복원</Button>
                        <Button size="sm" variant="outline" className="h-6" onClick={() => purgeTrashItem(t.page.id)}>영구삭제</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={`p-3 rounded-lg border transition-all ${
                  page.id === currentPageId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => switchPage(page.id)}
                  >
                    <div className="font-medium text-gray-800 truncate">
                      {page.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(page.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      위젯 {page.widgets.length}개
                    </div>
                  </div>
                  
                  {/* 순서 변경 및 삭제 버튼 */}
                  <div className="flex items-center gap-1">
                    {pages.length > 1 && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            movePageUp(page.id);
                          }}
                          disabled={index === 0}
                          className="h-6 w-6 p-0 hover:bg-gray-200 disabled:opacity-30"
                          title="위로 이동"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            movePageDown(page.id);
                          }}
                          disabled={index === pages.length - 1}
                          className="h-6 w-6 p-0 hover:bg-gray-200 disabled:opacity-30"
                          title="아래로 이동"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('이 페이지를 삭제하시겠습니까?')) {
                              deletePage(page.id);
                            }
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 소개 모달 - 로그인하지 않은 사용자용 */}
      {showIntroModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
              <h1 className="text-2xl font-bold mb-2">나만의 페이지 만들기</h1>
              <p className="text-blue-100 text-sm">당신만의 멋진 웹사이트를 무료로 시작하세요</p>
            </div>

            {/* 본문 */}
            <div className="p-6">
              {/* 샘플 이미지 */}
              <div className="mb-6">
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
                  {/* 미니 브라우저 프레임 */}
                  <div className="absolute top-4 left-4 flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                  
                  {/* URL 바 */}
                  <div className="mt-6 mb-4 bg-white rounded-lg shadow-sm p-2 flex items-center gap-2">
                    <Globe className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-mono text-blue-600">urwebs.com/@{currentUser?.name || 'yourname'}</span>
                  </div>

                  {/* 페이지 미리보기 */}
                  <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
                    {/* 프로필 섹션 */}
                    <div className="flex items-center gap-3 pb-3 border-b">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl">
                        👤
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-800">당신의 이름</div>
                        <div className="text-xs text-gray-500">@yourname</div>
                      </div>
                    </div>

                    {/* 위젯 그리드 */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
                        <div className="text-xl mb-1">📱</div>
                        <div className="text-xs font-semibold text-gray-700">소셜 링크</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
                        <div className="text-xl mb-1">📊</div>
                        <div className="text-xs font-semibold text-gray-700">통계</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
                        <div className="text-xl mb-1">📧</div>
                        <div className="text-xs font-semibold text-gray-700">연락처</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 기능 소개 */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 mb-0.5">빠른 시작</h3>
                  <p className="text-xs text-gray-600">5분 만에 완성</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 mb-0.5">무료 제공</h3>
                  <p className="text-xs text-gray-600">모든 기능 무료</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Palette className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 mb-0.5">커스터마이징</h3>
                  <p className="text-xs text-gray-600">자유로운 배치</p>
                </div>
              </div>

              {/* URL 예시 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 text-center">
                <div className="text-xs text-gray-600 mb-1">당신의 전용 URL</div>
                <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-mono">
                  urwebs.com/@yourname
                </div>
                <div className="text-xs text-gray-500 mt-1">로그인하면 자동으로 생성됩니다</div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowIntroModal(false)}
                  className="flex-1 h-12"
                >
                  나중에 하기
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      // 로그인 후 템플릿 선택하도록 플래그 저장
                      localStorage.setItem('shouldShowTemplateAfterLogin', 'true');
                      // Google 로그인 팝업 띄우기
                      await signInWithPopup(auth, googleProvider);
                      // 로그인 성공 시 모달 닫기 (useEffect에서 템플릿 모달을 자동으로 열어줌)
                      setShowIntroModal(false);
                    } catch (error: any) {
                      console.error('Google 로그인 실패:', error);
                      // 팝업 차단이나 사용자가 취소한 경우
                      if (error.code === 'auth/popup-closed-by-user' || 
                          error.code === 'auth/cancelled-popup-request' ||
                          error.code === 'auth/popup-blocked') {
                        console.log('로그인 팝업이 닫혔거나 차단되었습니다.');
                        // 팝업 취소는 조용히 처리
                      } else {
                        alert('로그인에 실패했습니다. 다시 시도해주세요.');
                      }
                    }
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  무료로 만들기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 템플릿 선택 모달 */}
      {showTemplateModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTemplateModal(false);
              // 빈 캔버스로 시작
              setWidgets([]);
              setPageTitle('새 페이지');
            }
          }}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">템플릿 선택</h2>
              <p className="text-gray-600">새 페이지에 사용할 템플릿을 선택하세요</p>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setWidgets([]);
                  setPageTitle('새 페이지');
                }}
                className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                빈 캔버스로 시작하기
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingTemplates ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500">최신 템플릿을 불러오는 중...</p>
                  </div>
                </div>
              ) : availableTemplates.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">사용 가능한 템플릿이 없습니다.</p>
                </div>
              ) : (
                availableTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => createPageWithTemplate(template.id)}
                >
                  {/* 레이아웃 미리보기 */}
                  <div 
                    className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 h-32 flex items-center justify-center relative"
                    style={{ backgroundColor: template.color ? `${template.color}15` : '#f3f4f6' }}
                  >
                    <div className="absolute top-2 left-2 text-2xl">{template.icon}</div>
                    
                    {/* 실제 위젯 모습 미리보기 */}
                    {template.widgets.length > 0 ? (
                      <div className="flex gap-1 scale-50 origin-center">
                        {template.widgets.map((widget, index) => (
                          <div
                            key={index}
                            className="w-16 h-20 bg-white rounded border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow relative overflow-hidden"
                          >
                            {/* 위젯 헤더 */}
                            <div className="h-3 bg-gray-100 flex items-center justify-between px-0.5">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              <div className="flex gap-0.5">
                                <div className="w-1 h-1 bg-gray-400 rounded"></div>
                                <div className="w-1 h-1 bg-gray-400 rounded"></div>
                              </div>
                            </div>
                            
                            {/* 위젯 콘텐츠 */}
                            <div className="p-0.5 h-full">
                              {/* 북마크 위젯 */}
                              {widget.type === 'bookmark' && (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-0.5">
                                    <div className="w-0.5 h-0.5 bg-blue-500 rounded"></div>
                                    <div className="w-1.5 h-0.5 bg-gray-300 rounded"></div>
                                  </div>
                                  <div className="w-full h-0.5 bg-gray-200 rounded"></div>
                                  <div className="flex gap-0.5">
                                    <div className="w-1.5 h-0.5 bg-blue-100 rounded"></div>
                                    <div className="w-1.5 h-0.5 bg-gray-100 rounded"></div>
                                  </div>
                                </div>
                              )}
                              
                              {/* 소셜 위젯 */}
                              {widget.type === 'social' && (
                                <div className="space-y-0.5">
                                  <div className="grid grid-cols-2 gap-0.5">
                                    <div className="w-1.5 h-1 bg-blue-100 rounded"></div>
                                    <div className="w-1.5 h-1 bg-red-100 rounded"></div>
                                    <div className="w-1.5 h-1 bg-green-100 rounded"></div>
                                    <div className="w-1.5 h-1 bg-purple-100 rounded"></div>
                                  </div>
                                </div>
                              )}
                              
                              {/* QR 코드 위젯 */}
                              {widget.type === 'qr_code' && (
                                <div className="flex flex-col items-center justify-center h-full">
                                  <div className="w-3 h-3 bg-gray-800 rounded grid grid-cols-2 gap-px p-px">
                                    <div className="bg-white rounded-sm"></div>
                                    <div className="bg-gray-800 rounded-sm"></div>
                                    <div className="bg-gray-800 rounded-sm"></div>
                                    <div className="bg-white rounded-sm"></div>
                                  </div>
                                </div>
                              )}
                              
                              {/* GitHub 위젯 */}
                              {widget.type === 'github_repo' && (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-0.5">
                                    <div className="w-0.5 h-0.5 bg-gray-800 rounded"></div>
                                    <div className="w-1 h-0.5 bg-gray-300 rounded"></div>
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="w-full h-0.5 bg-gray-200 rounded"></div>
                                    <div className="w-3/4 h-0.5 bg-gray-200 rounded"></div>
                                  </div>
                                </div>
                              )}
                              
                              {/* 연락처 위젯 */}
                              {widget.type === 'contact' && (
                                <div className="space-y-0.5">
                                  <div className="flex gap-0.5">
                                    <div className="w-0.5 h-0.5 bg-blue-500 rounded"></div>
                                    <div className="w-1 h-0.5 bg-gray-200 rounded"></div>
                                  </div>
                                  <div className="flex gap-0.5">
                                    <div className="w-0.5 h-0.5 bg-green-500 rounded"></div>
                                    <div className="w-1 h-0.5 bg-gray-200 rounded"></div>
                                  </div>
                                </div>
                              )}
                              
                              {/* 통계 위젯 */}
                              {widget.type === 'stats' && (
                                <div className="space-y-0.5">
                                  <div className="flex justify-between">
                                    <div className="w-0.5 h-1.5 bg-blue-500 rounded-t"></div>
                                    <div className="w-0.5 h-1 bg-green-500 rounded-t"></div>
                                    <div className="w-0.5 h-2 bg-purple-500 rounded-t"></div>
                                  </div>
                                </div>
                              )}
                              
                              {/* 할 일 위젯 */}
                              {widget.type === 'todo' && (
                                <div className="space-y-0.5">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-0.5">
                                      <div className="w-0.5 h-0.5 border border-gray-400 rounded"></div>
                                      <div className="w-1.5 h-0.5 bg-gray-300 rounded"></div>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                      <div className="w-0.5 h-0.5 border border-gray-400 rounded"></div>
                                      <div className="w-2 h-0.5 bg-gray-300 rounded"></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* 주식 위젯 */}
                              {widget.type === 'stock' && (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-0.5">
                                    <div className="w-0.5 h-0.5 bg-green-500 rounded"></div>
                                    <div className="w-1 h-0.5 bg-gray-300 rounded"></div>
                                  </div>
                                  <div className="w-full h-0.5 bg-gray-200 rounded"></div>
                                  <div className="w-full h-0.5 bg-green-100 rounded"></div>
                                </div>
                              )}
                              
                              {/* 뉴스 위젯 */}
                              {widget.type === 'news' && (
                                <div className="space-y-0.5">
                                  <div className="space-y-0.5">
                                    <div className="w-full h-0.5 bg-gray-200 rounded"></div>
                                    <div className="w-3/4 h-0.5 bg-gray-200 rounded"></div>
                                  </div>
                                </div>
                              )}
                              
                              {/* 날씨 위젯 */}
                              {widget.type === 'weather' && (
                                <div className="flex flex-col items-center justify-center h-full">
                                  <div className="text-[4px]">☀️</div>
                                  <div className="w-1 h-0.5 bg-gray-200 rounded"></div>
                                </div>
                              )}
                              
                              {/* 기본 위젯 (기타) */}
                              {!['bookmark', 'social', 'qr_code', 'github_repo', 'contact', 'stats', 'todo', 'stock', 'news', 'weather'].includes(widget.type) && (
                                <div className="flex flex-col items-center justify-center h-full">
                                  <div className="w-1.5 h-1.5 bg-gray-200 rounded"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-4xl opacity-30">📄</div>
                    )}
                  </div>
                  
                  {/* 템플릿 정보 */}
                  <div className="p-4 bg-white">
                    <h3 className="text-base font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded-full">
                      위젯 {template.widgets.length}개
                      </span>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
            
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={() => setShowTemplateModal(false)}
                className="px-8"
              >
                취소
              </Button>
            </div>
            </div>
          </div>
        )}

      {!showTemplateModal && (
      <div className="uw-container py-0 pb-32">
        {/* 위젯 캔버스 - 전체 너비 사용 */}
        <div className="w-full pt-3 pb-0">
          <div 
            ref={canvasRef}
            className={`relative w-full min-h-[calc(100vh-200px)] transition-all duration-200 ${
              isEditMode 
                ? '' 
                : ''
            } p-0`}
            style={{ 
              position: 'relative'
            }}
            onMouseUp={handleMouseUp}
          >
          {/* 빈 상태 안내 */}
          {widgets.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500 max-w-md">
                <div className="text-2xl mb-4">🎨</div>
                <>
                  <div className="text-xl font-semibold mb-3">페이지가 비어있습니다</div>
                  <div className="text-sm mb-4">위 툴바의 "+ 위젯 추가" 버튼을 눌러 위젯을 추가해보세요</div>
                  <div className="text-xs text-gray-400 mt-2">위젯을 드래그하여 이동하고, 마우스를 올려 편집/삭제할 수 있습니다</div>
                </>
              </div>
            </div>
          )}

          {/* DraggableDashboardGrid 사용 */}
          <DraggableDashboardGrid
            widgets={widgets.map(w => {
              const converted = convertToGridWidget(w);
              if (!converted) {
                console.error('[convertToGridWidget] 위젯 변환 실패:', w.id);
                return null;
              }
              return converted;
            }).filter(Boolean) as any}
            renderWidget={(w) => renderWidget(w)}
            onLayoutChange={(updatedWidgets) => {
              // 변경 전 스냅샷을 히스토리에 저장 (현재 prevWidgets를 이용)
              // 위젯 위치 업데이트 (그리드 좌표를 그대로 사용)
              // 모든 위젯이 보존되도록 확인
              setWidgets(prevWidgets => {
                // updatedWidgets에 모든 위젯이 포함되었는지 확인
                if (updatedWidgets.length < prevWidgets.length) {
                  console.error('[onLayoutChange] 위젯 손실 감지!', {
                    original: prevWidgets.length,
                    updated: updatedWidgets.length,
                    missing: prevWidgets.length - updatedWidgets.length
                  });
                  
                  // 누락된 위젯을 찾아서 추가
                  const updatedIds = new Set(updatedWidgets.map(w => w.id));
                  const missingWidgets = prevWidgets.filter(w => !updatedIds.has(w.id));
                  
                  if (missingWidgets.length > 0) {
                    console.error('[onLayoutChange] 누락된 위젯 목록:', missingWidgets.map(w => ({ id: w.id, type: w.type, title: w.title })));
                    // 누락된 위젯을 포함하여 반환 (위치 업데이트는 하지 않음)
                    const updatedMap = new Map(updatedWidgets.map(w => [w.id, w]));
                    const result = prevWidgets.map(widget => {
                      const updated = updatedMap.get(widget.id);
                      if (updated && updated.x !== undefined && updated.y !== undefined) {
                        return { ...widget, x: updated.x, y: updated.y };
                      }
                      return widget;
                    });
                    
                    return result;
                  }
                }
                
                // 위치만 업데이트 (크기 변경은 유지)
                const updatedMap = new Map(updatedWidgets.map(w => [w.id, w]));
                const movedWidgets: Array<{ id: string; fromX: number; fromY: number; toX: number; toY: number }> = [];
                const result = prevWidgets.map(widget => {
                  const updated = updatedMap.get(widget.id);
                  if (updated && updated.x !== undefined && updated.y !== undefined) {
                    if (widget.x !== updated.x || widget.y !== updated.y) {
                      movedWidgets.push({
                        id: widget.id,
                        fromX: widget.x ?? 0,
                        fromY: widget.y ?? 0,
                        toX: updated.x,
                        toY: updated.y,
                      });
                    }
                    return { ...widget, x: updated.x, y: updated.y };
                  }
                  return widget;
                });
                
                if (movedWidgets.length > 0) {
                  movedWidgets.forEach((movement) => {
                    trackEvent(ANALYTICS_EVENTS.WIDGET_MOVE, {
                      widgetId: movement.id,
                      from: { x: movement.fromX, y: movement.fromY },
                      to: { x: movement.toX, y: movement.toY },
                      pageId: currentPageId,
                      userType: currentUser ? 'member' : 'guest',
                    });
                  });
                }
                
                return result;
              });
            }}
            isEditMode={isEditMode}
            cellHeight={cellHeight}
            cellWidth={subCellWidth}
            gap={12}
            cols={isMobile ? 4 : 8}
            className=""
            onAddWidget={(columnIndex?: number) => {
              // 위젯 패널을 열어서 선택하도록 하되, 선택 시 해당 컬럼 최하단에 추가되도록 targetColumn 전달
              setShowWidgetModal(true);
              // 선택 콜백을 덮어써서 columnIndex 전달
              const originalAdd = addWidget;
              (window as any).__addWidgetWithColumn = (type: string, size?: any) => {
                originalAdd(type, size, columnIndex);
                setShowWidgetModal(false);
                delete (window as any).__addWidgetWithColumn;
              };
            }}
            showAddButton={true}
            userId={currentUser?.uid || 'guest'}
            collisionStrategy="push"
            responsiveCells={responsiveCellHeights}
            layoutPreset={isEditMode ? ((new URLSearchParams(window.location.search)).get('preset') as any) || 'masonry' : undefined}
            magnetThresholdRows={Number((new URLSearchParams(window.location.search)).get('magnet')) || 1}
          />
          </div>
        </div>



        {/* 위젯 선택 패널 */}
        <WidgetPanel 
          isOpen={showWidgetModal}
          onClose={() => setShowWidgetModal(false)}
          onAddWidget={(type) => addWidget(type)}
        />

                 

        {/* 배경 설정 모달 */}
        {showBackgroundModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  배경 설정
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBackgroundModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">배경 타입</label>
                  <select 
                    value={backgroundSettings.type}
                    onChange={(e) => setBackgroundSettings({...backgroundSettings, type: e.target.value as any})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="solid">단색</option>
                    <option value="image">이미지</option>
                  </select>
                </div>
                
                {backgroundSettings.type === 'solid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
                    <input
                      type="color"
                      value={backgroundSettings.color}
                      onChange={(e) => setBackgroundSettings({...backgroundSettings, color: e.target.value})}
                      className="w-full h-10 border rounded"
                    />
                  </div>
                )}
                
                {/* gradient 옵션 제거 */}
                
                {backgroundSettings.type === 'image' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">이미지 업로드</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        disabled={isUploadingBackground}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          
                          // 같은 파일 재선택 대비 초기화는 finally에서
                          if (!file) return;

                          // 디버그 로그
                          console.debug('[bg] 선택됨', { name: file.name, size: file.size, type: file.type });

                          // 로그인 검증
                          const auth = getAuth();
                          const uid = auth.currentUser?.uid;
                          if (!uid) {
                            setToast({ type: 'error', msg: '로그인 후 업로드할 수 있어요.' });
                            console.warn('[bg] currentUser.uid 없음');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                            return;
                          }

                          // 크기/타입 1차 체크
                          const MAX = 10 * 1024 * 1024; // 10MB
                          if (file.size > MAX) {
                            setToast({ type: 'error', msg: '최대 10MB까지 업로드 가능합니다.' });
                            if (fileInputRef.current) fileInputRef.current.value = '';
                            return;
                          }
                          if (!file.type.startsWith('image/')) {
                            setToast({ type: 'error', msg: '이미지 파일만 업로드할 수 있어요.' });
                            if (fileInputRef.current) fileInputRef.current.value = '';
                            return;
                          }

                          setIsUploadingBackground(true);
                          
                          try {
                            const safeName = file.name.replace(/[^\w.-]+/g, '_').slice(0, 80);
                            const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                            const fileName = `${Date.now()}_${safeName}`;
                            const path = `backgrounds/${uid}/${fileName}`;

                            console.debug('[bg] 업로드 시작', { path, size: file.size });

                            const url = await uploadImage({
                              path,
                              file,
                              timeoutMs: 15000,    // 요구된 15초
                              maxRetries: 2,       // 요구된 2회 재시도
                              onProgress: (pct) => console.debug('[bg] progress', pct),
                              logger: (...args) => console.debug('[bg]', ...args),
                            });

                            // 상태 반영
                            setBackgroundSettings({
                              ...backgroundSettings,
                              image: url,
                              opacity: backgroundSettings.opacity
                            });

                            setToast({ type: 'success', msg: '배경 이미지가 업로드되었습니다.' });
                            console.debug('[bg] 완료', { url: url.substring(0, 50) + '...' });
                          } catch (err: any) {
                            const code = err?.code || err?.message || String(err);
                            console.error('[bg] 업로드 실패', { code, error: err });
                            
                            // 사용자 친화 메시지
                            if (code === 'timeout' || err?.message === 'timeout') {
                              setToast({ type: 'error', msg: '업로드가 지연되어 중단되었습니다. 네트워크 상태 확인 후 다시 시도해주세요.' });
                            } else if (code === 'storage/unauthorized') {
                              setToast({ type: 'error', msg: '권한이 없습니다. 관리자에게 문의하세요.' });
                            } else if (code === 'storage/retry-limit-exceeded') {
                              setToast({ type: 'error', msg: '재시도 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' });
                            } else {
                              setToast({ type: 'error', msg: '업로드에 실패했습니다.' });
                            }
                          } finally {
                            setIsUploadingBackground(false);        // ✅ 어떤 경우에도 false
                            if (fileInputRef.current) fileInputRef.current.value = ''; // 같은 파일 재선택 가능
                            console.debug('[bg] finally - isUploadingBackground = false');
                          }
                        }}
                        className="w-full p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {isUploadingBackground && (
                        <p className="mt-1 text-xs text-gray-500">업로드 중… 잠시만 기다려주세요.</p>
                      )}
                    </div>
                    
                    {backgroundSettings.image && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">미리보기</label>
                        <div className="w-full h-32 border rounded overflow-hidden">
                          <img 
                            src={backgroundSettings.image} 
                            alt="배경 이미지 미리보기"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">투명도</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={backgroundSettings.opacity}
                        onChange={(e) => setBackgroundSettings({
                          ...backgroundSettings,
                          opacity: parseFloat(e.target.value)
                        })}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        투명도: {Math.round(backgroundSettings.opacity * 100)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowBackgroundModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={async () => {
                    // 배경 설정을 현재 페이지에 저장
                    const updatedPages = reindexPages(pages.map(page => {
                      if (page.id === currentPageId) {
                        return {
                          ...page,
                          backgroundSettings: backgroundSettings
                        };
                      }
                      return page;
                    }));
                    setPages(updatedPages);
                    
                    // localStorage에 저장
                    persistPagesToStorage(updatedPages);
                    if (currentUser) {
                      localStorage.setItem(`backgroundSettings_${currentUser.id}`, JSON.stringify(backgroundSettings));
                    } else {
                      localStorage.setItem('backgroundSettings_guest', JSON.stringify(backgroundSettings));
                    }
                    
                    // Firebase에 저장 (로그인 사용자이고 위젯이 있는 경우)
                    if (currentUser && widgets.length > 0) {
                      try {
                        const currentPage = updatedPages.find(p => p.id === currentPageId);
                        if (currentPage) {
                          const userIdPart = (currentUser?.email?.split('@')[0] || 'user');
                          const userPageIndex = updatedPages.findIndex(p => p.id === currentPageId) + 1;
                          const urlId = customUrl || `${userIdPart}_${userPageIndex}`;
                          
                          const pagesRef = collection(db, 'userPages');
                          const q = query(pagesRef, where('authorId', '==', currentUser.id), where('urlId', '==', urlId));
                          const snapshot = await getDocs(q);
                          
                          if (!snapshot.empty) {
                            const docId = snapshot.docs[0].id;
                            const docRef = doc(db, 'userPages', docId);
                            await updateDoc(docRef, {
                              backgroundSettings: backgroundSettings,
                              updatedAt: serverTimestamp()
                            });
                          } else if ((currentPage as any)?.firebaseDocId) {
                            const fallbackId = (currentPage as any).firebaseDocId as string;
                            const docRef = doc(db, 'userPages', fallbackId);
                            await updateDoc(docRef, {
                              backgroundSettings: backgroundSettings,
                              updatedAt: serverTimestamp()
                            });
                          }
                        }
                      } catch (error) {
                        console.error('배경 설정 Firebase 저장 실패:', error);
                      }
                    }
                    
                    setShowBackgroundModal(false);
                    setToast({ type: 'success', msg: '배경 설정이 저장되었습니다.' });
                  }}
                  className="flex-1"
                >
                  적용
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 폰트 설정 모달 */}
        {showFontModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Type className="w-5 h-5 mr-2" />
                  폰트 설정
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFontModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">폰트 패밀리</label>
                  <select 
                    value={fontSettings.family}
                    onChange={(e) => setFontSettings({...fontSettings, family: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    {fontOptions.map((font) => (
                      <option key={font.family} value={font.family}>{font.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">폰트 크기: {fontSettings.size}px</label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={fontSettings.size}
                    onChange={(e) => setFontSettings({...fontSettings, size: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">폰트 색상</label>
                  <input
                    type="color"
                    value={fontSettings.color}
                    onChange={(e) => setFontSettings({...fontSettings, color: e.target.value})}
                    className="w-full h-10 border rounded"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={fontSettings.weight === 'bold'}
                      onChange={(e) => setFontSettings({...fontSettings, weight: e.target.checked ? 'bold' : 'normal'})}
                      className="rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">굵게</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={fontSettings.style === 'italic'}
                      onChange={(e) => setFontSettings({...fontSettings, style: e.target.checked ? 'italic' : 'normal'})}
                      className="rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">기울임</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowFontModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={() => setShowFontModal(false)}
                  className="flex-1"
                >
                  적용
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 위젯 편집 모달 */}
        {editingWidget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">위젯 편집</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelEdit}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                {editingWidget && (() => {
                  const widget = widgets.find(w => w.id === editingWidget);
                  if (!widget) return null;

                  switch (widget.type) {
                    case 'profile_card':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                            <input
                              type="text"
                              value={formData.name || ''}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                      </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
                            <input
                              type="text"
                              value={formData.nickname || ''}
                              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                    </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">한 줄 소개</label>
                            <input
                              type="text"
                              value={formData.bio || ''}
                              onChange={(e) => setFormData({...formData, bio: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">소셜 링크</label>
                            {formData.socialLinks?.map((link: any, index: number) => (
                              <div key={index} className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  placeholder="플랫폼"
                                  value={link.platform || ''}
                                  onChange={(e) => {
                                    const newLinks = [...formData.socialLinks];
                                    newLinks[index] = {...link, platform: e.target.value};
                                    setFormData({...formData, socialLinks: newLinks});
                                  }}
                                  className="flex-1 p-2 border rounded"
                                />
                                <input
                                  type="url"
                                  placeholder="URL"
                                  value={link.url || ''}
                                  onChange={(e) => {
                                    const newLinks = [...formData.socialLinks];
                                    newLinks[index] = {...link, url: e.target.value};
                                    setFormData({...formData, socialLinks: newLinks});
                                  }}
                                  className="flex-1 p-2 border rounded"
                                />
                  </div>
                ))}
              </div>
                        </div>
                      );

                    case 'business_header':
                      return (
                <div className="space-y-4">
                  <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">가게 이름</label>
                    <input
                              type="text"
                              value={formData.name || ''}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full p-2 border rounded"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">가게 소개</label>
                            <textarea
                              value={formData.description || ''}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              className="w-full p-2 border rounded h-20 resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                            <input
                              type="tel"
                              value={formData.phone || ''}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                            <input
                              type="text"
                              value={formData.address || ''}
                              onChange={(e) => setFormData({...formData, address: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        </div>
                      );

                    case 'event_header':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">행사 제목</label>
                            <input
                              type="text"
                              value={formData.title || ''}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                  <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                      <input
                                type="date"
                                value={formData.date || ''}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                    </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                      <input
                                type="time"
                                value={formData.time || ''}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                    </div>
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
                            <input
                              type="text"
                              value={formData.location || ''}
                              onChange={(e) => setFormData({...formData, location: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">행사 설명</label>
                            <textarea
                              value={formData.description || ''}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              className="w-full p-2 border rounded h-20 resize-none"
                            />
                          </div>
                        </div>
                      );

                    case 'note':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">메모 제목</label>
                            <input
                              type="text"
                              value={formData.title || ''}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                            <textarea
                              value={formData.content || ''}
                              onChange={(e) => setFormData({...formData, content: e.target.value})}
                              className="w-full p-2 border rounded h-32 resize-none"
                              placeholder="메모를 입력하세요..."
                            />
                          </div>
                        </div>
                      );

                    case 'reminder':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">알림 제목</label>
                            <input
                              type="text"
                              value={formData.title || ''}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">알림 내용</label>
                            <textarea
                              value={formData.content || ''}
                              onChange={(e) => setFormData({...formData, content: e.target.value})}
                              className="w-full p-2 border rounded h-20 resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                              <input
                                type="date"
                                value={formData.date || ''}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                              <input
                                type="time"
                                value={formData.time || ''}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                          </div>
                        </div>
                      );

                    case 'goal':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">목표 제목</label>
                            <input
                              type="text"
                              value={formData.title || ''}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">목표 설명</label>
                            <textarea
                              value={formData.description || ''}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              className="w-full p-2 border rounded h-20 resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">목표 값</label>
                              <input
                                type="number"
                                value={formData.target || ''}
                                onChange={(e) => setFormData({...formData, target: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">현재 값</label>
                              <input
                                type="number"
                                value={formData.current || ''}
                                onChange={(e) => setFormData({...formData, current: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">단위</label>
                            <input
                              type="text"
                              value={formData.unit || ''}
                              onChange={(e) => setFormData({...formData, unit: e.target.value})}
                              className="w-full p-2 border rounded"
                              placeholder="예: kg, km, 개, 권..."
                            />
                          </div>
                        </div>
                      );

                    case 'habit':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">습관 이름</label>
                            <input
                              type="text"
                              value={formData.title || ''}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">목표 주기</label>
                            <select
                              value={formData.frequency || 'daily'}
                              onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                              className="w-full p-2 border rounded"
                            >
                              <option value="daily">매일</option>
                              <option value="weekly">매주</option>
                              <option value="monthly">매월</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">목표 횟수</label>
                            <input
                              type="number"
                              value={formData.target || ''}
                              onChange={(e) => setFormData({...formData, target: e.target.value})}
                              className="w-full p-2 border rounded"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                            <textarea
                              value={formData.description || ''}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              className="w-full p-2 border rounded h-16 resize-none"
                            />
                          </div>
                        </div>
                      );

                    case 'expense':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">지출 항목</label>
                            <input
                              type="text"
                              value={formData.title || ''}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">금액</label>
                            <input
                              type="number"
                              value={formData.amount || ''}
                              onChange={(e) => setFormData({...formData, amount: e.target.value})}
                              className="w-full p-2 border rounded"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                            <select
                              value={formData.category || 'food'}
                              onChange={(e) => setFormData({...formData, category: e.target.value})}
                              className="w-full p-2 border rounded"
                            >
                              <option value="food">식비</option>
                              <option value="transport">교통비</option>
                              <option value="shopping">쇼핑</option>
                              <option value="entertainment">오락</option>
                              <option value="health">건강</option>
                              <option value="education">교육</option>
                              <option value="other">기타</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                            <input
                              type="date"
                              value={formData.date || ''}
                              onChange={(e) => setFormData({...formData, date: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        </div>
                      );

                    case 'quote':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">명언</label>
                            <textarea
                              value={formData.quote || ''}
                              onChange={(e) => setFormData({...formData, quote: e.target.value})}
                              className="w-full p-2 border rounded h-20 resize-none"
                              placeholder="명언을 입력하세요..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">작가</label>
                            <input
                              type="text"
                              value={formData.author || ''}
                              onChange={(e) => setFormData({...formData, author: e.target.value})}
                              className="w-full p-2 border rounded"
                              placeholder="작가명을 입력하세요..."
                            />
                          </div>
                        </div>
                      );

                    case 'bookmark':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                            <input
                              type="text"
                              value={formData.title || ''}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              className="w-full p-2 border rounded"
                              placeholder="폴더 이름"
                            />
                          </div>
                        </div>
                      );

                    default:
                      return (
                        <div className="text-center text-gray-500 py-8">
                          <div className="mb-4">
                            <Settings className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                          </div>
                          <p className="text-lg font-medium mb-2">편집 불가능한 위젯</p>
                          <p className="text-sm text-gray-400">
                            {editingWidget && widgets.find(w => w.id === editingWidget)?.type === 'google_search' && '검색 위젯은 편집할 수 없습니다.'}
                            {editingWidget && widgets.find(w => w.id === editingWidget)?.type === 'naver_search' && '검색 위젯은 편집할 수 없습니다.'}
                            {editingWidget && widgets.find(w => w.id === editingWidget)?.type === 'social' && '소셜 링크 위젯은 편집할 수 없습니다.'}
                            {editingWidget && widgets.find(w => w.id === editingWidget)?.type === 'news' && '뉴스 위젯은 편집할 수 없습니다.'}
                            {editingWidget && widgets.find(w => w.id === editingWidget)?.type === 'calendar' && '캘린더 위젯은 편집할 수 없습니다.'}
                            {!editingWidget || !widgets.find(w => w.id === editingWidget) || !['google_search', 'naver_search', 'social', 'news', 'calendar'].includes(widgets.find(w => w.id === editingWidget)?.type || '') ? '이 위젯은 편집할 수 없습니다.' : ''}
                          </p>
                        </div>
                      );
                  }
                })()}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={() => saveWidget(editingWidget)}
                  className="flex-1"
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        )}

        </div>
      )}

      {/* 토스트 메시지 */}
      {toast && (
        <div
          className={`fixed bottom-12 right-6 z-[10000] max-w-sm rounded-2xl px-4 py-3 shadow-xl backdrop-blur ${
            toast.type === 'success'
              ? 'bg-emerald-500/90 text-white'
              : toast.type === 'error'
              ? 'bg-rose-500/90 text-white'
              : 'bg-slate-900/85 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium leading-5">{toast.msg}</span>
            {toast.actionLabel && toast.onAction && (
              <button
                onClick={toast.onAction}
                className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white hover:bg-white/30 transition-colors"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        </div>
      )}

      {continueModal}

      {/* 나도 나만의 페이지 만들어보기 버튼 */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[10001] pointer-events-auto">
        <button
          onClick={() => navigate('/mypage')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 flex items-center gap-2 text-base animate-pulse hover:animate-none"
        >
          <Sparkles className="w-5 h-5" />
          나도 나만의 페이지 만들어보기
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
