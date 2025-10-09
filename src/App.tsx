import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { HomePageNew } from './components/HomePageNew';
import { CategoryDetailPageColumns } from './components/CategoryDetailPageColumns';
import { NoticePage } from './components/NoticePage';
import { CommunityPage } from './components/CommunityPage';
import { ContactPage } from './components/ContactPage';
import { MyPage } from './components/MyPage';
// Firebase는 config.ts에서 초기화됩니다

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'category' | 'notice' | 'community' | 'contact' | 'mypage'>('home');
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
      default:
        return <HomePageNew onCategorySelect={handleCategorySelect} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
        {currentPage !== 'mypage' && (
          <Header 
            currentPage={currentPage} 
            onNavigateHome={handleNavigateHome}
            onNavigateNotice={handleNavigateNotice}
            onNavigateCommunity={handleNavigateCommunity}
            onNavigateContact={handleNavigateContact}
            onNavigateMyPage={handleNavigateMyPage}
          />
        )}
        
        <main>
          {renderCurrentPage()}
        </main>
      </div>
    </ThemeProvider>
  );
}