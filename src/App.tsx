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
          
          // 조회수 증가: 규칙상 작성자만 쓸 수 있으므로, 본인으로 로그인한 경우에만 시도
          try {
            const { getAuth } = await import('firebase/auth');
            const auth = getAuth();
            if (auth.currentUser?.uid && auth.currentUser.uid === (docData as any).authorId) {
              const docRef = doc(db, 'userPages', snapshot.docs[0].id);
              await updateDoc(docRef, { views: increment(1) });
            }
          } catch (e) {
            // 무시: 권한/인증 부재 시 증가 스킵
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-950 dark:to-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{pageData.title}</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">by {pageData.authorName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>👁️ {pageData.views?.toLocaleString() || 0}회</span>
              <span>👍 {pageData.likes || 0}개</span>
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
          
          {/* 공개보기: 저장된 좌표/크기 그대로 실제 위젯 렌더링 */}
          {Array.isArray(pageData.widgets) && pageData.widgets.length > 0 ? (
            <div className="relative min-h-[600px]">
              {(pageData.widgets || []).map((w: any) => {
                // 저장된 위젯 데이터를 픽셀 좌표로 변환
                const parseSizeFromString = (s: any) => {
                  if (typeof s === 'string' && /^(\d+)x(\d+)$/.test(s)) {
                    const [, sw, sh] = s.match(/(\d+)x(\d+)/) as any;
                    return { w: Number(sw), h: Number(sh) };
                  }
                  return null;
                };

                // 그리드 크기 결정
                let gridW = 1, gridH = 1;
                if (w?.gridSize?.w && w?.gridSize?.h) {
                  gridW = w.gridSize.w;
                  gridH = w.gridSize.h;
                } else if (w?.width && w?.height) {
                  // 저장된 width/height가 그리드 단위인 경우
                  gridW = w.width;
                  gridH = w.height;
                } else {
                  const sizeFromString = parseSizeFromString(w?.size);
                  if (sizeFromString) {
                    gridW = sizeFromString.w;
                    gridH = sizeFromString.h;
                  }
                }

                // 그리드 좌표를 픽셀로 변환
                // w.x, w.y는 이미 그리드 단위로 저장되어 있음
                const x = colToX(w.x || 0);
                const y = rowToY(w.y || 0);
                const width = gridWToPx(gridW);
                const height = gridHToPx(gridH);
                
                
                

                const widgetForRender = {
                  id: w.id,
                  type: w.type,
                  title: w.title,
                  content: w.content,
                  variant: w.variant,
                  x: 0, // 절대 위치이므로 0
                  y: 0, // 절대 위치이므로 0
                  width: gridW,
                  height: gridH,
                } as any;

                return (
                  <div
                    key={w.id}
                    className="absolute"
                    style={{
                      left: x,
                      top: y,
                      width: width,
                      height: height,
                      zIndex: w.zIndex || 10, // 기본 zIndex를 10으로 설정
                    }}
                  >
                    {renderWidget(widgetForRender)}
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