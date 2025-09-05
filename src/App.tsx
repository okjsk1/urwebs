// ⬇⬇ App.tsx 최상단 import 묶음에 추가
import { auth, db } from "./firebase";
import React, { useState, useEffect, useRef } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, writeBatch } from "firebase/firestore";

import { Header } from "./components/Header";
import { LoginModal } from "./components/LoginModal";
import { SignupModal } from "./components/SignupModal";
import { FloatingContact } from "./components/FloatingContact";
import { FavoritesSectionNew } from "./components/FavoritesSectionNew";
import { CategoryCard } from "./components/CategoryCard";
import { ContactModal } from "./components/ContactModal";
import { Footer } from "./components/Footer";
import { AdBanner } from "./components/AdBanner";
import { AddWebsiteModal } from "./components/AddWebsiteModal";
import { StartPage } from "./components/StartPage";
import { MidBanner } from "./components/MidBanner";
import { Onboarding } from "./components/Onboarding";
import { RecommendTray } from "./components/RecommendTray";
import { TopList } from "./components/TopList";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { toast } from "sonner";

import { websites, categoryConfig, categoryOrder } from "./data/websites";
import { FavoritesData, CustomSite, Website } from "./types";
import "./App.css";
import { applyPreset } from "./utils/applyPreset";
import { ARCHITECTURE_STARTER } from "./presets/architecture";
import { toggleFavorite as toggleFavoriteData } from "./utils/favorites";



// ---------------------------
// urwebs 키 세팅
// ---------------------------
const LS_KEYS = {
  MODE: "urwebs-mode",
  FAV: "urwebs-favorites-v3",
  CUSTOM: "urwebs-custom-sites",
  ONBOARD: "urwebs-onboarding-v1",
};

const EMPTY_FAVORITES: FavoritesData = { items: [], folders: [], widgets: [] };

export default function App() {
  // 모달들
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // 로그인 유저
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Firestore 스냅샷 unsubscribe 및 저장 플래그
  const userDataUnsubscribe = useRef<(() => void) | null>(null);
  const skipSave = useRef(false);

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

  // 온보딩 노출 여부
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem(LS_KEYS.ONBOARD);
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
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (userDataUnsubscribe.current) {
        userDataUnsubscribe.current();
        userDataUnsubscribe.current = null;
      }

      setUser(currentUser);

      if (currentUser) {
        setAuthLoading(true);
        const userDocRef = doc(db, "users", currentUser.uid);
        userDataUnsubscribe.current = onSnapshot(
          userDocRef,
          (docSnap) => {
            skipSave.current = true;
            if (docSnap.exists()) {
              const data = docSnap.data() as {
                favoritesData?: FavoritesData;
                customSites?: CustomSite[];
              };
              const favData = data.favoritesData || EMPTY_FAVORITES;
              const sites = data.customSites || [];
              setFavoritesData(favData);
              setCustomSites(sites);
              localStorage.setItem(LS_KEYS.FAV, JSON.stringify(favData));
              localStorage.setItem(LS_KEYS.CUSTOM, JSON.stringify(sites));
            } else {
              setFavoritesData(EMPTY_FAVORITES);
              setCustomSites([]);
              localStorage.setItem(
                LS_KEYS.FAV,
                JSON.stringify(EMPTY_FAVORITES)
              );
              localStorage.setItem(LS_KEYS.CUSTOM, JSON.stringify([]));
            }
            setAuthLoading(false);
          },
          (error) => {
            console.error("Failed to fetch user data from Firestore:", error);
            toast.error("사용자 데이터를 불러오지 못했습니다.");
            setFavoritesData(EMPTY_FAVORITES);
            setCustomSites([]);
            setAuthLoading(false);
          }
        );
      } else {
        setFavoritesData(EMPTY_FAVORITES);
        setCustomSites([]);
        localStorage.removeItem(LS_KEYS.FAV);
        localStorage.removeItem(LS_KEYS.CUSTOM);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (userDataUnsubscribe.current) userDataUnsubscribe.current();
    };
  }, []);

  // ---------------------------
  // 2) 즐겨찾기/커스텀 사이트 변경 시 Firestore & localStorage 저장
  // ---------------------------
  useEffect(() => {
    if (user) {
      if (skipSave.current) {
        skipSave.current = false;
      } else {
        const batch = writeBatch(db);
        const userDocRef = doc(db, "users", user.uid);
        batch.set(userDocRef, { favoritesData, customSites }, { merge: true });
        batch.commit().catch((e) => {
          console.error("Failed to save user data to Firestore:", e);
          toast.error("사용자 데이터를 저장하지 못했습니다.");
        });
      }
    }

    try {
      localStorage.setItem(LS_KEYS.FAV, JSON.stringify(favoritesData));
      localStorage.setItem(LS_KEYS.CUSTOM, JSON.stringify(customSites));
    } catch (e) {
      console.error("Failed to save user data to localStorage", e);
    }
  }, [favoritesData, customSites, user]);

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
    try {
      const newData = toggleFavoriteData(favoritesData, websiteId);
      const isCurrentlyFavorited = getAllFavoriteIds().includes(websiteId);
      setFavoritesData(newData);
      toast.success(
        isCurrentlyFavorited
          ? "즐겨찾기에서 제거되었습니다."
          : "즐겨찾기에 추가되었습니다."
      );
    } catch (e) {
      toast.error("즐겨찾기 변경에 실패했습니다.");
    }
  };

  const handleAddFav = (id: string) => {
    try {
      setFavoritesData((prev) =>
        applyPreset(prev, { items: [id], folders: [], widgets: [] })
      );
      toast.success("즐겨찾기에 추가되었습니다.");
    } catch (e) {
      toast.error("즐겨찾기 추가에 실패했습니다.");
    }
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
    toast.success("커스텀 사이트가 추가되었습니다.");
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
        // 크롬에서는 설정을 수동으로 안내
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
    setFavoritesData(EMPTY_FAVORITES);
    setCustomSites([]);
    localStorage.removeItem(LS_KEYS.FAV);
    localStorage.removeItem(LS_KEYS.CUSTOM);
    sessionStorage.removeItem(LS_KEYS.FAV);
    sessionStorage.removeItem(LS_KEYS.CUSTOM);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-transparent" />
      </div>
    );
  }

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
    <ErrorBoundary>
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
          {/* // [Onboarding] */}
          {showOnboarding && (
            <Onboarding
              onApplyPreset={() =>
                setFavoritesData(
                  applyPreset(favoritesData, ARCHITECTURE_STARTER)
                )
              }
              onOpenAddSite={() =>
                window.dispatchEvent(new CustomEvent('openAddSiteModal'))
              }
              onOpenHomepageGuide={() =>
                alert('브라우저 설정에서 시작페이지를 urwebs로 설정하세요.')
              }
              onClose={() => setShowOnboarding(false)}
            />
          )}
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

          {/* // [RecommendTray] */}
          <RecommendTray
            onApplyPreset={(preset) =>
              setFavoritesData(applyPreset(favoritesData, preset))
            }
          />

          <FavoritesSectionNew
            favoritesData={favoritesData}
            onUpdateFavorites={setFavoritesData}
            showSampleImage={showSampleImage}
            onShowGuide={() => setShowOnboarding(true)}
            onSaveData={() => {
              toast.success("설정이 저장되었습니다!");
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

            {/* // [TopList] */}
            <div className="w-64 hidden xl:block">
              <div className="sticky top-6 space-y-4">
                <TopList mode="mine" onAddFavorite={handleAddFav} />
                <TopList mode="global" onAddFavorite={handleAddFav} />
              </div>
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
    </ErrorBoundary>
  );
}
