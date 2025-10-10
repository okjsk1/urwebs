import { useState } from 'react';
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
// import { PageWithTabs } from './pages/PageWithTabs';
// import { ColumnsBoard } from './components/ColumnsBoard/ColumnsBoard';
// Firebase는 config.ts에서 초기화됩니다

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'category' | 'notice' | 'community' | 'contact' | 'mypage' | 'admin-inquiries' | 'template-edit'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

  const handleCategorySelect = (categoryId: string, subCategory?: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(subCategory || '');
    setCurrentPage('category');
  };

  const handleNavigateHome = () => {
    setCurrentPage('home');
    setSelectedCategory('');
    setSelectedSubCategory('');
  };


  const handleNavigateNotice = () => {
    setCurrentPage('notice');
  };

  const handleNavigateCommunity = () => {
    setCurrentPage('community');
  };

  const handleNavigateContact = () => {
    setCurrentPage('contact');
  };

  const handleNavigateMyPage = () => {
    setCurrentPage('mypage');
  };

  const handleNavigateAdminInquiries = () => {
    setCurrentPage('admin-inquiries');
  };

  const handleNavigateTemplateEdit = (initialData?: any) => {
    setCurrentPage('template-edit');
    // initialData를 저장해서 TemplateEditPage에서 사용할 수 있도록 함
    if (initialData) {
      // 여기서는 간단하게 sessionStorage 사용
      sessionStorage.setItem('templateEditData', JSON.stringify(initialData));
    }
  };


  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePageNew onCategorySelect={handleCategorySelect} />;
      case 'category':
        return (
          <CategoryDetailPageColumns 
            categoryId={selectedCategory} 
            subCategory={selectedSubCategory}
          />
        );
      case 'notice':
        return <NoticePage />;
      case 'community':
        return <CommunityPage />;
      case 'contact':
        return <ContactPage />;
      case 'mypage':
        return <MyPage />;
      case 'admin-inquiries':
        return <AdminPage onNavigateTemplateEdit={handleNavigateTemplateEdit} />;
      case 'template-edit':
        return <TemplateEditPage 
          onBack={handleNavigateHome} 
          initialData={(() => {
            const data = sessionStorage.getItem('templateEditData');
            if (data) {
              sessionStorage.removeItem('templateEditData');
              return JSON.parse(data);
            }
            return undefined;
          })()}
        />;
      default:
        return <HomePageNew onCategorySelect={handleCategorySelect} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
        {currentPage !== 'mypage' && currentPage !== 'template-edit' && (
          <Header 
            currentPage={currentPage} 
            onNavigateHome={handleNavigateHome}
            onNavigateNotice={handleNavigateNotice}
            onNavigateCommunity={handleNavigateCommunity}
            onNavigateContact={handleNavigateContact}
            onNavigateMyPage={handleNavigateMyPage}
            onNavigateAdminInquiries={handleNavigateAdminInquiries}
          />
        )}
        
        <main>
          {renderCurrentPage()}
        </main>
      </div>
    </ThemeProvider>
  );
}