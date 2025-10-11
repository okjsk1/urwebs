import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { HomePageNew } from './components/HomePageNew';
import { CategoryDetailPageColumns } from './components/CategoryDetailPageColumns';
import { NoticePage } from './components/NoticePage';
import { CommunityPage } from './components/CommunityPage';
import { ContactPage } from './components/ContactPage';
import { MyPage } from './components/MyPage';
import { AdminPage } from './components/AdminPage';
import { TemplateEditPage } from './components/TemplateEditPage';
import { AllPagesListPage } from './components/AllPagesListPage';
// import { PageWithTabs } from './pages/PageWithTabs';
// import { ColumnsBoard } from './components/ColumnsBoard/ColumnsBoard';
// Firebase는 config.ts에서 초기화됩니다

// 공개 페이지 뷰어 컴포넌트
function PublicPageViewer() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          
          // 조회수 증가
          const docRef = doc(db, 'userPages', snapshot.docs[0].id);
          await updateDoc(docRef, {
            views: increment(1)
          });
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">페이지를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-4">{error || '존재하지 않거나 비공개된 페이지입니다.'}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
      
      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">{pageData.description}</p>
          
          {/* 위젯 미리보기 (간단한 그리드 표시) */}
          <div className="grid grid-cols-4 gap-4">
            {pageData.widgets?.map((widget: any) => (
              <div 
                key={widget.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
                style={{
                  gridColumn: `span ${Math.ceil(widget.width / 100)}`,
                  minHeight: `${widget.height}px`
                }}
              >
                <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">{widget.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">타입: {widget.type}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// 메인 앱 컴포넌트 (라우터 사용)
function AppContent() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

  const handleCategorySelect = (categoryId: string, subCategory?: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(subCategory || '');
  };

        return (
    <ThemeProvider>
      <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
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
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
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
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
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
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
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
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
            <main>
              <MyPage />
            </main>
          </div>
        } />
        
        {/* 나의 페이지 - 특정 페이지 (편집 모드) */}
        <Route path="/mypage/:pageId" element={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
            <main>
              <MyPage />
            </main>
          </div>
        } />

        {/* 관리자 페이지 */}
        <Route path="/admin" element={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
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
              <AdminPage onNavigateTemplateEdit={() => navigate('/template-edit')} />
            </main>
          </div>
        } />

        {/* 템플릿 편집 페이지 */}
        <Route path="/template-edit" element={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
            <main>
              <TemplateEditPage 
                onBack={() => navigate('/')}
          initialData={(() => {
            const data = sessionStorage.getItem('templateEditData');
            if (data) {
              sessionStorage.removeItem('templateEditData');
              return JSON.parse(data);
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}