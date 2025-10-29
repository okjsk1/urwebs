import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { HomePageNew } from './components/HomePageNew';
import { CategoryDetailPageColumns } from './components/CategoryDetailPageColumns';
import { NoticePage } from './components/NoticePage';
import { CommunityPage } from './components/CommunityPage';
import { ContactPage } from './components/ContactPage';
import { MyPage } from './components/MyPage';
import { AdminPage } from './components/AdminPage';
import { TemplateEditorPage } from './components/admin/TemplateEditorPage';
import { AllPagesListPage } from './components/AllPagesListPage';
import { templateService } from './services/templateService';
import DraggableDashboardGrid from './components/DraggableDashboardGrid';
import { renderWidget } from './utils/widgetRenderer';
import { colToX, rowToY, gridWToPx, gridHToPx } from './utils/layoutConfig';
import { allWidgets } from './constants/widgetCategories';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
// Firebase는 config.ts에서 초기화됩니다

// 공개 페이지 뷰어 컴포넌트
function PublicPageViewer() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pageData, setPageData] = useState(() => null as any);
  const [loading, setLoading] = useState(() => true);
  const [error, setError] = useState(() => null as string | null);
  const [isLiked, setIsLiked] = useState(false);
  const [likedBy, setLikedBy] = useState<string[]>([]);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        // 페이지 데이터 즉시 로드 (조회수 증가는 백그라운드)
        const { collection, query, where, getDocs, doc, updateDoc, increment, arrayUnion, arrayRemove } = await import('firebase/firestore');
        const { db } = await import('./firebase/config');
        
        const pagesRef = collection(db, 'userPages');
        const q = query(pagesRef, where('urlId', '==', pageId), where('isPublic', '==', true));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          const pageId_doc = snapshot.docs[0].id;
          setPageData({ id: pageId_doc, ...docData });
          
          // 좋아요 상태 확인
          const likedUsers = docData.likedBy || [];
          setLikedBy(likedUsers);
          if (user && likedUsers.includes(user.uid)) {
            setIsLiked(true);
          }
          
          // 조회수 증가: 백그라운드에서 조용히 시도 (실패해도 무시)
          // 본인이 자신의 페이지를 볼 때는 조회수 증가하지 않음
          setTimeout(async () => {
            try {
              // 본인 페이지인지 확인
              if (user && docData.authorId === user.uid) {
                return; // 본인 페이지면 조회수 증가하지 않음
              }
              
              // 삭제되지 않은 페이지만 조회수 증가
              if (docData.isDeleted) {
                return;
              }
              
              const docRef = doc(db, 'userPages', pageId_doc);
              await updateDoc(docRef, { views: increment(1) });
              setPageData((prev: any) => ({ ...prev, views: (prev.views || 0) + 1 }));
            } catch (e) {
              // 조회수 증가 실패는 조용히 무시
              console.error('조회수 증가 실패:', e);
            }
          }, 100);
          
          setLoading(false);
        } else {
          setError('페이지를 찾을 수 없습니다.');
          setLoading(false);
        }
      } catch (err) {
        console.error('페이지 로드 실패:', err);
        setError('페이지를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };
    
    if (pageId) {
      fetchPage();
    }
  }, [pageId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">페이지를 불러오는 중...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">페이지를 찾을 수 없습니다</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || '존재하지 않거나 비공개된 페이지입니다.'}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 sticky top-0 z-50 shadow-sm">
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{pageData.title}</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">by {pageData.authorName}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* 조회수 - 고급스러운 디자인 */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">조회수</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100">{pageData.views?.toLocaleString() || 0}</span>
              </div>
            </div>
            
            {/* 좋아요 버튼 - 유튜브 스타일 */}
            <button 
              onClick={async () => {
                if (!user) {
                  alert('로그인이 필요합니다.');
                  return;
                }
                
                try {
                  const { doc, updateDoc, arrayUnion, arrayRemove, increment } = await import('firebase/firestore');
                  const { db } = await import('./firebase/config');
                  const docRef = doc(db, 'userPages', pageData.id);
                  
                  if (isLiked) {
                    // 좋아요 취소
                    await updateDoc(docRef, { 
                      likedBy: arrayRemove(user.uid),
                      likes: increment(-1)
                    });
                    setIsLiked(false);
                    setLikedBy(prev => prev.filter(uid => uid !== user.uid));
                    setPageData((prev: any) => ({ ...prev, likes: Math.max(0, (prev.likes || 0) - 1) }));
                  } else {
                    // 좋아요 추가
                    await updateDoc(docRef, { 
                      likedBy: arrayUnion(user.uid),
                      likes: increment(1)
                    });
                    setIsLiked(true);
                    setLikedBy(prev => [...prev, user.uid]);
                    setPageData((prev: any) => ({ ...prev, likes: (prev.likes || 0) + 1 }));
                  }
                } catch (error) {
                  console.error('좋아요 실패:', error);
                  alert('좋아요 처리에 실패했습니다.');
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${
                isLiked 
                  ? 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-300 dark:border-red-700 shadow-md hover:shadow-lg' 
                  : 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
              }`}
            >
              <svg 
                className={`w-6 h-6 transition-all duration-200 ${
                  isLiked 
                    ? 'text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">좋아요</span>
                <span className={`text-base font-bold ${
                  isLiked 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {pageData.likes || 0}
                </span>
              </div>
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              메인으로
            </button>
          </div>
        </div>
      </header>
      
      <main className="w-full p-2 sm:p-3 lg:p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3">
          {pageData.description && !pageData.description.includes('위젯으로 구성된 페이지') && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">{pageData.description}</p>
          )}
          
          {/* 공개보기: 절대 위치 레이아웃 */}
          {Array.isArray(pageData.widgets) && pageData.widgets.length > 0 ? (
            <div 
              className="relative min-h-[800px] w-full"
              style={{
                width: '1819px', // 8칸 * 210px + 7간격 * 17px = 1819px
                height: '1120px', // 높이도 1.4배로 조정
                margin: '0 auto', // 중앙 정렬
              }}
            >
              {pageData.widgets.map((w: any, index: number) => {
                // 위젯 크기 프리셋 (참고 이미지 기준)
                const sizePresets: Record<string, { w: number; h: number }> = {
                  google_search: { w: 2, h: 1 },
                  naver_search: { w: 1, h: 1 },
                  law_search: { w: 1, h: 1 },
                  english_words: { w: 1, h: 2 },
                  weather: { w: 2, h: 3 },
                  bookmark: { w: 1, h: 4 },
                  frequent_sites: { w: 1, h: 4 },
                  quicknote: { w: 1, h: 1 },
                  calendar: { w: 2, h: 3 },
                  todo: { w: 1, h: 1 },
                  // 추가 위젯 타입들
                  map_section: { w: 1, h: 4 },
                  links: { w: 1, h: 2 },
                  memo: { w: 1, h: 1 },
                };
                
                // 절대 위치 계산 (MyPage와 동일하게)
                // 위젯 크기를 1.4배로 조정 (MyPage와 완전 일치)
                const cellWidth = 210; // 150 * 1.4
                const cellHeight = 196; // 140 * 1.4
                const gap = 17; // 12 * 1.4
                
                // 실제 위젯 데이터의 크기 사용 (MyPage와 동일하게)
                const widgetSize = w.gridSize || { w: 1, h: 1 };
                
                // 위젯 데이터의 실제 좌표 확인 및 변환
                console.log(`위젯 ${w.type} 원본 좌표: x=${w.x}, y=${w.y}, gridSize=${JSON.stringify(w.gridSize)}`);
                
                // MyPage에서 저장된 그리드 인덱스를 픽셀로 변환
                const pos = {
                  x: w.x !== undefined ? w.x * (cellWidth + gap) : index * (cellWidth + gap),
                  y: w.y !== undefined ? w.y * (cellHeight + gap) : Math.floor(index / 8) * (cellHeight + gap)
                };
                
                const widgetForRender = {
                  id: w.id,
                  type: w.type,
                  title: w.title || allWidgets.find(widget => widget.type === w.type)?.name || '위젯',
                  content: w.content,
                  variant: w.variant,
                  x: 0,
                  y: 0,
                  width: widgetSize.w,
                  height: widgetSize.h,
                  // 원본 위젯 데이터도 포함
                  ...w
                } as any;
                const left = pos.x;  // 이미 픽셀 단위
                const top = pos.y;   // 이미 픽셀 단위
                const width = widgetSize.w * cellWidth + (widgetSize.w - 1) * gap;
                const height = widgetSize.h * cellHeight + (widgetSize.h - 1) * gap;
                
                console.log(`위젯 ${w.type} (${index}): pos(${pos.x}, ${pos.y}), size(${widgetSize.w}x${widgetSize.h}), left:${left}px, top:${top}px, width:${width}px, height:${height}px`);

                return (
                  <div
                    key={w.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-200 absolute"
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                    }}
                  >
                    {/* 위젯 타이틀 추가 */}
                    <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
                      {widgetForRender.title}
                    </div>
                    <div className="h-full relative" style={{ height: 'calc(100% - 40px)' }}>
                      {(() => {
                        try {
                          const result = renderWidget(widgetForRender);
                          if (!result) {
                            return (
                              <div className="h-full flex items-center justify-center text-yellow-600 text-sm p-4">
                                <div className="text-center">
                                  <div className="text-lg mb-2">⚠️</div>
                                  <div>위젯 내용 없음</div>
                                  <div className="text-xs">{w.type}</div>
                                </div>
                              </div>
                            );
                          }
                          return result;
                        } catch (error) {
                          return (
                            <div className="h-full flex items-center justify-center text-red-500 text-sm p-4">
                              <div className="text-center">
                                <div className="text-lg mb-2">⚠️</div>
                                <div>위젯 렌더링 오류</div>
                                <div className="text-xs">{w.type}</div>
                                <div className="text-xs mt-1">{(error as any).message}</div>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
              이 페이지에 표시할 위젯이 없습니다. 작성자가 아직 저장하지 않았거나, 이전 버전 형식일 수 있어요.
            </div>
          )}
        </div>
      </main>

      {/* 나도 나만의 페이지 만들어보기 버튼 */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[10001] pointer-events-auto">
        <button
          onClick={() => navigate('/mypage')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 flex items-center gap-2 text-base animate-pulse hover:animate-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          나도 나만의 페이지 만들어보기
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// 메인 앱 컴포넌트 (라우터 사용)
function AppContent() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(() => '');
  const [selectedSubCategory, setSelectedSubCategory] = useState(() => '');
  
  // 키보드 단축키 활성화
  useKeyboardShortcuts();

  const handleCategorySelect = (categoryId: string, subCategory?: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(subCategory || '');
  };

  return (
    <AuthProvider>
      <ThemeProvider children={
        <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-gray-950 dark:to-gray-900">
            <Header 
              currentPage="home"
              onNavigateHome={() => navigate('/')}
              onNavigateNotice={() => navigate('/notice')}
              onNavigateCommunity={() => navigate('/community')}
              onNavigateContact={() => navigate('/contact')}
              onNavigateMyPage={() => navigate('/mypage')}
              onNavigateAdminInquiries={() => navigate('/admin')}
            />
            <main>
              <HomePageNew onCategorySelect={handleCategorySelect} />
            </main>
          </div>
        } />

        {/* 공지사항 */}
        <Route path="/notice" element={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-950 dark:to-gray-900">
            <Header 
              currentPage="notice"
              onNavigateHome={() => navigate('/')}
              onNavigateNotice={() => navigate('/notice')}
              onNavigateCommunity={() => navigate('/community')}
              onNavigateContact={() => navigate('/contact')}
              onNavigateMyPage={() => navigate('/mypage')}
              onNavigateAdminInquiries={() => navigate('/admin')}
            />
            <main>
              <NoticePage />
            </main>
          </div>
        } />

        {/* 자유게시판 */}
        <Route path="/community" element={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-950 dark:to-gray-900">
            <Header 
              currentPage="community"
              onNavigateHome={() => navigate('/')}
              onNavigateNotice={() => navigate('/notice')}
              onNavigateCommunity={() => navigate('/community')}
              onNavigateContact={() => navigate('/contact')}
              onNavigateMyPage={() => navigate('/mypage')}
              onNavigateAdminInquiries={() => navigate('/admin')}
            />
            <main>
              <CommunityPage />
            </main>
          </div>
        } />

        {/* 문의하기 */}
        <Route path="/contact" element={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-950 dark:to-gray-900">
            <Header 
              currentPage="contact"
              onNavigateHome={() => navigate('/')}
              onNavigateNotice={() => navigate('/notice')}
              onNavigateCommunity={() => navigate('/community')}
              onNavigateContact={() => navigate('/contact')}
              onNavigateMyPage={() => navigate('/mypage')}
              onNavigateAdminInquiries={() => navigate('/admin')}
            />
            <main>
              <ContactPage />
            </main>
          </div>
        } />

        {/* 나의 페이지 (편집 모드) */}
        <Route path="/mypage" element={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-950 dark:to-gray-900">
            <main>
              <MyPage />
            </main>
          </div>
        } />
        
        {/* 나의 페이지 - 특정 페이지 (편집 모드) */}
        <Route path="/mypage/:pageId" element={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-950 dark:to-gray-900">
            <main>
              <MyPage />
            </main>
          </div>
        } />

        {/* 관리자 페이지 */}
        <Route path="/admin" element={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-950 dark:to-gray-900">
            <Header 
              currentPage="admin-inquiries"
              onNavigateHome={() => navigate('/')}
              onNavigateNotice={() => navigate('/notice')}
              onNavigateCommunity={() => navigate('/community')}
              onNavigateContact={() => navigate('/contact')}
              onNavigateMyPage={() => navigate('/mypage')}
              onNavigateAdminInquiries={() => navigate('/admin')}
            />
            <main>
              <AdminPage onNavigateTemplateEdit={(templateData) => {
                console.log('템플릿 편집 페이지로 이동:', templateData);
                if (templateData) {
                  sessionStorage.setItem('templateEditData', JSON.stringify(templateData));
                  console.log('sessionStorage에 저장됨:', templateData);
                }
                navigate('/template-edit');
              }} />
            </main>
          </div>
        } />

        {/* 템플릿 편집 페이지 */}
        <Route path="/template-edit" element={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-950 dark:to-gray-900">
            <main>
              <TemplateEditorPage 
                onBack={() => navigate('/')}
                onSave={async (templateData) => {
                  try {
                    const templateId = (() => {
                      const data = sessionStorage.getItem('templateEditData');
                      if (data) {
                        const parsed = JSON.parse(data);
                        return parsed.id;
                      }
                      return undefined;
                    })();

                    if (templateId) {
                      // 기존 템플릿 수정
                      await templateService.updateTemplate(templateId, {
                        ...templateData,
                        widgets: templateData.widgets.map(w => ({
                          id: w.id,
                          type: w.type,
                          x: w.x,
                          y: w.y,
                          width: w.width,
                          height: w.height,
                          title: w.title,
                          content: w.content,
                          zIndex: w.zIndex || 1,
                          size: w.size || '1x1'
                        })),
                        widgetCount: templateData.widgets.length,
                        preview: templateData.widgets.map(w => w.type)
                      });
                      alert('템플릿이 수정되었습니다!');
                    } else {
                      // 새 템플릿 생성
                      await templateService.createTemplate({
                        ...templateData,
                        widgets: templateData.widgets.map(w => ({
                          id: w.id,
                          type: w.type,
                          x: w.x,
                          y: w.y,
                          width: w.width,
                          height: w.height,
                          title: w.title,
                          content: w.content,
                          zIndex: w.zIndex || 1,
                          size: w.size || '1x1'
                        })),
                        isActive: true,
                        isDefault: false,
                        author: 'admin',
                        widgetCount: templateData.widgets.length,
                        preview: templateData.widgets.map(w => w.type)
                      });
                      alert('템플릿이 저장되었습니다!');
                    }
                    navigate('/');
                  } catch (error) {
                    console.error('템플릿 저장 실패:', error);
                    alert('템플릿 저장에 실패했습니다.');
                  }
                }}
                onDelete={async (templateId) => {
                  try {
                    await templateService.deleteTemplate(templateId);
                    alert('템플릿이 삭제되었습니다!');
                    navigate('/');
                  } catch (error) {
                    console.error('템플릿 삭제 실패:', error);
                    alert('템플릿 삭제에 실패했습니다.');
                  }
                }}
                templateId={(() => {
                  const data = sessionStorage.getItem('templateEditData');
                  console.log('sessionStorage에서 templateId 읽기:', data);
                  if (data) {
                    const parsed = JSON.parse(data);
                    console.log('파싱된 데이터:', parsed);
                    return parsed.id;
                  }
                  return undefined;
                })()}
                initialData={(() => {
                  const data = sessionStorage.getItem('templateEditData');
                  if (data) {
                    const parsed = JSON.parse(data);
                    sessionStorage.removeItem('templateEditData');
                    return parsed;
                  }
                  return undefined;
                })()}
              />
        </main>
      </div>
        } />

        {/* 전체 페이지 목록 */}
        <Route path="/pages" element={<AllPagesListPage />} />

        {/* 공개 페이지 뷰어 - userId_pageNumber 형식 */}
        <Route path="/:pageId" element={<PublicPageViewer />} />
        </Routes>
      } />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </BrowserRouter>
  );
}