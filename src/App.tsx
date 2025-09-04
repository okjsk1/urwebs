import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { UserGuide } from "./components/UserGuide";
import { LoginModal } from "./components/LoginModal";
import { SignupModal } from "./components/SignupModal";
import { GoogleAuthModal } from "./components/GoogleAuthModal";
import { FloatingContact } from "./components/FloatingContact";
import { FavoritesSectionNew } from "./components/FavoritesSectionNew";
import { CategoryCard } from "./components/CategoryCard";
import { ContactModal } from "./components/ContactModal";
import { Footer } from "./components/Footer";
import { AdBanner } from "./components/AdBanner";
import { AddWebsiteModal } from "./components/AddWebsiteModal";
import { StartPage } from "./components/StartPage";
import { Toaster, toast } from "sonner";
import { logger } from "./lib/logger";
import {
  websites,
  categoryConfig,
  categoryOrder,
} from "./data/websites";
import { FavoritesData, CustomSite, Website } from "./types";
import "./App.css";

// Firebase imports
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Firebase auth와 firestore 인스턴스는 firebase.ts에서 초기화됨

export default function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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

  // 1. 로그인 상태 감지 및 데이터 동기화
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 사용자가 로그인하면 Firestore에서 데이터 불러오기
        const userFavoritesRef = doc(db, "favorites", currentUser.uid);
        const docSnap = await getDoc(userFavoritesRef);
        
        if (docSnap.exists()) {
          setFavoritesData(docSnap.data() as FavoritesData);
          logger.info("Firestore에서 즐겨찾기 불러오기 성공");
        } else {
          // 새 사용자라면 localStorage 데이터를 Firestore에 저장
          const savedFavorites = localStorage.getItem("sfu-favorites-v3");
          if (savedFavorites) {
            const parsedFavorites = JSON.parse(savedFavorites);
            setFavoritesData(parsedFavorites);
            await setDoc(userFavoritesRef, parsedFavorites, { merge: true });
            logger.info("localStorage 데이터를 Firestore에 저장 성공");
          }
        }
      } else {
        // 로그아웃 시 localStorage에서 데이터 불러오기
        const savedFavorites = localStorage.getItem("sfu-favorites-v3");
        if (savedFavorites) {
          setFavoritesData(JSON.parse(savedFavorites));
          logger.info("로그아웃 후 localStorage에서 즐겨찾기 불러오기");
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. 즐겨찾기 데이터 변경 시 Firestore에 저장
  useEffect(() => {
    if (user) {
      const userFavoritesRef = doc(db, "favorites", user.uid);
      setDoc(userFavoritesRef, favoritesData, { merge: true }).catch(e => {
        console.error("Failed to save favorites to Firestore:", e);
      });
    }

    try {
      localStorage.setItem(
        "sfu-favorites-v3",
        JSON.stringify(favoritesData),
      );
    } catch (e) {
      console.error("Failed to save favorites data to localStorage", e);
    }
  }, [favoritesData, user]);

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

  const handleOpenAddSiteModalRef = useRef(() => {
    setIsAddSiteModalOpen(true);
  });

  useEffect(() => {
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
    const newCustomSites = [...customSites, site];
    saveCustomSites(newCustomSites);
    
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
        logger.info("크롬에서는 설정 > 시작 그룹에서 직접 설정해주세요.");
        logger.info("브라우저 설정에서 직접 시작페이지를 설정해주세요.");
      } else {
        (window as any).home();
      }
    } catch (e) {
      toast.error("브라우저 설정에서 직접 시작페이지를 설정해주세요.");
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
        onLoginClick={() => setIsGoogleAuthModalOpen(true)}
        onSignupClick={() => setIsGoogleAuthModalOpen(true)}
        user={user}
      />
{/* UserGuide 모달을 최상위에서 조건부 렌더링 */}
      {showUserGuide && (
        <UserGuide
          onClose={() => {
            setShowUserGuide(false);
            localStorage.setItem('sfu-guide-seen', 'true');
          }}
        />
      )}
      
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToSignup={() => {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(true);
          }}
        />
      )}

      {isSignupModalOpen && (
        <SignupModal
          onClose={() => setIsSignupModalOpen(false)}
          onSwitchToLogin={() => {
            setIsSignupModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      )}

      {isGoogleAuthModalOpen && (
        <GoogleAuthModal
          isOpen={isGoogleAuthModalOpen}
          onClose={() => setIsGoogleAuthModalOpen(false)}
          onSuccess={() => {
            logger.info('로그인 성공!');
            // 추가적인 성공 처리 로직
          }}
        />
      )}
      
    
      
      {currentView === "home" && (
        <div
          className="min-h-screen relative"
          style={{
            fontFamily:
              "'suit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
            onSaveData={() => {
              logger.info('데이터 저장 중...');
              // Firestore에 저장하는 로직은 이미 useEffect에서 처리됨
              toast.success('설정이 저장되었습니다!');
            }}
            onRequestLogin={() => setIsGoogleAuthModalOpen(true)}
            isLoggedIn={!!user}
          />
          
          <div className="max-w-screen-2xl mx-auto px-5 flex justify-between items-center mb-4">
            <div></div>
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
      <Toaster position="top-right" richColors />
    </>
  );
}