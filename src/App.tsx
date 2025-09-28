import { useState } from 'react';
import { Header } from './components/Header';
import { HomePageNew } from './components/HomePageNew';
import { CategoryDetailPageColumns } from './components/CategoryDetailPageColumns';
import { CustomStartPageNew } from './components/CustomStartPageNew';
import { NoticePage } from './components/NoticePage';
import { CommunityPage } from './components/CommunityPage';
import { ContactPage } from './components/ContactPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'category' | 'custom' | 'notice' | 'community' | 'contact'>('home');
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

  const handleNavigateCustom = () => {
    setCurrentPage('custom');
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
      case 'custom':
        return <CustomStartPageNew />;
      case 'notice':
        return <NoticePage />;
      case 'community':
        return <CommunityPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePageNew onCategorySelect={handleCategorySelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      <Header 
        currentPage={currentPage} 
        onNavigateHome={handleNavigateHome}
        onNavigateCustom={handleNavigateCustom}
        onNavigateNotice={handleNavigateNotice}
        onNavigateCommunity={handleNavigateCommunity}
        onNavigateContact={handleNavigateContact}
      />
      
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
}