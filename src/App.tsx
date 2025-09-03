import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";

import { FloatingContact } from "./components/FloatingContact";
import { FavoritesSectionNew } from "./components/FavoritesSectionNew";
import { CategoryCard } from "./components/CategoryCard";
import { ContactModal } from "./components/ContactModal";
import { Footer } from "./components/Footer";
import { AdBanner } from "./components/AdBanner";
import { AddWebsiteModal } from "./components/AddWebsiteModal";
import { StartPage } from "./components/StartPage";
import { UserGuide } from "./components/UserGuide";
import {
  websites,
  categoryConfig,
  categoryOrder,
} from "./data/websites";
import { FavoritesData, CustomSite, Website } from "./types";
import "./App.css";

export default function App() {
  const [favoritesData, setFavoritesData] =
    useState<FavoritesData>({
      items: [],
      folders: [],
      widgets: [],
    });
  const [customSites, setCustomSites] = useState<CustomSite[]>(
    [],
  );
  const [showDescriptions, setShowDescriptions] =
    useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Set<string>
  >(new Set());
  const [isContactModalOpen, setIsContactModalOpen] =
    useState(false);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] =
    useState(false);
  const [showUserGuide, setShowUserGuide] = useState(() => {
    // 처음 방문자에게만 가이드 표시
    const hasSeenGuide = localStorage.getItem('sfu-guide-seen');
    return !hasSeenGuide;
  });
  const [currentView, setCurrentView] = useState<
    "home" | "startpage"
  >("home");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('sfu-mode');
    return savedMode === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('sfu-mode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // useRef를 사용하여 함수를 메모이징
  const handleOpenAddSiteModalRef = useRef(() => {
    setIsAddSiteModalOpen(true);
  });

  useEffect(() => {
    const savedFavorites = localStorage.getItem(
      "sfu-favorites-v3",
    );
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        setFavoritesData({
          items: (parsed?.items || []).filter((id: string) => id),
          folders: (parsed?.folders || [])
            .filter((folder: any) => folder && folder.id)
            .map((folder: any) => ({
              ...folder,
              items: (folder?.items || []).filter((id: string) => id),
            })),
          widgets: (parsed?.widgets || []).filter(
            (widget: any) => widget && widget.id,
          ),
        });
      } catch (e) {
        console.error(
          "Failed to parse favorites from localStorage:",
          e,
        );
        setFavoritesData({
          items: [],
          folders: [],
          widgets: [],
        });
      }
    }

    const savedCustomSites = localStorage.getItem(
      "sfu-custom-sites",
    );
    if (savedCustomSites) {
      try {
        setCustomSites(JSON.parse(savedCustomSites));
      } catch (e) {
        console.error(
          "Failed to parse custom sites from localStorage:",
          e,
        );
      }
    }

    window.addEventListener(
      "openAddSiteModal",
      handleOpenAddSiteModalRef.current,
    );

    return () => {
      window.removeEventListener(
        "openAddSiteModal",
        handleOpenAddSiteModalRef.current,
      );
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "sfu-favorites-v3",
        JSON.stringify(favoritesData),
      );
    } catch (e) {
      console.error("Failed to save favorites data to localStorage", e);
    }
  }, [favoritesData]);

  const saveCustomSites = (sites: CustomSite[]) => {
    setCustomSites(sites);
    localStorage.setItem(
      "sfu-custom-sites",
      JSON.stringify(sites),
    );
  };

  const toggleFavorite = (websiteId: string) => {
    const newData = { ...favoritesData };
    newData.items = newData.items || [];
    newData.folders = newData.folders || [];
    newData.widgets = newData.widgets || [];

    const isCurrentlyFavorited =
      getAllFavoriteIds().includes(websiteId);

    if (isCurrentlyFavorited) {
      newData.items = newData.items.filter(
        (id) => id !== websiteId,
      );
      newData.folders = newData.folders.map((folder) => ({
        ...folder,
        items: (folder?.items || []).filter(
          (id) => id !== websiteId,
        ),
      }));
    } else {
      newData.items = [...newData.items, websiteId];
    }

    setFavoritesData(newData);
  };

  const getAllFavoriteIds = () => {
    const items = favoritesData?.items || [];
    const folders = favoritesData?.folders || [];
    const folderItems = folders.flatMap(
      (folder) => folder?.items || [],
    );
    return [...items, ...folderItems];
  };

  const addCustomSite = (site: CustomSite, selectedFolderId: string) => {
    // 커스텀 사이트 저장
    const newCustomSites = [...customSites, site];
    saveCustomSites(newCustomSites);
    
    // 즐겨찾기에 추가
    const newData = { ...favoritesData };
    newData.items = newData.items || [];
    newData.folders = newData.folders || [];
    
    if (selectedFolderId && selectedFolderId !== '') {
      const folderIndex = newData.folders.findIndex(f => f.id === selectedFolderId);
      if (folderIndex !== -1) {
        newData.folders[folderIndex].items = [...(newData.folders[folderIndex].items || []), site.id];
      }
    } else {
      newData.items = [...newData.items, site.id];
    }
    setFavoritesData(newData);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleHomepageClick = () => {
    try {
      if ((window as any).chrome) {
        console.log("크롬에서는 설정 > 시작 그룹에서 직접 설정해주세요.");
        console.log("브라우저 설정에서 직접 시작페이지를 설정해주세요.");
      } else {
        (window as any).home();
      }
    } catch (e) {
      alert(
        "브라우저 설정에서 직접 시작페이지를 설정해주세요.",
      );
    }
  };

  const handleHomeClick = () => {
    setCurrentView("home");
  };
  
  const handleStartPageClick = () => {
    setCurrentView("startpage");
  };



  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const allWebsites: Website[] = [
    ...websites,
    ...(customSites || []),
  ];

  const favSet = new Set(getAllFavoriteIds());
  const categorizedWebsites: Record<string, Website[]> = {};
  
  const sitesToDisplay = allWebsites.filter(site => site && !favSet.has(site.id));

  const seenIds = new Set<string>();
  
  sitesToDisplay.forEach((website, index) => {
    let uniqueId = website.id;
    if (seenIds.has(website.id)) {
      uniqueId = `${website.id}_${index}`;
      website = { ...website, id: uniqueId };
    }
    seenIds.add(uniqueId);
    
    if (!categorizedWebsites[website.category]) {
      categorizedWebsites[website.category] = [];
    }
    categorizedWebsites[website.category].push(website);
  });

  const showSampleImage = getAllFavoriteIds().length === 0;

  return (
    <>
      <Header
        onContactClick={() => setIsContactModalOpen(true)}
        onHomepageClick={handleHomepageClick}
        onHomeClick={handleHomeClick}
        onStartPageClick={handleStartPageClick}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      
      {currentView === "home" && (
        <div
          className="min-h-screen relative"
          style={{
            fontFamily:
              "'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: "var(--main-bg)",
            color: "var(--main-dark)",
          }}
        >

          <FloatingContact
            onContactClick={() => setIsContactModalOpen(true)}
          />

          <FavoritesSectionNew
            favoritesData={favoritesData}
            onUpdateFavorites={setFavoritesData}
            showSampleImage={showSampleImage}
            onShowGuide={() => setShowUserGuide(true)}
          />
          
          {/* 설명 토글 스위치 - 컨테이너 안쪽으로 위치 조정 */}
          <div className="max-w-screen-2xl mx-auto px-5 flex justify-between items-center mb-4">
            <div></div> {/* 좌측 공간 */}
            <label htmlFor="description-toggle" className="flex items-center cursor-pointer">
              <span className="text-xs font-medium mr-2" style={{ color: 'var(--main-dark)' }}>사이트 설명 보기</span>
              <div className="relative">
                <input
                  type="checkbox"
                  id="description-toggle"
                  className="sr-only"
                  checked={showDescriptions}
                  onChange={() => setShowDescriptions(!showDescriptions)}
                />
                <div className="block w-10 h-6 rounded-full" style={{ backgroundColor: 'var(--border-sfu)' }}></div>
                <div
                  className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-all duration-200 ${
                    showDescriptions ? 'translate-x-full' : ''
                  }`}
                  style={{ 
                    backgroundColor: showDescriptions ? 'var(--main-point)' : 'var(--website-item-bg)' 
                  }}
                ></div>
              </div>
            </label>
          </div>
          
          <div className="flex gap-8 max-w-screen-2xl mx-auto px-5 pt-8 sm:flex-col md:gap-4 sm:px-2">
            <div className="w-24 p-3 flex flex-col gap-4 sm:hidden">
              <AdBanner text="광고1" />
              <AdBanner text="광고2" />
            </div>

            <div className="flex-1 grid gap-4 xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 sm:gap-3">
              {categoryOrder.map((category) => {
                return (
                  <CategoryCard
                    key={category}
                    category={category}
                    sites={categorizedWebsites[category] || []}
                    config={categoryConfig[category]}
                    isExpanded={expandedCategories.has(category)}
                    showDescriptions={showDescriptions}
                    favorites={getAllFavoriteIds()}
                    onToggleCategory={toggleCategory}
                    onToggleFavorite={toggleFavorite}
                  />
                );
              })}
            </div>

            <div className="w-24 flex flex-col gap-4 sm:hidden">
              <AdBanner text="광고3" />
              <AdBanner text="광고4" />
            </div>
          </div>

          <ContactModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
          />

          <AddWebsiteModal
            isOpen={isAddSiteModalOpen}
            onClose={() => setIsAddSiteModalOpen(false)}
            onAddSite={addCustomSite}
            favoritesData={favoritesData}
          />

          {/* 사용자 가이드 */}
          {showUserGuide && (
            <UserGuide
              onClose={() => {
                setShowUserGuide(false);
                localStorage.setItem('sfu-guide-seen', 'true');
              }}
            />
          )}

          <Footer />
        </div>
      )}

      {currentView === "startpage" && (
        <StartPage
          favoritesData={favoritesData}
          onUpdateFavorites={setFavoritesData}
          onClose={handleHomeClick}
          showDescriptions={showDescriptions}
        />
      )}
    </>
  );
}