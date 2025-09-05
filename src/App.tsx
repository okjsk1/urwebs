// ⬇⬇ App.tsx 최상단 import 묶음에 추가
import { auth, db } from "./firebase";
import React, { useState, useEffect, useRef } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { Header } from "./components/Header";
import { UserGuide } from "./components/UserGuide";
import { LoginModal } from "./components/LoginModal";
import { SignupModal } from "./components/SignupModal";
// (삭제) import { GoogleAuthModal } from "./components/GoogleAuthModal";
import { FloatingContact } from "./components/FloatingContact";
import { FavoritesSectionNew } from "./components/FavoritesSectionNew";
import { CategoryCard } from "./components/CategoryCard";
import { ContactModal } from "./components/ContactModal";
import { Footer } from "./components/Footer";
import { AdBanner } from "./components/AdBanner";
import { AddWebsiteModal } from "./components/AddWebsiteModal";
import { StartPage } from "./components/StartPage";
import { MidBanner } from "./components/MidBanner";

import { websites, categoryConfig, categoryOrder } from "./data/websites";
import { FavoritesData, CustomSite, Website } from "./types";
import "./App.css";
import { applyPreset } from "./utils/applyPreset";
import { ARCHITECTURE_STARTER } from "./presets/architecture";



// ---------------------------
// urwebs 키 세팅
// ---------------------------
const LS_KEYS = {
  GUIDE: "urwebs-guide-seen",
  MODE: "urwebs-mode",
  FAV: "urwebs-favorites-v3",
  CUSTOM: "urwebs-custom-sites",
};

export default function App() {
  // 모달들
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  // (삭제) const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);

  // 로그인 유저
  const [user, setUser] = useState<User | null>(null);

  // 즐겨찾기/커스텀/표시 옵션
  const [favoritesData, setFavoritesData] = useState<FavoritesData>({
    items: [],
    folders: [],
    widgets: [],
  });
  const [customSites, setCustomSites] = useState<CustomSite[]>([]);
  const [showDescriptions, setShowDescriptions] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // 기타 모달
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  // 유저 가이드 노출 여부
  const [showUserGuide, setShowUserGuide] = useState(() => {
    const hasSeenGuide = localStorage.getItem(LS_KEYS.GUIDE);
    return !hasSeenGuide;
  });

  // 뷰
  const [currentView, setCurrentView] = useState<"home" | "startpage">("home");

  // 다크모드 초기값
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem(LS_KEYS.MODE);
    return savedMode === "dark";
  });

  // ---------------------------
  // 1) 로그인 상태 감지 + 초기 데이터 로드
  // ---------------------------
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userFavoritesRef = doc(db, "favorites", currentUser.uid);
        const docSnap = await getDoc(userFavoritesRef);

        if (docSnap.exists()) {
          setFavoritesData(docSnap.data() as FavoritesData);
          console.log("Firestore에서 즐겨찾기 불러오기 성공");
        } else {
          // 새 사용자면 localStorage → Firestore
          const savedFavorites = localStorage.getItem(LS_KEYS.FAV);
          if (savedFavorites) {
            const parsedFavorites = JSON.parse(savedFavorites);
            setFavoritesData(parsedFavorites);
            await setDoc(userFavoritesRef, parsedFavorites, { merge: true });
            console.log("localStorage 데이터를 Firestore에 저장 성공");
          }
        }
      } else {
        // 로그아웃 시 localStorage에서 로드
        const savedFavorites = localStorage.getItem(LS_KEYS.FAV);
        if (savedFavorites) {
          setFavoritesData(JSON.parse(savedFavorites));
          console.log("로그아웃 후 localStorage에서 즐겨찾기 불러오기");
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // ---------------------------
  // 2) 즐겨찾기 변경 시 Firestore & localStorage 저장
  // ---------------------------
  useEffect(() => {
    if (user) {
      const userFavoritesRef = doc(db, "favorites", user.uid);
      setDoc(userFavoritesRef, favoritesData, { merge: true }).catch((e) => {
        console.error("Failed to save favorites to Firestore:", e);
      });
    }

    try {
      localStorage.setItem(LS_KEYS.FAV, JSON.stringify(favoritesData));
    } catch (e) {
      console.error("Failed to save favorites data to localStorage", e);
    }
  }, [favoritesData, user]);

  // ---------------------------
  // 다크모드 토글
  // ---------------------------
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    localStorage.setItem(LS_KEYS.MODE, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // ---------------------------
  // 커스텀 사이트 로드
  // ---------------------------
  const handleOpenAddSiteModalRef = useRef(() => {
    setIsAddSiteModalOpen(true);
  });

  useEffect(() => {
    const savedCustomSites = localStorage.getItem(LS_KEYS.CUSTOM);
    if (savedCustomSites) {
      try {
        setCustomSites(JSON.parse(savedCustomSites));
      } catch (e) {
        console.error("Failed to parse custom sites from localStorage:", e);
      }
    }

    window.addEventListener("openAddSiteModal", handleOpenAddSiteModalRef.current);
    return () => {
      window.removeEventListener("openAddSiteModal", handleOpenAddSiteModalRef.current);
    };
  }, []);

  const saveCustomSites = (sites: CustomSite[]) => {
    setCustomSites(sites);
    localStorage.setItem(LS_KEYS.CUSTOM, JSON.stringify(sites));
  };

  // ---------------------------
  // 즐겨찾기/카테고리 유틸
  // ---------------------------
  const getAllFavoriteIds = () => {
    const items = favoritesData?.items || [];
    const folders = favoritesData?.folders || [];
    const folderItems = folders.flatMap((folder) => folder?.items || []);
    return [...items, ...folderItems];
  };

  const toggleFavorite = (websiteId: string) => {
    const newData = { ...favoritesData };
    newData.items = newData.items || [];
    newData.folders = newData.folders || [];
    newData.widgets = newData.widgets || [];

    const isCurrentlyFavorited = getAllFavoriteIds().includes(websiteId);

    if (isCurrentlyFavorited) {
      newData.items = newData.items.filter((id) => id !== websiteId);
      newData.folders = newData.folders.map((folder) => ({
        ...folder,
        items: (folder?.items || []).filter((id) => id !== websiteId),
      }));
    } else {
      newData.items = [...newData.items, websiteId];
    }

    setFavoritesData(newData);
  };

  const addCustomSite = (site: CustomSite, selectedFolderId: string) => {
    const newCustomSites = [...customSites, site];
    saveCustomSites(newCustomSites);

    const newData = { ...favoritesData };
    newData.items = newData.items || [];
    newData.folders = newData.folders || [];

    if (selectedFolderId && selectedFolderId !== "") {
      const folderIndex = newData.folders.findIndex((f) => f.id === selectedFolderId);
      if (folderIndex !== -1) {
        newData.folders[folderIndex].items = [
          ...(newData.folders[folderIndex].items || []),
          site.id,
        ];
      }
    } else {
      newData.items = [...newData.items, site.id];
    }
    setFavoritesData(newData);
  };

  const toggleCategory = (category: string) => {
    const next = new Set(expandedCategories);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    setExpandedCategories(next);
  };

  // ---------------------------
  // 기타 핸들러
  // ---------------------------
  const handleHomepageClick = () => {
    try {
      if ((window as any).chrome) {
        console.log("크롬에서는 설정 > 시작 그룹에서 직접 설정해주세요.");
      } else {
        (window as any).home();
      }
    } catch (e) {
      alert("브라우저 설정에서 직접 시작페이지를 설정해주세요.");
    }
  };

  const handleHomeClick = () => setCurrentView("home");
  const handleStartPageClick = () => setCurrentView("startpage");
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // 로그아웃
  const handleLogout = async () => {
    await signOut(auth);
    console.log("로그아웃 성공");
  };

  // ---------------------------
  // 목록 구성
  // ---------------------------
  const allWebsites: Website[] = [...websites, ...(customSites || [])];
  const favSet = new Set(getAllFavoriteIds());
  const categorizedWebsites: Record<string, Website[]> = {};

  const sitesToDisplay = allWebsites.filter((site) => site && !favSet.has(site.id));
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

  // ---------------------------
  // 렌더
  // ---------------------------
  return (
    <>
      <Header
        onContactClick={() => setIsContactModalOpen(true)}
        onHomepageClick={handleHomepageClick}
        onHomeClick={handleHomeClick}
        onStartPageClick={handleStartPageClick}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        // ⬇️ 로그인/회원가입 모달 열기 (GoogleAuthModal 대신)
        onLoginClick={() => setIsLoginModalOpen(true)}
        onSignupClick={() => setIsSignupModalOpen(true)}
        // ⬇️ 로그인 유저 및 로그아웃
        user={user}
        onLogout={handleLogout}
      />

      {/* 유저 가이드 모달 */}
      {showUserGuide && (
        <UserGuide
          onClose={() => {
            setShowUserGuide(false);
            localStorage.setItem(LS_KEYS.GUIDE, "true");
          }}
        />
      )}

      {/* 로그인/회원가입 모달 */}
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

      {/* (삭제) 구글 로그인 모달
      {isGoogleAuthModalOpen && (
        <GoogleAuthModal
          isOpen={isGoogleAuthModalOpen}
          onClose={() => setIsGoogleAuthModalOpen(false)}
          onSuccess={() => {
            console.log("로그인 성공!");
          }}
        />
      )} */}

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
          <FloatingContact onContactClick={() => setIsContactModalOpen(true)} />
          {/* // [MidBanner] */}
          <MidBanner
            onApplyPreset={() =>
              setFavoritesData(applyPreset(favoritesData, ARCHITECTURE_STARTER))
            }
            onOpenAddSite={() =>
              window.dispatchEvent(new CustomEvent('openAddSiteModal'))
            }
            onOpenHomepageGuide={() =>
              alert('브라우저 설정에서 시작페이지를 urwebs로 설정하세요.')
            }
          />

          <FavoritesSectionNew
            favoritesData={favoritesData}
            onUpdateFavorites={setFavoritesData}
            showSampleImage={showSampleImage}
            onShowGuide={() => setShowUserGuide(true)}
            onSaveData={() => {
              alert("설정이 저장되었습니다!");
            }}
            // ⬇️ 로그인 요청 시 로그인 모달 열기
            onRequestLogin={() => setIsLoginModalOpen(true)}
            isLoggedIn={!!user}
          />

          <div className="max-w-screen-2xl mx-auto px-5 flex justify-between items-center mb-4">
            <div></div>
            <label htmlFor="description-toggle" className="flex items-center cursor-pointer">
              <span className="text-xs font-medium mr-2" style={{ color: "var(--main-dark)" }}>
                사이트 설명 보기
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  id="description-toggle"
                  className="sr-only"
                  checked={showDescriptions}
                  onChange={() => setShowDescriptions(!showDescriptions)}
                />
                <div
                  className="block w-10 h-6 rounded-full"
                  style={{ backgroundColor: "var(--border-urwebs)" }}
                ></div>
                <div
                  className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-all duration-200 ${
                    showDescriptions ? "translate-x-full" : ""
                  }`}
                  style={{
                    backgroundColor: showDescriptions
                      ? "var(--main-point)"
                      : "var(--website-item-bg)",
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
              {categoryOrder.map((category) => (
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
              ))}
            </div>

            <div className="w-24 flex flex-col gap-4 sm:hidden">
              <AdBanner text="광고3" />
              <AdBanner text="광고4" />
            </div>
          </div>

          <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

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
    </>
  );
}
