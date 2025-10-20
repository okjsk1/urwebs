import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
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
// import { PageWithTabs } from './pages/PageWithTabs';
// import { ColumnsBoard } from './components/ColumnsBoard/ColumnsBoard';
// Firebase는 config.ts에서 초기화됩니다

// 공개 페이지 뷰어 컴포넌트
function PublicPageViewer() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState(() => null as any);
  const [loading, setLoading] = useState(() => true);
  const [error, setError] = useState(() => null as string | null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const { collection, query, where, getDocs, doc, updateDoc, increment } = await import('firebase/firestore');
        const { db } = await import('./firebase/config');
        
        const pagesRef = collection(db, 'userPages');
        const q = query(pagesRef, where('urlId', '==', pageId), where('isPublic', '==', true));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          setPageData({ id: snapshot.docs[0].id, ...docData });
          
          // 조회수 증가: 백그라운드에서 조용히 시도 (실패해도 무시)
          try {
            const docRef = doc(db, 'userPages', snapshot.docs[0].id);
            await updateDoc(docRef, { views: increment(1) });
            // 페이지 데이터에도 조회수 업데이트
            docData.views = (docData.views || 0) + 1;
          } catch (e) {
            // 조회수 증가 실패는 조용히 무시 (페이지 표시에는 영향 없음)
          }
        } else {
          setError('페이지를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('페이지 로드 실패:', err);
        setError('페이지를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    if (pageId) {
      fetchPage();
    }
  }, [pageId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">페이지를 불러오는 중...</p>
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
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{pageData.title}</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">by {pageData.authorName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>👁️ {pageData.views?.toLocaleString() || 0}회</span>
              <button 
                onClick={async () => {
                  try {
                    const { doc, updateDoc, increment } = await import('firebase/firestore');
                    const { db } = await import('./firebase/config');
                    const docRef = doc(db, 'userPages', pageData.id);
                    await updateDoc(docRef, { likes: increment(1) });
                    // 페이지 데이터 업데이트
                    setPageData(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
                  } catch (error) {
                    console.error('좋아요 실패:', error);
                  }
                }}
                className="flex items-center gap-1 hover:text-red-500 transition-colors"
              >
                <span>👍</span>
                <span>{pageData.likes || 0}개</span>
              </button>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              메인으로
            </button>
          </div>
        </div>
      </header>
      
      <main className="w-full p-4 sm:p-6 lg:p-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">{pageData.description}</p>
          
          {/* 공개보기: 절대 위치 레이아웃 */}
          {Array.isArray(pageData.widgets) && pageData.widgets.length > 0 ? (
            <div 
              className="relative min-h-[800px] w-full"
              style={{
                width: '1284px', // 8칸 * 150px + 7간격 * 12px = 1284px (나만의 페이지와 동일)
                height: '800px',
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
                
                // 위젯 크기 강제 설정 (기존 데이터 무시)
                const widgetSize = sizePresets[w.type] || { w: 1, h: 1 };
                
                // 나만의 페이지와 정확히 동일한 위치 배치
                const positions = [
                  { x: 0, y: 0 }, // 구글 검색 (2x1)
                  { x: 2, y: 0 }, // 네이버 검색 (1x1)
                  { x: 3, y: 0 }, // 법제처 검색 (1x1)
                  { x: 4, y: 0 }, // 영어 단어 (1x2)
                  { x: 6, y: 0 }, // 날씨 (2x3)
                  { x: 0, y: 1 }, // 새 폴더(5) (1x4)
                  { x: 1, y: 1 }, // 북마크 (1x4)
                  { x: 2, y: 1 }, // 지도 (1x4)
                  { x: 3, y: 2 }, // 새 폴더(6) (1x2)
                  { x: 4, y: 2 }, // 새 폴더(3) (1x2)
                  { x: 5, y: 2 }, // 새 폴더(4) (1x2)
                  { x: 4, y: 4 }, // 빠른 메모 (1x1) - y=4로 수정
                  { x: 6, y: 3 }, // 캘린더 (2x3)
                  { x: 5, y: 4 }, // To Do List (1x1)
                ];
                
                // 참고 이미지와 동일한 위치 사용 (기존 좌표 무시)
                const pos = positions[index] || { x: index % 8, y: Math.floor(index / 8) };
                
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

                // 절대 위치 계산 (나만의 페이지와 동일하게)
                const cellWidth = 150;
                const cellHeight = 160;
                const gap = 12;
                const left = pos.x * (cellWidth + gap);
                const top = pos.y * (cellHeight + gap);
                const width = widgetSize.w * cellWidth + (widgetSize.w - 1) * gap;
                const height = widgetSize.h * cellHeight + (widgetSize.h - 1) * gap;
                
                console.log(`위젯 ${w.type} (${index}): pos(${pos.x}, ${pos.y}), size(${widgetSize.w}x${widgetSize.h}), left:${left}px, top:${top}px, width:${width}px, height:${height}px`);

                return (
                  <div
                    key={w.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 absolute"
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                    }}
                  >
                    <div className="h-full relative">
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
    </div>
  );
}

// 메인 앱 컴포넌트 (라우터 사용)
function AppContent() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(() => '');
  const [selectedSubCategory, setSelectedSubCategory] = useState(() => '');

  const handleCategorySelect = (categoryId: string, subCategory?: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(subCategory || '');
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-950 dark:to-gray-900">
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
      </ThemeProvider>
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