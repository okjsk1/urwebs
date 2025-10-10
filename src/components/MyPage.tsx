import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Star, Clock, Globe, Settings, Palette, Grid, Link, Type, Image, Save, Eye, Trash2, Edit, Move, Maximize2, Minimize2, RotateCcw, Download, Upload, Layers, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, MousePointer, Square, Circle, Triangle, Share2, Copy, ExternalLink, Lock, Unlock, Calendar, Music, User, Users, BarChart3, TrendingUp, DollarSign, Target, CheckSquare, FileText, Image as ImageIcon, Youtube, Twitter, Instagram, Github, Mail, Phone, MapPin, Thermometer, Cloud, Sun, CloudRain, CloudSnow, Zap, Battery, Wifi, Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Heart, ThumbsUp, MessageCircle, Bell, Search, Filter, SortAsc, SortDesc, MoreHorizontal, MoreVertical, Sun as SunIcon, Moon, MessageCircle as ContactIcon, Calculator, Rss, QrCode, Smile, Laugh, Quote, BookOpen, RefreshCw, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../contexts/ThemeContext';
import { auth, googleProvider, db } from '../firebase/config';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

// 타입 및 상수 import
import { Widget, WidgetSize, BackgroundSettings, ShareSettings, Page, Bookmark, FontSettings, LayoutSettings } from '../types/mypage.types';
import { widgetCategories, getCategoryIcon, fontOptions, allWidgets } from '../constants/widgetCategories';
import { getWidgetDimensions, isWidgetOverlapping, getNextAvailablePosition, getColumnLastWidget as getColumnLastWidgetUtil, getColumnBottomY as getColumnBottomYUtil } from '../utils/widgetHelpers';
import { templates, getDefaultWidgets } from '../constants/pageTemplates';
import { templateService } from '../services/templateService';
import { WidgetPanel } from './MyPage/WidgetPanel';

// 위젯 컴포넌트들 import
import {
  TodoWidget,
  GoalWidget,
  HabitWidget,
  TimerWidget,
  ReminderWidget,
  QuickNoteWidget,
  CalendarWidget,
  EmailWidget,
  MailServicesWidget,
  StockWidget,
  CryptoWidget,
  ExchangeWidget,
  StockAlertWidget,
  EconomicCalendarWidget,
  ExpenseWidget,
  GitHubWidget,
  CalculatorWidget,
  ConverterWidget,
  PasswordWidget,
  QRCodeWidget,
  NewsWidget,
  WeatherWidget,
  WeatherSmallWidget,
  WeatherMediumWidget,
  RSSWidget,
  GoogleSearchWidget,
  NaverSearchWidget,
  LawSearchWidget,
  MusicWidget,
  QuoteWidget,
  ColorPickerWidget,
  BookmarkWidget,
  StatsWidget,
  EnglishWordsWidget,
  SocialWidget
} from './widgets';

// 인터페이스들은 이제 types에서 import

export function MyPage() {
  const { theme, toggleTheme } = useTheme();
  
  
  const [isEditMode, setIsEditMode] = useState(true); // 항상 편집 가능
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  
  // 그리드 설정 상수
  const spacing = 5;
  const MAIN_COLUMNS = 8; // 메인 컬럼 개수
  const SUB_COLUMNS = 1; // 각 메인 컬럼 내부 서브 그리드 개수
  
  // 동적 셀 크기 계산 (서브셀 크기)
  const [subCellWidth, setSubCellWidth] = useState(18); // 서브셀 너비
  const [cellHeight, setCellHeight] = useState(60);
  
  // 메인 컬럼 너비 계산
  const mainColumnWidth = subCellWidth * SUB_COLUMNS + spacing * (SUB_COLUMNS - 1); // 1칸 (서브분할 없음)
  const cellWidth = subCellWidth; // 하위 호환성 유지
  
  // 위젯 상태 관리
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState({
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
  const [cryptoPrices, setCryptoPrices] = useState({
    bitcoin: { price: 45000000, change: 2.5 },
    ethereum: { price: 3200000, change: -1.2 },
    solana: { price: 180000, change: 5.8 }
  });
  const [musicState, setMusicState] = useState({
    isPlaying: false,
    currentSong: '샘플 음악',
    artist: '샘플 아티스트',
    duration: 180,
    currentTime: 0
  });

  // 설정들
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>({
    type: 'gradient',
    color: '#3B82F6',
    gradient: {
      from: '#3B82F6',
      to: '#8B5CF6',
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

  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isPublic: false,
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
  
  // 페이지 관리 상태
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);

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
            const updatedPages = [...prevPages];
            if (updatedPages[0]) {
              updatedPages[0].title = newTitle;
            }
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

  // 처음 방문 시 소개 모달 또는 템플릿 선택 모달 자동으로 표시
  useEffect(() => {
    const shouldShowTemplateAfterLogin = localStorage.getItem('shouldShowTemplateAfterLogin');
    
    console.log('=== MyPage 모달 체크 ===');
    console.log('currentUser:', currentUser);
    console.log('shouldShowTemplateAfterLogin:', shouldShowTemplateAfterLogin);
    
    // 로그인 후 템플릿 선택 플래그가 있으면 템플릿 모달 표시
    if (currentUser && shouldShowTemplateAfterLogin === 'true') {
      console.log('→ 로그인 후 템플릿 모달 표시');
      setShowTemplateModal(true);
      localStorage.setItem(`hasVisitedMyPage_${currentUser.id}`, 'true');
      localStorage.removeItem('shouldShowTemplateAfterLogin');
      return;
    }
    
    // 사용자별 방문 기록 확인
    const userVisitKey = currentUser ? `hasVisitedMyPage_${currentUser.id}` : 'hasVisitedMyPage_guest';
    const hasVisitedMyPage = localStorage.getItem(userVisitKey);
    const savedPages = currentUser ? localStorage.getItem(`myPages_${currentUser.id}`) : null;
    
    console.log('userVisitKey:', userVisitKey);
    console.log('hasVisitedMyPage:', hasVisitedMyPage);
    console.log('savedPages:', savedPages);
    
    // 비로그인 상태
    if (!currentUser) {
      const guestPages = localStorage.getItem('myPages');
      // 저장된 페이지가 없으면 템플릿 모달 표시
      if (!hasVisitedMyPage || !guestPages) {
        console.log('→ 비로그인 사용자 첫 방문 또는 페이지 없음: 템플릿 모달 표시');
        setShowTemplateModal(true);
        localStorage.setItem(userVisitKey, 'true');
      } else {
        console.log('→ 비로그인 사용자 재방문 (저장된 페이지 있음): 모달 표시 안함');
      }
      return;
    }
    
    // 로그인 상태: 저장된 페이지가 있는지 확인
    if (savedPages) {
      try {
        // 저장된 페이지가 있으면 모달 표시하지 않고 바로 해당 페이지 로드
        const parsedPages = JSON.parse(savedPages);
        console.log('→ 로그인 사용자 (저장된 페이지 있음): 페이지 바로 로드', parsedPages);
        
        if (parsedPages && parsedPages.length > 0) {
          setPages(parsedPages);
          setCurrentPageId(parsedPages[0].id);
          setPageTitle(parsedPages[0].title);
          setWidgets(parsedPages[0].widgets || []);
          console.log('→ 첫 번째 페이지로 자동 이동:', parsedPages[0].title);
        }
        
        localStorage.setItem(userVisitKey, 'true');
      } catch (error) {
        console.error('저장된 페이지 파싱 오류:', error);
        // 파싱 오류 시 템플릿 모달 표시
        setShowTemplateModal(true);
        localStorage.setItem(userVisitKey, 'true');
      }
    } else {
      // 저장된 페이지가 없으면 템플릿 모달 표시
      console.log('→ 로그인 사용자 (저장된 페이지 없음): 템플릿 모달 표시');
      setShowTemplateModal(true);
      localStorage.setItem(userVisitKey, 'true');
    }
  }, [currentUser]);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);

  // 저장된 페이지 불러오기
  useEffect(() => {
    // 로그인 사용자의 페이지 불러오기
    if (currentUser) {
      const savedPagesData = localStorage.getItem(`myPages_${currentUser.id}`);
      const savedShareSettings = localStorage.getItem(`shareSettings_${currentUser.id}`);
      
      // 공개 설정 복원
      if (savedShareSettings) {
        try {
          const settings = JSON.parse(savedShareSettings);
          setShareSettings(settings);
          console.log('공개 설정 복원됨:', settings);
        } catch (e) {
          console.error('공개 설정 복원 실패:', e);
        }
      }
      
      if (savedPagesData) {
        try {
          const loadedPages = JSON.parse(savedPagesData);
          console.log('저장된 페이지 불러오기 (로그인 사용자):', loadedPages);
          setPages(loadedPages);
          
          // 활성 페이지 찾기
          const activePage = loadedPages.find((p: any) => p.isActive) || loadedPages[0];
          if (activePage) {
            setCurrentPageId(activePage.id);
            setPageTitle(activePage.title);
            
            // 위젯 불러오기 - 검색 위젯 크기 자동 업데이트
            const updatedWidgets = (activePage.widgets || []).map((widget: Widget) => {
              if (widget.type === 'google_search' || widget.type === 'naver_search' || 
                  widget.type === 'law_search') {
                // 검색 위젯은 4칸 너비, 225px 높이로 업데이트
                return {
                  ...widget,
                  width: (18 + 5) * 4 - 5, // 87px (4칸)
                  height: 225
                };
              }
              return widget;
            });
            
            setWidgets(updatedWidgets);
          }
        } catch (error) {
          console.error('페이지 로드 실패:', error);
        }
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
          console.log('공개 설정 복원됨 (게스트):', settings);
        } catch (e) {
          console.error('공개 설정 복원 실패 (게스트):', e);
        }
      }
      
      if (guestPagesData) {
        try {
          const loadedPages = JSON.parse(guestPagesData);
          console.log('저장된 페이지 불러오기 (게스트):', loadedPages);
          setPages(loadedPages);
          
          // 활성 페이지 찾기
          const activePage = loadedPages.find((p: any) => p.isActive) || loadedPages[0];
          if (activePage) {
            setCurrentPageId(activePage.id);
            setPageTitle(activePage.title);
            
            // 위젯 불러오기 - 검색 위젯 크기 자동 업데이트
            const updatedWidgets = (activePage.widgets || []).map((widget: Widget) => {
              if (widget.type === 'google_search' || widget.type === 'naver_search' || 
                  widget.type === 'law_search') {
                // 검색 위젯은 4칸 너비, 225px 높이로 업데이트
                return {
                  ...widget,
                  width: (18 + 5) * 4 - 5, // 87px (4칸)
                  height: 225
                };
              }
              return widget;
            });
            
            setWidgets(updatedWidgets);
          }
        } catch (error) {
          console.error('페이지 로드 실패:', error);
        }
      }
    }
  }, [currentUser]);

  // 검색 위젯 크기 자동 업데이트
  useEffect(() => {
    const hasSearchWidgets = widgets.some(w => 
      (w.type === 'google_search' || w.type === 'naver_search' || 
       w.type === 'law_search') && 
      (w.width !== 87 || w.height !== 225)
    );
    
    if (hasSearchWidgets) {
      setWidgets(prevWidgets => 
        prevWidgets.map(widget => {
          if (widget.type === 'google_search' || widget.type === 'naver_search' ||
              widget.type === 'law_search') {
            return {
              ...widget,
              width: 87, // (18 + 5) * 4 - 5 (4칸)
              height: 225
            };
          }
          return widget;
        })
      );
    }
  }, []);

  const canvasRef = useRef<HTMLDivElement>(null);

  // 페이지 크기에 따른 동적 셀 크기 계산
  useEffect(() => {
    const updateCellSize = () => {
      if (canvasRef.current) {
        const containerWidth = canvasRef.current.offsetWidth;
        // 1. 전체를 4개 메인 컬럼으로 분할
        const mainColSpacing = (MAIN_COLUMNS - 1) * spacing;
        const calculatedMainColumnWidth = Math.floor((containerWidth - mainColSpacing) / MAIN_COLUMNS);
        
        // 2. 각 메인 컬럼을 4개 서브셀로 분할
        const subColSpacing = (SUB_COLUMNS - 1) * spacing;
        const calculatedSubCellWidth = Math.floor((calculatedMainColumnWidth - subColSpacing) / SUB_COLUMNS);
        
        setSubCellWidth(calculatedSubCellWidth);
        setCellHeight(calculatedSubCellWidth); // 정사각형으로 설정
        console.log('서브셀 크기:', calculatedSubCellWidth, '메인 컬럼 너비:', calculatedMainColumnWidth, '컨테이너:', containerWidth);
      }
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, [spacing]);

  // 셀 크기 변경 시 기존 위젯들 크기 업데이트
  useEffect(() => {
    setWidgets(prevWidgets => prevWidgets.map((widget, index) => {
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
  }, [cellWidth, cellHeight, spacing]);

  // 현재 페이지의 위젯들 가져오기
  const currentPage = pages.find(page => page.id === currentPageId);
  const [widgets, setWidgets] = useState<Widget[]>([]);

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
  }, [currentPageId, pages]);

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

  const createNewPage = () => {
    setShowTemplateModal(true);
    loadTemplates(); // 템플릿 모달이 열릴 때 최신 템플릿 로드
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
        
        // 검색 위젯은 자동으로 크기 조정
        if (widget.type === 'google_search' || widget.type === 'naver_search' || widget.type === 'law_search') {
          return {
            ...widget,
            id: `${widget.type}_${Date.now()}_${index}`,
            width: (18 + 5) * 4 - 5, // 4칸 너비
            height: 225,
            x: widget.x || 0,
            y: widget.y || 0 // 검색 위젯은 항상 맨 위에
          };
        }

        // 다른 위젯들의 위치 조정 (검색 위젯 아래에 배치)
        let adjustedY = widget.y || row * (cellHeight + spacing);

        // 검색 위젯이 있는 경우 그 아래에 배치
        const hasSearchWidget = templateData.widgets.some(w =>
          (w.type === 'google_search' || w.type === 'naver_search' || w.type === 'law_search') &&
          (w.y === 0 || w.y === undefined)
        );

        if (hasSearchWidget && row === 0) {
          // 검색 위젯이 있는 경우 첫 번째 행 위젯들을 검색 위젯 아래로 이동
          adjustedY = 230; // 검색 위젯 바로 아래 (225 + 5)
        } else if (hasSearchWidget && row === 1) {
          // 두 번째 행 위젯들도 적절한 간격으로 배치
          adjustedY = 310; // 첫 번째 행 아래 (230 + 75 + 5)
        } else if (hasSearchWidget && row >= 2) {
          // 세 번째 행 이상의 위젯들도 검색 위젯을 고려하여 배치
          adjustedY = widget.y || (row * (cellHeight + spacing)) + 230; // 검색 위젯 높이만큼 추가 오프셋
        }

        return {
          ...widget,
          id: `${widget.type}_${Date.now()}_${index}`,
          width: widget.width || cellWidth,
          height: widget.height || cellHeight,
          x: widget.x || col * (cellWidth + spacing),
          y: adjustedY
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
      const updatedPages = pages.map(page => ({ ...page, isActive: false })).concat(newPage);
      setPages(updatedPages);
      setCurrentPageId(newPageId);
      setPageTitle(newPage.title);
      setWidgets(positionedWidgets);
      
      // localStorage에 즉시 저장
      if (currentUser) {
        localStorage.setItem(`myPages_${currentUser.id}`, JSON.stringify(updatedPages));
        console.log('최신 템플릿으로 페이지 생성 및 저장 완료:', newPage);
      }
      
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
    const updatedPages = pages.map(page => ({ ...page, isActive: false })).concat(newPage);
    setPages(updatedPages);
    setCurrentPageId(newPageId);
    setPageTitle(newPage.title);
    setWidgets(positionedWidgets);
    
    // localStorage에 즉시 저장
    if (currentUser) {
      localStorage.setItem(`myPages_${currentUser.id}`, JSON.stringify(updatedPages));
      console.log('로컬 템플릿으로 페이지 생성 및 저장 완료:', newPage);
    }
    
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
      setPages(prev => prev.map(page => ({ ...page, isActive: page.id === pageId })));
    }
  };

  const deletePage = (pageId: string) => {
    if (pages.length <= 1) {
      alert('최소 하나의 페이지는 유지해야 합니다.');
      return;
    }
    
    const remainingPages = pages.filter(page => page.id !== pageId);
    setPages(remainingPages);
    
    // 삭제된 페이지가 현재 페이지였다면 첫 번째 페이지로 전환
    if (currentPageId === pageId) {
      const firstPage = remainingPages[0];
      setCurrentPageId(firstPage.id);
      setPageTitle(firstPage.title);
      setWidgets(firstPage.widgets);
    }
  };

  // 페이지 순서 변경 (위로 이동)
  const movePageUp = (pageId: string) => {
    const currentIndex = pages.findIndex(page => page.id === pageId);
    if (currentIndex <= 0) return; // 첫 번째 페이지는 위로 이동 불가
    
    const newPages = [...pages];
    [newPages[currentIndex - 1], newPages[currentIndex]] = [newPages[currentIndex], newPages[currentIndex - 1]];
    setPages(newPages);
    
    // localStorage에 즉시 저장
    if (currentUser) {
      localStorage.setItem(`myPages_${currentUser.id}`, JSON.stringify(newPages));
    } else {
      localStorage.setItem('myPages', JSON.stringify(newPages));
    }
  };

  // 페이지 순서 변경 (아래로 이동)
  const movePageDown = (pageId: string) => {
    const currentIndex = pages.findIndex(page => page.id === pageId);
    if (currentIndex >= pages.length - 1) return; // 마지막 페이지는 아래로 이동 불가
    
    const newPages = [...pages];
    [newPages[currentIndex], newPages[currentIndex + 1]] = [newPages[currentIndex + 1], newPages[currentIndex]];
    setPages(newPages);
    
    // localStorage에 즉시 저장
    if (currentUser) {
      localStorage.setItem(`myPages_${currentUser.id}`, JSON.stringify(newPages));
    } else {
      localStorage.setItem('myPages', JSON.stringify(newPages));
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
      setFormData(widget.content || {});
    }
  };

  const saveWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId 
        ? { ...w, content: { ...w.content, ...formData } }
        : w
    ));
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
      case 'profile_card':
        return (
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white text-xs">👤</span>
            </div>
            <div className="text-xs font-semibold text-gray-800 mb-1">김사용자</div>
            <div className="text-xs text-blue-600 mb-2">@username</div>
            <div className="space-y-1">
              <div className="w-full h-4 bg-gray-200 rounded text-xs flex items-center justify-center">📷 Instagram</div>
              <div className="w-full h-4 bg-gray-200 rounded text-xs flex items-center justify-center">📺 YouTube</div>
            </div>
          </div>
        );

      case 'portfolio_header':
        return (
          <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded">
            <div className="text-sm font-bold text-gray-800 mb-1">김사용자</div>
            <div className="text-xs text-blue-600 mb-1">Frontend Developer</div>
            <div className="text-xs text-gray-600">사용자 경험을 중시하는 개발자</div>
          </div>
        );

      case 'project_gallery':
        return (
          <div className="space-y-2">
            <div className="border border-gray-200 rounded p-2">
              <div className="text-xs font-semibold text-gray-800">웹사이트 리뉴얼</div>
              <div className="text-xs text-gray-600">React 기반 웹사이트</div>
              <div className="flex gap-1 mt-1">
                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">React</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">TS</span>
              </div>
            </div>
          </div>
        );

      case 'business_header':
        return (
          <div className="text-center bg-gradient-to-r from-orange-50 to-red-50 p-2 rounded">
            <div className="text-sm font-bold text-gray-800 mb-1">맛있는 카페</div>
            <div className="text-xs text-gray-600">신선한 원두로 만드는 커피</div>
          </div>
        );

      case 'menu_section':
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div>
                <div className="font-semibold text-gray-800">아메리카노</div>
                <div className="text-gray-600">진한 에스프레소</div>
              </div>
              <span className="font-bold text-orange-600">4000원</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div>
                <div className="font-semibold text-gray-800">라떼</div>
                <div className="text-gray-600">부드러운 우유거품</div>
              </div>
              <span className="font-bold text-orange-600">4500원</span>
            </div>
          </div>
        );

      case 'event_header':
        return (
          <div className="text-center bg-gradient-to-r from-pink-50 to-purple-50 p-2 rounded">
            <div className="text-sm font-bold text-gray-800 mb-1">2024 신년 파티</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>📅 2024-01-15</div>
              <div>⏰ 19:00-22:00</div>
              <div>📍 강남구 파티홀</div>
            </div>
          </div>
        );

      case 'countdown':
        return (
          <div className="text-center bg-red-100 rounded p-2">
            <div className="text-lg font-bold text-red-600">D-7</div>
            <p className="text-xs text-red-600">행사까지</p>
          </div>
        );

      case 'rsvp_form':
        return (
          <div className="space-y-1">
            <input type="text" placeholder="이름" className="w-full p-1 border rounded text-xs" disabled />
            <input type="number" placeholder="인원" className="w-full p-1 border rounded text-xs" disabled />
            <textarea placeholder="메시지" className="w-full p-1 border rounded text-xs h-8 resize-none" disabled />
            <button className="w-full p-1 bg-blue-600 text-white rounded text-xs">참석 확인</button>
          </div>
        );

      case 'blog_header':
        return (
          <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 p-2 rounded">
            <div className="text-sm font-bold text-gray-800 mb-1">김사용자의 블로그</div>
            <div className="text-xs text-gray-600">개발과 일상을 기록합니다</div>
          </div>
        );

      case 'post_list':
        return (
          <div className="space-y-2">
            <div className="border border-gray-200 rounded p-2">
              <div className="text-xs font-semibold text-gray-800">React Hooks 완벽 가이드</div>
              <div className="text-xs text-gray-600">React Hooks에 대해 알아보자</div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">2024-01-10</span>
                <div className="flex gap-1">
                  <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">React</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'shop_header':
        return (
          <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 p-2 rounded">
            <div className="text-sm font-bold text-gray-800 mb-1">브랜드 이름</div>
            <div className="text-xs text-gray-600">고품질 상품을 만나보세요</div>
          </div>
        );

      case 'product_grid':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-gray-200 rounded p-1">
              <div className="aspect-square bg-gray-200 rounded mb-1 flex items-center justify-center">
                <span className="text-gray-400 text-xs">📦</span>
              </div>
              <div className="text-xs font-semibold text-gray-800">상품 1</div>
              <div className="text-xs font-bold text-orange-600">29,000원</div>
            </div>
            <div className="border border-gray-200 rounded p-1">
              <div className="aspect-square bg-gray-200 rounded mb-1 flex items-center justify-center">
                <span className="text-gray-400 text-xs">📦</span>
              </div>
              <div className="text-xs font-semibold text-gray-800">상품 2</div>
              <div className="text-xs font-bold text-orange-600">39,000원</div>
            </div>
          </div>
        );

      case 'team_header':
        return (
          <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 p-2 rounded">
            <div className="text-sm font-bold text-gray-800 mb-1">개발 동아리</div>
            <div className="text-xs text-gray-600">함께 성장하는 개발자들의 모임</div>
          </div>
        );

      case 'member_grid':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 border border-gray-200 rounded">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">👤</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-800">김리더</div>
                <div className="text-xs text-blue-600">팀장</div>
              </div>
            </div>
          </div>
        );

      case 'qr_code':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-800 rounded grid grid-cols-4 gap-0.5 p-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-800'} rounded-sm`}></div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-600">QR 코드</p>
          </div>
        );

      case 'contact_buttons':
        return (
          <div className="space-y-1">
            <button className="w-full p-1 bg-blue-600 text-white rounded text-xs">📧 이메일</button>
            <button className="w-full p-1 bg-green-600 text-white rounded text-xs">📱 전화</button>
            <button className="w-full p-1 bg-purple-600 text-white rounded text-xs">💼 LinkedIn</button>
          </div>
        );

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
      type: 'gradient',
      color: '#3B82F6',
      gradient: {
        from: '#3B82F6',
        to: '#8B5CF6',
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

  // 위젯 겹침 감지 함수
  const isWidgetOverlapping = (widget1: Widget, widget2: Widget) => {
    return !(
      widget1.x + widget1.width <= widget2.x ||
      widget2.x + widget2.width <= widget1.x ||
      widget1.y + widget1.height <= widget2.y ||
      widget2.y + widget2.height <= widget1.y
    );
  };

  // 4컬럼 그리드에 위젯 자동 배치 (겹침 방지)
  const getNextAvailablePosition = (width: number, height: number) => {
    const cols = MAIN_COLUMNS; // 메인 컬럼 개수
    
    // 각 메인 컬럼별로 마지막 위젯의 Y 위치 계산
    const columnHeights = Array(cols).fill(0);
    
    widgets.forEach(widget => {
      const col = Math.floor(widget.x / (mainColumnWidth + spacing));
      if (col >= 0 && col < cols) {
        const widgetBottom = widget.y + widget.height + spacing;
        columnHeights[col] = Math.max(columnHeights[col], widgetBottom);
      }
    });
    
    // 가장 낮은 컬럼 찾기
    const minHeight = Math.min(...columnHeights);
    const targetCol = columnHeights.indexOf(minHeight);
    
    // 충돌 감지하여 위치 조정
    let testX = targetCol * (mainColumnWidth + spacing);
    let testY = minHeight;
    
    const testWidget: Widget = {
      id: 'test',
      type: 'bookmark',
      x: testX,
      y: testY,
      width,
      height,
      title: ''
    };
    
    // 다른 위젯과 겹치는지 확인
    let hasCollision = true;
    let attempts = 0;
    
    while (hasCollision && attempts < 10) {
      hasCollision = widgets.some(widget => isWidgetOverlapping(widget, testWidget));
      
      if (hasCollision) {
        testY += cellHeight / 2;
        testWidget.y = testY;
        attempts++;
      }
    }
    
    return {
      x: testX,
      y: testY
    };
  };


  // 위젯 추가
  const addWidget = useCallback((type: string, size: WidgetSize = '1x1', targetColumn?: number) => {
    console.log('addWidget 호출됨:', type, 'size:', size, 'targetColumn:', targetColumn);
    
    // 특정 위젯 타입에 따라 자동 크기 설정
    let widgetSize = size;
    let width, height;
    
    if (type === 'google_search' || type === 'naver_search' ||
        type === 'law_search') {
      // 검색 위젯은 4칸 너비, 225px 높이
      width = (subCellWidth + spacing) * 4 - spacing; // 4칸
      height = 225; // 높이
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
    } else {
      // 기본 크기
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    }
    
    setWidgets(prevWidgets => {
    let position;
    
    if (targetColumn !== undefined) {
      // 특정 메인 컬럼에 추가
      const columnWidgets = prevWidgets.filter(widget => {
        const col = Math.floor(widget.x / (mainColumnWidth + spacing));
        return col === targetColumn;
      });
      
      // 해당 컬럼의 가장 아래 Y 위치 찾기
      const maxY = columnWidgets.length > 0 
        ? Math.max(...columnWidgets.map(w => w.y + w.height))
        : 0;
      
      position = {
        x: targetColumn * (mainColumnWidth + spacing),
        y: maxY + (columnWidgets.length > 0 ? spacing : 0)
      };
    } else {
      // 자동 위치 지정
      position = getNextAvailablePosition(width, height);
    }
    
    const newWidget: Widget = {
      id: Date.now().toString(),
      type: type as any,
      x: position.x,
      y: position.y,
      width,
      height,
      title: allWidgets.find(w => w.type === type)?.name || '새 위젯',
      content: type === 'bookmark' ? { bookmarks: [] } : undefined,
      zIndex: 1, // 모든 새 위젯은 기본 Z-index로 설정
      size: widgetSize // 위젯 사이즈 추가
  };
      
      console.log('🎨 새 위젯 추가:', {
        type,
        size: widgetSize,
        dimensions: { width, height },
        position: { x: position.x, y: position.y }
      });
      return [...prevWidgets, newWidget];
    });
  }, [cellWidth, cellHeight, spacing, getNextAvailablePosition]);

  // 위젯 삭제
  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
    if (selectedWidget === id) {
      setSelectedWidget(null);
    }
  };

  // 페이지 저장
  const savePage = useCallback(async () => {
    console.log('=== 저장하기 버튼 클릭 ===');
    console.log('currentUser:', currentUser);
    console.log('pageTitle:', pageTitle);
    console.log('widgets:', widgets);
    console.log('shareSettings.isPublic:', shareSettings.isPublic);
    
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
        createdAt: new Date().toISOString(),
        isActive: true
      };
      updatedPages = [...pages, newPage];
      targetPageId = newPageId;
      setCurrentPageId(newPageId);
      setPages(updatedPages);
      console.log('새 페이지 생성:', newPageId);
    } else {
      // 기존 페이지 업데이트
      updatedPages = pages.map(page => {
        if (page.id === currentPageId) {
          return {
            ...page,
            title: pageTitle,
            widgets: widgets
          };
        }
        return page;
      });
    }
    
    setPages(updatedPages);
    console.log('updatedPages:', updatedPages);
    
    // localStorage에 저장 (로컬 백업)
    if (currentUser) {
      localStorage.setItem(`myPages_${currentUser.id}`, JSON.stringify(updatedPages));
      // 공개 설정도 함께 저장
      localStorage.setItem(`shareSettings_${currentUser.id}`, JSON.stringify(shareSettings));
      console.log('페이지 저장됨 (사용자:', currentUser.id, '):', updatedPages);
      console.log('공개 설정 저장됨:', shareSettings);
    } else {
      localStorage.setItem('myPages', JSON.stringify(updatedPages));
      // 게스트도 공개 설정 저장
      localStorage.setItem('shareSettings_guest', JSON.stringify(shareSettings));
      console.log('페이지 저장됨 (게스트):', updatedPages);
      console.log('공개 설정 저장됨 (게스트):', shareSettings);
    }
    
    // Firebase에 저장 (로그인한 사용자만)
    console.log('Firebase 저장 조건 체크:', { currentUser: !!currentUser, isPublic: shareSettings.isPublic });
    if (currentUser && shareSettings.isPublic) {
      console.log('→ Firebase 저장 시작');
      try {
        const currentPage = updatedPages.find(p => p.id === targetPageId);
        if (!currentPage) return;

        const pageData = {
          title: pageTitle || '제목 없음',
          description: `${widgets.length}개의 위젯으로 구성된 페이지`,
          authorId: currentUser.id,
          authorName: currentUser.name || '익명',
          authorEmail: currentUser.email,
          category: '일반',
          isPublic: shareSettings.isPublic,
          widgets: widgets.map(w => ({
            id: w.id,
            type: w.type,
            title: w.title,
            x: w.x,
            y: w.y,
            width: w.width,
            height: w.height,
            size: w.size
          })),
          tags: [],
          views: 0,
          likes: 0,
          updatedAt: serverTimestamp()
        };

        // 기존 페이지가 있는지 확인
        const pagesRef = collection(db, 'userPages');
        const q = query(pagesRef, where('authorId', '==', currentUser.id), where('title', '==', pageTitle));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          // 기존 페이지 업데이트
          const docRef = doc(db, 'userPages', snapshot.docs[0].id);
          await updateDoc(docRef, {
            ...pageData,
            updatedAt: serverTimestamp()
          });
          console.log('Firebase 페이지 업데이트 완료');
        } else {
          // 새 페이지 생성 (처음 저장할 때만)
          await addDoc(pagesRef, {
            ...pageData,
            createdAt: serverTimestamp()
          });
          console.log('Firebase 새 페이지 생성 완료');
        }
        console.log('→ Firebase 저장 완료!');
      } catch (error) {
        console.error('Firebase 저장 실패:', error);
        // Firebase 저장 실패해도 로컬에는 저장되었으므로 계속 진행
      }
    } else {
      console.log('→ Firebase 저장 조건 미충족 (로그인 안됨 또는 비공개 설정)');
    }
    
    // 성공 메시지
    const message = document.createElement('div');
    message.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[10000]';
    if (currentUser && shareSettings.isPublic) {
      message.textContent = '✓ 저장 및 공개되었습니다 (메인페이지에 표시됨)';
    } else if (currentUser) {
      message.textContent = '✓ 저장되었습니다 (비공개)';
    } else {
      message.textContent = '✓ 저장되었습니다 (게스트)';
    }
    document.body.appendChild(message);
    setTimeout(() => {
      message.remove();
    }, 3000);
  }, [pages, currentPageId, pageTitle, widgets, currentUser, shareSettings.isPublic]);

  // 위젯 변경 시 자동 저장 (localStorage에만 저장, Firebase는 수동 저장 버튼으로만)
  useEffect(() => {
    // 초기 로드 시에는 저장하지 않음
    if (widgets.length === 0) return;
    
    const autoSave = () => {
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
      
      // localStorage에만 자동 저장 (조용히)
      if (currentUser) {
        localStorage.setItem(`myPages_${currentUser.id}`, JSON.stringify(updatedPages));
      } else {
        localStorage.setItem('myPages', JSON.stringify(updatedPages));
      }
    };
    
    // 디바운스를 위해 타이머 설정 (1초 후 저장)
    const timer = setTimeout(autoSave, 1000);
    
    return () => clearTimeout(timer);
  }, [widgets, pages, currentPageId, pageTitle, currentUser]);

  // 위젯 업데이트
  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    setWidgets(prevWidgets => prevWidgets.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

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

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedWidget) return;

    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const rawX = e.clientX - canvasRect.left - dragOffset.x;
    const rawY = e.clientY - canvasRect.top - dragOffset.y;

    // 그리드 스냅핑 (8개의 메인 컬럼 그리드)
    const targetCol = Math.max(0, Math.min(7, Math.floor(rawX / (mainColumnWidth + spacing))));
    let newX = targetCol * (mainColumnWidth + spacing);
    let newY = Math.round(rawY / cellHeight) * cellHeight;

    // 경계 체크
    newX = Math.max(0, Math.min(newX, 7 * (mainColumnWidth + spacing)));
    newY = Math.max(0, newY);

    // 드래그 중인 위젯 위치 업데이트
    setWidgets(prevWidgets => 
      prevWidgets.map(w => 
        w.id === draggedWidget ? { ...w, x: newX, y: newY } : w
      )
    );
  };

  // 드래그 종료
  const handleMouseUp = () => {
    if (draggedWidget) {
      // 드래그 종료 시 충돌 처리 (같은 컬럼 내에서만)
      const draggedWidgetData = widgets.find(w => w.id === draggedWidget);
      if (draggedWidgetData) {
        // 드래그한 위젯이 속한 컬럼 찾기
        const draggedCol = Math.floor(draggedWidgetData.x / (mainColumnWidth + spacing));
        
        // 같은 컬럼 내의 충돌하는 위젯만 찾기
        const collidingWidgets = widgets.filter(w => {
          if (w.id === draggedWidget) return false;
          const widgetCol = Math.floor(w.x / (mainColumnWidth + spacing));
          return widgetCol === draggedCol && isWidgetOverlapping(draggedWidgetData, w);
        });

        if (collidingWidgets.length > 0) {
          // 충돌하는 위젯들과 그 아래 모든 위젯들을 아래로 이동
          const draggedBottom = draggedWidgetData.y + draggedWidgetData.height;
          
          // 가장 위에 있는 충돌 위젯의 위치를 기준으로 이동 거리 계산
          const topCollidingWidget = collidingWidgets.reduce((top, current) => 
            current.y < top.y ? current : top
          );
          
          const moveDistance = draggedBottom + spacing - topCollidingWidget.y;
          
          // 같은 컬럼 내에서만 충돌하는 위젯과 그 아래 모든 위젯들을 이동
          setWidgets(widgets.map(w => {
            const widgetCol = Math.floor(w.x / (mainColumnWidth + spacing));
            if (widgetCol === draggedCol && w.y >= topCollidingWidget.y && w.id !== draggedWidget) {
              return { ...w, y: w.y + moveDistance };
            }
            return w;
          }));
        }
      }
    }

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

  // 암호화폐 가격 시뮬레이션
  useEffect(() => {
    const cryptoTimer = setInterval(() => {
      setCryptoPrices(prev => ({
        bitcoin: { 
          price: prev.bitcoin.price + (Math.random() - 0.5) * 100000, 
          change: (Math.random() - 0.5) * 5 
        },
        ethereum: { 
          price: prev.ethereum.price + (Math.random() - 0.5) * 10000, 
          change: (Math.random() - 0.5) * 5 
        },
        solana: { 
          price: prev.solana.price + (Math.random() - 0.5) * 1000, 
          change: (Math.random() - 0.5) * 5 
        }
      }));
    }, 5000);

    return () => clearInterval(cryptoTimer);
  }, []);

  // 새 창에서 위젯 추가 메시지 수신
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ADD_WIDGET') {
        console.log('메시지 수신:', event.data.widgetType, 'size:', event.data.size);
        const targetCol = (window as any).targetColumn;
        addWidget(event.data.widgetType, event.data.size || '1x1', targetCol);
        // 사용 후 초기화
        (window as any).targetColumn = undefined;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      console.log('이벤트 리스너 제거');
      window.removeEventListener('message', handleMessage);
    };
  }, [addWidget]);

  // 각 컬럼의 마지막 위젯과 컬럼 하단 여백에 마우스 오버 시 위젯 추가 기능
  const getColumnLastWidget = (columnIndex: number) => {
    return getColumnLastWidgetUtil(widgets, columnIndex, mainColumnWidth, spacing);
  };

  const getColumnBottomY = (columnIndex: number) => {
    return getColumnBottomYUtil(widgets, columnIndex, mainColumnWidth, spacing);
  };

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
        let newX = e.clientX - canvasRect.left - dragOffset.x;
        let newY = e.clientY - canvasRect.top - dragOffset.y;

        // 그리드 스냅핑 (8컬럼 그리드)
        const targetCol = Math.floor(newX / (cellWidth + spacing));
        newX = targetCol * (cellWidth + spacing);
        newY = Math.round(newY / cellHeight) * cellHeight;

        // 경계 체크
        newX = Math.max(0, Math.min(newX, 7 * (cellWidth + spacing))); // 8컬럼이므로 0~7
        newY = Math.max(0, newY);

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
  }, [draggedWidget, dragOffset, cellWidth, cellHeight, spacing]);

  // 위젯 렌더링
  const renderWidget = (widget: Widget) => {
    const WidgetIcon = allWidgets.find(w => w.type === widget.type)?.icon || Grid;
    const isSelected = selectedWidget === widget.id;
    const isDragging = draggedWidget === widget.id;

    return (
      <div
        className={`relative h-full overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200 ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
        } ${isDragging ? 'opacity-75' : ''} ${
          dragOverWidget === widget.id && draggedWidget !== widget.id ? 'ring-2 ring-green-500 bg-green-50' : ''
        }`}
        style={{
          zIndex: isDragging ? 10 : isSelected ? 5 : 1
        }}
        onClick={() => selectWidget(widget.id)}
        onMouseEnter={() => {
          if (isReordering && draggedWidget && draggedWidget !== widget.id) {
            setDragOverWidget(widget.id);
          }
        }}
        onMouseLeave={() => {
          if (isReordering) {
            setDragOverWidget(null);
          }
        }}
        onMouseUp={() => {
          if (isReordering && draggedWidget && dragOverWidget === widget.id) {
            reorderWidgets(draggedWidget, widget.id);
          }
        }}
      >
        {/* 위젯 헤더 */}
        <div 
          className="p-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-move group"
          onMouseDown={(e) => handleMouseDown(e, widget.id)}
        >
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-medium text-gray-800">{widget.title}</span>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0 hover:bg-blue-100"
              onClick={(e) => {
                e.stopPropagation();
                editWidget(widget.id);
              }}
              title="위젯 편집"
            >
              <Edit className="w-3 h-3 text-blue-600" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation();
                removeWidget(widget.id);
              }}
              title="위젯 삭제"
            >
              <X className="w-3 h-3 text-red-600" />
            </Button>
          </div>
        </div>

        {/* 위젯 콘텐츠 */}
        <div className="p-3 h-full bg-transparent">
          {renderWidgetContent(widget)}
        </div>

      </div>
    );
  };

  // 위젯 콘텐츠 렌더링
  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'bookmark':
        return <BookmarkWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'weather':
        return <WeatherWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'weather_small':
        return <WeatherSmallWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'weather_medium':
        return <WeatherMediumWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'todo':
        return <TodoWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'stats':
        return (
          <div className="space-y-3">
            {(widget.content?.stats || []).map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        );

      case 'crypto':
        return (
          <div className="space-y-2">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">₿ 0.001234</div>
              <div className="text-xs text-green-600">+2.34%</div>
            </div>
            <div className="text-xs text-gray-600 text-center">비트코인</div>
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

      case 'calculator':
        return <CalculatorWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

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

      case 'music':
        return <MusicWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'calendar':
        return (
          <div className="space-y-2">
            <div className="text-center mb-3">
              <div className="text-lg font-bold text-gray-800">
                {new Date().getDate()}
              </div>
              <div className="text-xs text-gray-600">
                {new Date().toLocaleDateString('ko-KR', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="space-y-1">
              {(widget.content?.events || [
                { id: '1', title: '팀 미팅', time: '10:00', color: 'bg-blue-100' },
                { id: '2', title: '점심 약속', time: '12:30', color: 'bg-green-100' },
                { id: '3', title: '프로젝트 마감', time: '18:00', color: 'bg-red-100' }
              ]).map((event: any) => (
                <div key={event.id} className={`p-1 rounded text-xs ${event.color || 'bg-gray-100'}`}>
                  <div className="font-medium text-gray-800 truncate">{event.title}</div>
                  <div className="text-gray-600">{event.time}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'timer':
        return <TimerWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'email':
        return (
          <div className="p-4">
            <div className="space-y-3">
              {widget.content.emails?.map((email: any) => (
                <div key={email.id} className={`p-2 rounded-lg ${email.unread ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-800">{email.from}</span>
                    <span className="text-xs text-gray-500">{email.time}</span>
                  </div>
                  <div className="text-xs text-gray-700 truncate">{email.subject}</div>
                  {email.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
                </div>
              ))}
            </div>
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

      case 'meeting':
        return (
          <div className="p-4">
            <div className="space-y-3">
              {widget.content.meetings?.map((meeting: any) => (
                <div key={meeting.id} className={`p-2 rounded-lg ${meeting.status === 'reserved' ? 'bg-red-50 border-l-4 border-red-400' : 'bg-green-50 border-l-4 border-green-400'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-800">{meeting.room}</span>
                    <span className="text-xs text-gray-500">{meeting.time}</span>
                  </div>
                  <div className="text-xs text-gray-700">{meeting.title}</div>
                  <div className={`text-xs mt-1 ${meeting.status === 'reserved' ? 'text-red-600' : 'text-green-600'}`}>
                    {meeting.status === 'reserved' ? '예약됨' : '사용 가능'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'expense':
        return (
          <div className="p-4">
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-800">오늘 지출</div>
              <div className="text-lg font-bold text-red-600">₩{widget.content.total?.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              {widget.content.expenses?.map((expense: any) => (
                <div key={expense.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">{expense.category}</span>
                    <span className="text-gray-500">-</span>
                    <span className="text-gray-700">{expense.memo}</span>
                  </div>
                  <span className="text-red-600 font-medium">₩{expense.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'converter':
        return (
          <div className="p-4">
            <div className="space-y-3">
              {widget.content.conversions?.map((conversion: any) => (
                <div key={conversion.from} className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-800">{conversion.from}</span>
                    <span className="text-xs text-gray-500">→</span>
                    <span className="text-xs font-medium text-gray-800">{conversion.to}</span>
                  </div>
                  <div className="text-sm font-bold text-blue-600">{conversion.rate.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'note':
        return (
          <div className="p-4">
            <div className="space-y-2">
              {widget.content.notes?.map((note: any) => (
                <div key={note.id} className={`p-2 rounded-lg ${note.pinned ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{note.time}</span>
                    {note.pinned && <span className="text-xs text-yellow-600">📌</span>}
                  </div>
                  <div className="text-xs text-gray-700">{note.text}</div>
                </div>
              ))}
            </div>
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

      case 'sports':
        return (
          <div className="p-4">
            <div className="space-y-3">
              {widget.content.news?.map((news: any) => (
                <div key={news.id} className="border-b border-gray-200 pb-2 last:border-b-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-blue-600 font-medium">{news.league}</span>
                    <span className="text-xs text-gray-500">{news.time}</span>
                  </div>
                  <div className="text-sm text-gray-800 leading-tight">{news.title}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile_card':
        return (
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl text-white">👤</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{widget.content.name}</h3>
                <p className="text-sm text-blue-600 mb-1">{widget.content.nickname}</p>
                <p className="text-sm text-gray-600">{widget.content.bio}</p>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-3">
              {widget.content.socialLinks?.map((link: any, index: number) => (
                <button
                  key={index}
                  className="flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                  onClick={() => window.open(link.url, '_blank')}
                >
                  <span className="text-base">{link.icon}</span>
                  <span className="font-medium">{link.platform}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'qr_code':
        return (
          <div className="p-2 text-center h-full flex flex-col">
            <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center flex-shrink-0">
              <div className="w-16 h-16 bg-gray-800 rounded grid grid-cols-6 gap-0.5 p-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-800'} rounded-sm`}></div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-600">QR 코드</p>
          </div>
        );

      case 'portfolio_header':
        return (
          <div className="p-4 text-center bg-gradient-to-r from-blue-50 to-purple-50 h-full flex flex-col justify-center">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{widget.content.name}</h2>
            <p className="text-sm text-blue-600 mb-2">{widget.content.title}</p>
            <p className="text-xs text-gray-600">{widget.content.bio}</p>
          </div>
        );

      case 'project_gallery':
        return (
          <div className="p-3 h-full overflow-y-auto">
            <div className="space-y-3">
              {widget.content.projects?.map((project: any) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-sm text-gray-800 mb-2 truncate">{project.title}</h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.tools?.slice(0, 3).map((tool: string, index: number) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact_buttons':
        return (
          <div className="p-3 h-full flex flex-col justify-center">
            <div className="space-y-2">
              <button className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                📧 이메일
              </button>
              <button className="w-full p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                📱 전화
              </button>
              <button className="w-full p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                💼 LinkedIn
              </button>
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
          <div className="p-4 text-center">
            <div className="bg-red-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 mb-1">D-7</div>
              <p className="text-xs text-red-600">{widget.content.message}</p>
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
            <div className="grid grid-cols-2 gap-4">
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

      case 'google_search':
        return <GoogleSearchWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'naver_search':
        return <NaverSearchWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'law_search':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">⚖️</div>
              <h4 className="font-semibold text-sm text-gray-800">법제처 검색</h4>
            </div>
            <div className="space-y-2">
              <div className="flex gap-1">
                <input 
                  type="text" 
                  placeholder="법령명 검색" 
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const query = e.currentTarget.value;
                      if (query) {
                        window.open(`https://www.law.go.kr/LSW/lsInfoP.do?efYd=20240101&lsiSeq=000000&chrClsCd=010202&urlMode=lsInfoP&viewCls=lsInfoP&ancYnChk=0#0000`, '_blank');
                      }
                    }
                  }}
                />
              </div>
              <Button 
                size="sm" 
                className="w-full h-8 text-xs bg-purple-500 hover:bg-purple-600"
                onClick={() => window.open('https://www.law.go.kr', '_blank')}
              >
                법제처 바로가기
              </Button>
            </div>
          </div>
        );


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

      case 'colorpicker':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-semibold text-sm text-gray-800">컬러 팔레트</h4>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'].map((color, index) => (
                <div 
                  key={index}
                  className="w-8 h-8 rounded cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    navigator.clipboard.writeText(color);
                    alert(`색상 ${color}이 클립보드에 복사되었습니다!`);
                  }}
                />
              ))}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-8 text-xs"
              onClick={() => {
                const colors = Array.from({ length: 8 }, () => '#' + Math.floor(Math.random()*16777215).toString(16));
                updateWidget(widget.id, { 
                  content: { ...widget.content, colors }
                });
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              새 팔레트 생성
            </Button>
          </div>
        );

      case 'stock_alert':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">📢</div>
              <h4 className="font-semibold text-sm text-gray-800">주식 알림</h4>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">삼성전자</div>
                <div className="text-gray-600">70,000원 도달</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">SK하이닉스</div>
                <div className="text-gray-600">120,000원 도달</div>
              </div>
            </div>
            {isEditMode && (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full h-8 text-xs"
                onClick={() => {
                  const stock = prompt('주식 종목을 입력하세요 (예: 삼성전자, SK하이닉스):');
                  const price = prompt('목표 가격을 입력하세요:');
                  if (stock && price) {
                    updateWidget(widget.id, { 
                      content: { 
                        ...widget.content, 
                        alerts: [...(widget.content?.alerts || []), { stock, price, reached: false }]
                      }
                    });
                  }
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                알림 추가
              </Button>
            )}
          </div>
        );

      case 'economic_calendar':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <h4 className="font-semibold text-sm text-gray-800">경제 캘린더</h4>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">FOMC 회의</div>
                <div className="text-gray-600">12월 15일</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">CPI 발표</div>
                <div className="text-gray-600">12월 10일</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">고용 지표</div>
                <div className="text-gray-600">12월 8일</div>
              </div>
            </div>
          </div>
        );

      case 'english_words':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">📚</div>
              <h4 className="font-semibold text-sm text-gray-800">영어 단어</h4>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="font-bold text-lg mb-1">Serendipity</div>
              <div className="text-sm text-gray-600 mb-2">[serənˈdipəti]</div>
              <div className="text-xs text-gray-700">우연히 좋은 일을 발견하는 것</div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-8 text-xs"
              onClick={() => {
                const words = [
                  { word: 'Serendipity', pronunciation: '[serənˈdipəti]', meaning: '우연히 좋은 일을 발견하는 것' },
                  { word: 'Ephemeral', pronunciation: '[ɪˈfemərəl]', meaning: '순간적인, 덧없는' },
                  { word: 'Resilience', pronunciation: '[rɪˈzɪljəns]', meaning: '회복력, 탄력성' },
                  { word: 'Ubiquitous', pronunciation: '[juˈbɪkwɪtəs]', meaning: '어디에나 있는, 만연한' }
                ];
                const randomWord = words[Math.floor(Math.random() * words.length)];
                updateWidget(widget.id, { 
                  content: { ...widget.content, currentWord: randomWord }
                });
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              새 단어
            </Button>
          </div>
        );

      case 'quote':
        return <QuoteWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">💭</div>
              <h4 className="font-semibold text-sm text-gray-800">명언</h4>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-sm text-gray-700 italic mb-2">
                "성공은 준비된 자에게 찾아오는 기회다."
              </div>
              <div className="text-xs text-gray-500">- 알베르트 아인슈타인</div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-8 text-xs"
              onClick={() => {
                const quotes = [
                  { text: "성공은 준비된 자에게 찾아오는 기회다.", author: "알베르트 아인슈타인" },
                  { text: "꿈을 계속 간직하고 있으면 반드시 실현할 때가 온다.", author: "괴테" },
                  { text: "성공한 사람이 되려고 노력하기보다 가치있는 사람이 되려고 노력하라.", author: "알베르트 아인슈타인" },
                  { text: "오늘 할 수 있는 일에 전력을 다하라.", author: "토마스 에디슨" }
                ];
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                updateWidget(widget.id, { 
                  content: { ...widget.content, currentQuote: randomQuote }
                });
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              새 명언
            </Button>
          </div>
        );


      default:
        return (
          <div className="text-center text-gray-500">
            <div className="text-lg mb-2">{widget.title}</div>
            <div className="text-xs">위젯 내용</div>
          </div>
        );
    }
  };

  // 배경 스타일 생성
  const getBackgroundStyle = () => {
    if (backgroundSettings.type === 'gradient') {
      return {
        background: `linear-gradient(${backgroundSettings.gradient.direction}, ${backgroundSettings.gradient.from}, ${backgroundSettings.gradient.to})`,
        opacity: backgroundSettings.opacity
      };
    } else if (backgroundSettings.type === 'solid') {
      return {
        backgroundColor: backgroundSettings.color,
        opacity: backgroundSettings.opacity
      };
    }
    return {};
  };


  // 기존 그리드 뷰만 사용
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* 상단 툴바 */}
      <div className="sticky top-0 z-[60] bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="w-full px-2 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* URWEBS 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold"
              >
                URWEBS
              </Button>
              
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="text-xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-500 px-1 py-1 focus:outline-none min-w-[300px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setPageTitle(tempTitle);
                          setIsEditingTitle(false);
                          setIsTitleManuallyEdited(true);
                          localStorage.setItem('isTitleManuallyEdited', 'true');
                          // 현재 페이지의 제목도 업데이트
                          setPages(prevPages => {
                            const updatedPages = [...prevPages];
                            const currentPageIndex = updatedPages.findIndex(p => p.id === currentPageId);
                            if (currentPageIndex !== -1) {
                              updatedPages[currentPageIndex].title = tempTitle;
                            }
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
                          const updatedPages = [...prevPages];
                          const currentPageIndex = updatedPages.findIndex(p => p.id === currentPageId);
                          if (currentPageIndex !== -1) {
                            updatedPages[currentPageIndex].title = tempTitle;
                          }
                          return updatedPages;
                        });
                      }}
                    />
                  </div>
                ) : (
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
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 위젯 추가 버튼 */}
              <Button
                variant="default"
                size="sm"
                onClick={openWidgetShop}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                title="위젯 추가"
              >
                <Plus className="w-4 h-4 mr-1" />
                위젯 추가
              </Button>

              {/* 페이지 관리 버튼 */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('페이지 관리 버튼 클릭됨, 현재 상태:', showPageManager);
                  setShowPageManager(!showPageManager);
                  console.log('새로운 상태:', !showPageManager);
                }}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                title="페이지 관리"
              >
                <FileText className="w-4 h-4 mr-1" />
                페이지 ({pages.length})
            </Button>
            
              {/* 비로그인 사용자를 위한 로그인 버튼 */}
              {!currentUser && (
                <Button 
                  variant="default"
                  size="sm"
                  onClick={async () => {
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
                      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
                        console.log('로그인 팝업이 닫혔습니다.');
                      } else {
                        alert('로그인에 실패했습니다. 다시 시도해주세요.');
                      }
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  title="로그인하여 페이지를 저장하고 공유하세요"
                >
                  <User className="w-4 h-4 mr-1" />
                  로그인하여 저장하기
                </Button>
              )}

              {/* 공개/비공개 토글 버튼 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">공개 설정:</span>
                <Button 
                  variant={shareSettings.isPublic ? "default" : "outline"}
                  size="sm"
                  onClick={toggleShare}
                  className={`font-semibold transition-all ${
                    shareSettings.isPublic 
                      ? "bg-green-500 hover:bg-green-600 text-black border-green-500 shadow-md" 
                      : "text-gray-700 hover:text-gray-900 border-gray-500 hover:border-gray-600 bg-gray-100 hover:bg-gray-200"
                  }`}
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
              </div>

              {/* 저장하기 버튼 */}
              <Button 
                variant="default"
                size="sm"
                onClick={savePage}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                title="페이지 저장하기"
              >
                <Save className="w-4 h-4 mr-1" />
                저장하기
              </Button>
            
              {/* 빠른 액션 버튼들 */}
              <div className="flex items-center gap-1">

                <Button 
                  variant="ghost"
                  size="sm"
              onClick={toggleTheme}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title={theme === 'light' ? '다크모드' : '라이트모드'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
            </Button>

            <Button
                  variant="ghost"
                  size="sm"
              onClick={resetToDefault}
                  className="h-8 w-8 p-0 hover:bg-gray-100 text-red-500 hover:text-red-700"
                  title="초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

              </div>
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
                새 페이지
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
                    } catch (error) {
                      console.error('Google 로그인 실패:', error);
                      alert('로그인에 실패했습니다. 다시 시도해주세요.');
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
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">템플릿 선택</h2>
              <p className="text-gray-600">새 페이지에 사용할 템플릿을 선택하세요</p>
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
                              
                              {/* 계산기 위젯 */}
                              {widget.type === 'calculator' && (
                                <div className="space-y-0.5">
                                  <div className="grid grid-cols-3 gap-0.5">
                                    {[1,2,3,4,5,6].map(i => (
                                      <div key={i} className="w-1 h-0.5 bg-gray-200 rounded"></div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* 기본 위젯 (기타) */}
                              {!['bookmark', 'social', 'qr_code', 'github_repo', 'contact', 'stats', 'todo', 'stock', 'news', 'weather', 'calculator'].includes(widget.type) && (
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
      <div className="w-full px-2 py-4 pb-24">



        {/* 위젯 캔버스 */}
        <div 
          ref={canvasRef}
          className={`relative min-h-[600px] rounded-xl shadow-lg border-2 transition-all duration-200 ${
            isEditMode 
              ? 'bg-blue-50/30 backdrop-blur-sm border-dashed border-blue-300' 
              : 'bg-white/30 backdrop-blur-sm border-dashed border-gray-200'
          }`}
          style={{ 
            position: 'relative',
            backgroundImage: layoutSettings.showGrid && isEditMode ? `
              linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
            ` : 'none',
            backgroundSize: `${layoutSettings.gridSize}px ${layoutSettings.gridSize}px`
          }}
          onMouseMove={handleMouseMove}
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

          {widgets.map((widget) => {
            // 현재 위젯이 속한 컬럼 찾기
            const col = Math.floor(widget.x / (mainColumnWidth + spacing));
            const lastWidgetInColumn = getColumnLastWidget(col);
            const isLastInColumn = lastWidgetInColumn?.id === widget.id;

            return (
              <div key={widget.id}>
                <div
                  className={`absolute bg-white rounded-lg shadow-md transition-all duration-200 ${
                    isEditMode ? 'cursor-move' : ''
                  }`}
                  style={{
                    left: widget.x,
                    top: widget.y,
                    width: widget.width,
                    height: widget.height,
                    zIndex: widget.zIndex || 1,
                    transform: draggedWidget === widget.id ? 'rotate(2deg)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (isLastInColumn) {
                      // 이미 버튼이 있으면 생성하지 않음
                      if (document.getElementById(`add-widget-btn-${widget.id}`)) return;
                      
                      // 마지막 위젯에 마우스 오버 시 아래에 위젯 추가 버튼 표시
                      const addButton = document.createElement('div');
                      addButton.id = `add-widget-btn-${widget.id}`;
                      addButton.className = 'absolute bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 shadow-lg cursor-pointer transition-all z-50 flex items-center justify-center gap-2';
                      addButton.style.left = `${widget.x}px`;
                      addButton.style.top = `${widget.y + widget.height + 2}px`; // spacing 줄임
                      addButton.style.width = `${widget.width}px`;
                      addButton.style.height = '40px'; // 명시적 높이
                      addButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><span class="text-sm font-medium">위젯 추가</span>';
                      addButton.onclick = openWidgetShop;
                      
                      // 버튼과 위젯 사이 연결 영역 생성 (보이지 않는 영역)
                      const connector = document.createElement('div');
                      connector.id = `connector-${widget.id}`;
                      connector.className = 'absolute z-40';
                      connector.style.left = `${widget.x}px`;
                      connector.style.top = `${widget.y + widget.height}px`;
                      connector.style.width = `${widget.width}px`;
                      connector.style.height = '10px'; // 위젯과 버튼 사이 공간
                      
                      // 연결 영역에도 이벤트 추가
                      connector.onmouseenter = () => {
                        // 연결 영역 위에서도 버튼 유지
                      };
                      
                      connector.onmouseleave = () => {
                        setTimeout(() => {
                          const btn = document.getElementById(`add-widget-btn-${widget.id}`);
                          const conn = document.getElementById(`connector-${widget.id}`);
                          if (btn && !btn.matches(':hover')) {
                            btn.remove();
                          }
                          if (conn) {
                            conn.remove();
                          }
                        }, 300);
                      };
                      
                      // 버튼에 마우스가 올라가 있을 때도 유지
                      addButton.onmouseenter = () => {
                        // 버튼 위에 있을 때는 계속 표시
                      };
                      
                      addButton.onmouseleave = () => {
                        setTimeout(() => {
                          const btn = document.getElementById(`add-widget-btn-${widget.id}`);
                          const conn = document.getElementById(`connector-${widget.id}`);
                          if (btn) btn.remove();
                          if (conn) conn.remove();
                        }, 300);
                      };
                      
                      const canvas = canvasRef.current;
                      if (canvas) {
                        canvas.appendChild(connector);
                        canvas.appendChild(addButton);
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isLastInColumn) {
                      // 마우스가 버튼으로 가는지 확인하기 위해 지연
                      setTimeout(() => {
                        const addButton = document.getElementById(`add-widget-btn-${widget.id}`);
                        const connector = document.getElementById(`connector-${widget.id}`);
                        if (addButton && connector) {
                          // 버튼이나 연결 영역에 마우스가 없으면 제거
                          const isHoveringButton = addButton.matches(':hover');
                          const isHoveringConnector = connector.matches(':hover');
                          if (!isHoveringButton && !isHoveringConnector) {
                            addButton.remove();
                            connector.remove();
                          }
                        }
                      }, 300);
                    }
                  }}
                >
                  {renderWidget(widget)}
                </div>
              </div>
            );
          })}

        </div>



        {/* 위젯 선택 패널 */}
        <WidgetPanel 
          isOpen={showWidgetModal}
          onClose={() => setShowWidgetModal(false)}
          onAddWidget={(type) => addWidget(type)}
        />

        {/* 기존 새 창 코드 제거 */}
        {false && showWidgetModal && (
          <script>
            {(() => {
              const widgetShopWindow = window.open('', 'widgetShop', 'width=1200,height=800,scrollbars=yes,resizable=yes');
              if (widgetShopWindow) {
                widgetShopWindow.document.write(`
                  <!DOCTYPE html>
                  <html lang="ko">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>위젯 상점</title>
                    <script src="https://cdn.tailwindcss.com"><\/script>
                    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"><\/script>
                  </head>
                  <body class="bg-gray-100">
                    <div class="min-h-screen flex">
                      <!-- 왼쪽 카테고리 사이드바 -->
                      <div class="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
                        <div class="mb-6">
                          <h3 class="text-xl font-bold text-gray-900 flex items-center">
                            <span class="text-green-600 mr-2">+</span>
                            위젯 추가
                </h3>
                          <p class="text-sm text-gray-600 mt-2">카테고리를 선택하세요</p>
              </div>

                        <div class="space-y-2" id="category-list">
                          <!-- 카테고리 버튼들이 여기에 동적으로 생성됩니다 -->
                      </div>
              </div>

                      <!-- 오른쪽 위젯 목록 -->
                      <div class="flex-1 flex flex-col">
                        <div class="bg-white shadow-sm border-b p-6">
                          <div class="flex items-center justify-between">
                            <div>
                              <h1 class="text-2xl font-bold text-gray-900" id="category-title">카테고리를 선택하세요</h1>
                              <p class="text-sm text-gray-600 mt-1">원하는 위젯을 미리보고 선택하여 추가하세요</p>
            </div>
                            <button onclick="window.close()" class="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
                        </div>
                        
                        <div class="flex-1 overflow-y-auto p-6">
                          <div id="widget-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div class="col-span-full flex items-center justify-center h-64">
                              <div class="text-center text-gray-500">
                                <div class="text-4xl mb-4">📦</div>
                                <p class="text-lg font-medium">카테고리를 선택해주세요</p>
                                <p class="text-sm">왼쪽에서 원하는 카테고리를 클릭하세요</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
              </div>

                    <script>
                      // 위젯 카테고리 데이터
                      const widgetCategories = {
                        productivity: {
                          name: '생산성',
                          widgets: [
                            { type: 'todo', name: '할 일', icon: '✓', description: '할 일 목록 관리' },
                            { type: 'goal', name: '목표', icon: '🎯', description: '목표 설정 및 추적' },
                            { type: 'habit', name: '습관', icon: '🔄', description: '습관 트래킹' },
                            { type: 'timer', name: '타이머', icon: '⏰', description: '포모도로 타이머' },
                            { type: 'reminder', name: '알림', icon: '🔔', description: '중요한 알림' },
                            { type: 'quicknote', name: '빠른 메모', icon: '📝', description: '즉석 메모 작성' }
                          ]
                        },
                        finance: {
                          name: '금융',
                          widgets: [
                            { type: 'stock', name: '주식', icon: '📈', description: '주식 시세 확인' },
                            { type: 'crypto', name: '암호화폐', icon: '💰', description: '코인 가격 정보' },
                            { type: 'expense', name: '가계부', icon: '📊', description: '지출 관리' },
                            { type: 'calculator', name: '계산기', icon: '🧮', description: '간편 계산기' },
                            { type: 'exchange', name: '환율', icon: '💱', description: '실시간 환율 정보' },
                            { type: 'stock_alert', name: '주식 알림', icon: '📢', description: '주식 시세 알림' },
                            { type: 'economic_calendar', name: '경제 캘린더', icon: '📅', description: 'FOMC, CPI 발표 일정' }
                          ]
                        },
                        communication: {
                          name: '소통',
                          widgets: [
                            { type: 'email', name: '이메일', icon: '📧', description: '메일 확인' },
                            { type: 'mail_services', name: '메일 서비스', icon: '📮', description: '메일 서비스 바로가기' },
                            { type: 'social', name: '소셜미디어', icon: '👥', description: 'SNS 관리' },
                            { type: 'github', name: 'GitHub', icon: '🐙', description: '코드 저장소' },
                            { type: 'phone', name: '연락처', icon: '📞', description: '빠른 연락처' },
                            { type: 'github_repo', name: 'GitHub Repo', icon: '📂', description: 'GitHub 저장소 상태' }
                          ]
                        },
                        media: {
                          name: '미디어',
                          widgets: [
                            { type: 'music', name: '음악', icon: '🎵', description: '음악 플레이어' },
                            { type: 'video', name: '동영상', icon: '🎬', description: '비디오 콘텐츠' },
                            { type: 'photo', name: '사진', icon: '📸', description: '이미지 갤러리' },
                            { type: 'quote', name: '명언', icon: '💭', description: '영감을 주는 명언' }
                          ]
                        },
                        information: {
                          name: '정보',
                          widgets: [
                            { type: 'weather', name: '날씨', icon: '☁️', description: '날씨 정보' },
                            { type: 'weather_small', name: '날씨 (소형)', icon: '🌤️', description: '간단한 날씨 정보' },
                            { type: 'weather_medium', name: '날씨 (중형)', icon: '⛅', description: '중간 크기 날씨 정보' },
                            { type: 'news', name: '뉴스', icon: '🌐', description: '최신 뉴스' },
                            { type: 'rss', name: 'RSS', icon: '📡', description: 'RSS 피드' },
                            { type: 'google_search', name: '구글 검색', icon: '🔍', description: '구글 검색' },
                            { type: 'naver_search', name: '네이버 검색', icon: '🔍', description: '네이버 검색' },
                            { type: 'law_search', name: '법제처 검색', icon: '⚖️', description: '법령 검색' },
                          ]
                        },
                        system: {
                          name: '시스템',
                          widgets: [
                            { type: 'calendar', name: '캘린더', icon: '📅', description: '일정 관리' },
                            { type: 'location', name: '위치', icon: '📍', description: '현재 위치' },
                            { type: 'battery', name: '배터리', icon: '🔋', description: '배터리 상태' },
                            { type: 'network', name: '네트워크', icon: '📶', description: '인터넷 상태' },
                            { type: 'volume', name: '볼륨', icon: '🔊', description: '소리 조절' }
                          ]
                        },
                        tools: {
                          name: '도구',
                          widgets: [
                            { type: 'bookmark', name: '즐겨찾기', icon: '🔗', description: '자주 사용하는 링크' },
                            { type: 'stats', name: '통계', icon: '📊', description: '데이터 시각화' },
                            { type: 'converter', name: '단위 변환', icon: '🧮', description: '단위 변환기' },
                            { type: 'colorpicker', name: '컬러 팔레트', icon: '🎨', description: '색상 생성기' },
                            { type: 'qr', name: 'QR 코드', icon: '📱', description: 'QR 코드 생성' },
                            { type: 'password', name: '비밀번호', icon: '🔒', description: '비밀번호 생성' }
                          ]
                        },
                        education: {
                          name: '교육',
                          widgets: [
                            { type: 'english_words', name: '영어 단어', icon: '📚', description: '영어 단어 학습' },
                            { type: 'quote', name: '명언', icon: '💭', description: '영감을 주는 명언' }
                          ]
                        }
                      };
                      
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
                      
                      function renderCategories() {
                        const categoryList = document.getElementById('category-list');
                        categoryList.innerHTML = Object.entries(widgetCategories).map(([categoryKey, category]) => \`
                          <button
                            class="w-full text-left p-3 rounded-lg transition-colors bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 category-btn"
                            data-category="\${categoryKey}"
                            onclick="selectCategory('\${categoryKey}')"
                          >
                            <div class="flex items-center gap-3">
                              <div class="text-lg">\${getCategoryIcon(categoryKey)}</div>
                              <div>
                                <div class="font-medium text-sm">\${category.name}</div>
                                <div class="text-xs text-gray-500">\${category.widgets.length}개 위젯</div>
                            </div>
                    </div>
                          </button>
                        \`).join('');
                      }
                      
                      function selectCategory(categoryKey) {
                        selectedCategory = categoryKey;
                        const category = widgetCategories[categoryKey];
                        
                        // 카테고리 버튼 스타일 업데이트
                        document.querySelectorAll('.category-btn').forEach(btn => {
                          btn.classList.remove('bg-green-100', 'text-green-800', 'border-green-200');
                          btn.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
                        });
                        
                        const selectedBtn = document.querySelector(\`[data-category="\${categoryKey}"]\`);
                        selectedBtn.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
                        selectedBtn.classList.add('bg-green-100', 'text-green-800', 'border-green-200');
                        
                        // 제목 업데이트
                        document.getElementById('category-title').textContent = category.name;
                        
                        // 위젯 그리드 업데이트
                        const grid = document.getElementById('widget-grid');
                        grid.innerHTML = category.widgets.map(widget => \`
                          <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer" onclick="showSizeOptions('\${widget.type}')">
                            <div class="text-center">
                              <div class="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                <span class="text-2xl">\${widget.icon}</span>
                  </div>
                              <h3 class="font-semibold text-gray-800 mb-1">\${widget.name}</h3>
                              <p class="text-sm text-gray-500 mb-3">\${widget.description}</p>
                              <button class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                                추가하기
                              </button>
              </div>
            </div>
                        \`).join('');
                      }
                      
                      function addWidget(widgetType, size = '1x1') {
                        window.opener.postMessage({
                          type: 'ADD_WIDGET',
                          widgetType: widgetType,
                          size: size
                        }, '*');
                        window.close();
                      }
                      
                      function showSizeOptions(widgetType) {
                        // weather_small과 weather_medium은 고정 크기로 바로 추가
                        if (widgetType === 'weather_small') {
                          addWidget(widgetType, '4x1');
                          return;
                        }
                        if (widgetType === 'weather_medium') {
                          addWidget(widgetType, '4x2');
                          return;
                        }
                        
                        const sizeOptions = document.createElement('div');
                        sizeOptions.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
                        sizeOptions.innerHTML = \`
                          <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                            <h3 class="text-lg font-bold text-gray-900 mb-4">위젯 크기 선택</h3>
                            <div class="grid grid-cols-3 gap-3 mb-6">
                              <button onclick="addWidget('\${widgetType}', '1x1')" class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                                <div class="w-full h-8 bg-blue-100 rounded mb-2"></div>
                                <span class="text-sm font-medium">1x1</span>
                              </button>
                              <button onclick="addWidget('\${widgetType}', '1x2')" class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                                <div class="w-full h-16 bg-blue-100 rounded mb-2"></div>
                                <span class="text-sm font-medium">1x2</span>
                              </button>
                              <button onclick="addWidget('\${widgetType}', '2x1')" class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                                <div class="w-full h-8 bg-blue-100 rounded mb-2"></div>
                                <span class="text-sm font-medium">2x1</span>
                              </button>
                              <button onclick="addWidget('\${widgetType}', '3x1')" class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                                <div class="w-full h-8 bg-blue-100 rounded mb-2"></div>
                                <span class="text-sm font-medium">3x1</span>
                              </button>
                              <button onclick="addWidget('\${widgetType}', '4x1')" class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                                <div class="w-full h-8 bg-blue-100 rounded mb-2"></div>
                                <span class="text-sm font-medium">4x1</span>
                              </button>
                              <button onclick="addWidget('\${widgetType}', '4x2')" class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                                <div class="w-full h-16 bg-blue-100 rounded mb-2"></div>
                                <span class="text-sm font-medium">4x2</span>
                              </button>
                            </div>
                            <button onclick="this.closest('.fixed').remove()" class="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                              취소
                            </button>
                          </div>
                        \`;
                        document.body.appendChild(sizeOptions);
                      }
                      
                      // 페이지 로드 시 카테고리 렌더링
                      document.addEventListener('DOMContentLoaded', renderCategories);
                    <\/script>
                  </body>
                  </html>
                `);
                widgetShopWindow.document.close();
                setShowWidgetModal(false);
              }
            })()}
          </script>
        )}

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
                    <option value="gradient">그라데이션</option>
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
                
                {backgroundSettings.type === 'gradient' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">시작 색상</label>
                      <input
                        type="color"
                        value={backgroundSettings.gradient.from}
                        onChange={(e) => setBackgroundSettings({
                          ...backgroundSettings, 
                          gradient: {...backgroundSettings.gradient, from: e.target.value}
                        })}
                        className="w-full h-10 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">끝 색상</label>
                      <input
                        type="color"
                        value={backgroundSettings.gradient.to}
                        onChange={(e) => setBackgroundSettings({
                          ...backgroundSettings, 
                          gradient: {...backgroundSettings.gradient, to: e.target.value}
                        })}
                        className="w-full h-10 border rounded"
                      />
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
                  onClick={() => setShowBackgroundModal(false)}
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
                  <div className="grid grid-cols-2 gap-4">
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
                          <div className="grid grid-cols-2 gap-4">
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
                          <div className="grid grid-cols-2 gap-4">
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

                    default:
                      return (
                        <div className="text-center text-gray-500 py-8">
                          <p>이 위젯은 편집할 수 없습니다.</p>
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

    </div>
  );
}
