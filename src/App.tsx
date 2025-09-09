// ⬇⬇ App.tsx 최상단 import 묶음에 추가/유지
import { auth, db } from "./firebase";
import React, { useState, useEffect, useRef } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { onSnapshot, writeBatch } from "firebase/firestore";
import { getUserDocRef } from "./services/firestoreClient";
import { stripUndefined } from "./utils/sanitize";
import { assertAuthed } from "./utils/assert";
import { setupGuestMigration } from "./services/bookmarks";

import { Header } from "./components/Header";
import { LoginModal } from "./components/LoginModal";
import { SignupModal } from "./components/SignupModal";
import { FloatingContact } from "./components/FloatingContact";
import { FavoritesSectionNew } from "./components/FavoritesSectionNew";
import { CategoryCard } from "./components/CategoryCard";
import { ContactModal } from "./components/ContactModal";
import { Footer } from "./components/Footer";
import { AddWebsiteModal } from "./components/AddWebsiteModal";
import { StartPage } from "./components/StartPage";
import { Onboarding } from "./components/Onboarding";
import { ErrorBoundary } from "./components/ErrorBoundary";
import GuideSamples from "./components/GuideSamples";
import { toast } from "sonner";

import { websites, categoryConfig, categoryOrder } from "./data/websites";
import { FavoritesData, CustomSite, Website } from "./types";
import "./App.css";
import { applyPreset } from "./utils/applyPreset";
import { toggleFavorite as toggleFavoriteData } from "./utils/favorites";
import { parseFavoritesData, parseCustomSites } from "./utils/validation";
import { getStarterData } from "./utils/startPageStorage";
import { Skeleton } from "./components/ui/skeleton";
import { useUIMode } from "./hooks/useUIMode";
import { hasFavorites } from "./utils/fav";

// ---------------------------
// urwebs 키 세팅
// ---------------------------
const LS_KEYS = {
  MODE: "urwebs-mode",
  FAV: "urwebs-favorites-v3",
  CUSTOM: "urwebs-custom-sites",
  ONBOARD: "urwebs-onboarding-v1",
};

const EMPTY_FAVORITES: FavoritesData = { items: [], folders: [], widgets: [], layout: [] };

// ✅ 메인엔 카테고리만 보이도록 유지
// 기존 설정에서는 카테고리만 보여서 '사이트 추가' 버튼이 동작하지 않았습니다.
// 기능 사용을 위해 기본값을 false로 변경합니다.
const SHOW_ONLY_CATEGORIES = false;

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
    layout: [],
  });
  const [customSites, setCustomSites] = useState<CustomSite[]>([]);
  const showDescriptions = true;
  const [saving, setSaving] = useState(false);

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

  // UI 모드(discovery/collect)
  const { uiMode, setUIMode } = useUIMode(user);
  const hasFav = hasFavorites(favoritesData.folders, favoritesData.items);

  // ✅ 즐겨찾기 패널 오픈 상태 (오버레이)
  const [isFavOpen, setIsFavOpen] = useState(false);

  useEffect(() => {
    setupGuestMigration();
  }, []);

  // ESC 로 패널 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsFavOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
        const userDocRef = getUserDocRef(currentUser.uid);
        userDataUnsubscribe.current = onSnapshot(
          userDocRef,
          (docSnap) => {
            skipSave.current = true;
            if (docSnap.exists()) {
              const data = docSnap.data() as {
                favoritesData?: unknown;
                customSites?: unknown;
              };
              const favData = parseFavoritesData(data.favoritesData);
              const sites = parseCustomSites(data.customSites);
              setFavoritesData(favData);
              setCustomSites(sites);
              localStorage.setItem(LS_KEYS.FAV, JSON.stringify(favData));
              localStorage.setItem(LS_KEYS.CUSTOM, JSON.stringify(sites));
            } else {
              setFavoritesData(EMPTY_FAVORITES);
              setCustomSites([]);
              localStorage.setItem(LS_KEYS.FAV, JSON.stringify(EMPTY_FAVORITES));
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
        try {
          const rawFav = localStorage.getItem(LS_KEYS.FAV);
          let favData = parseFavoritesData(
            rawFav ? JSON.parse(rawFav) : undefined
          );
          if (
            favData.items.length === 0 &&
            favData.folders.length === 0 &&
            favData.widgets.length === 0
          ) {
            favData = getStarterData();
            localStorage.setItem(LS_KEYS.FAV, JSON.stringify(favData));
          }
          const rawCustom = localStorage.getItem(LS_KEYS.CUSTOM);
          const customData = parseCustomSites(
            rawCustom ? JSON.parse(rawCustom) : undefined
          );
          setFavoritesData(favData);
          setCustomSites(customData);
        } catch {
          setFavoritesData(EMPTY_FAVORITES);
          setCustomSites([]);
        }
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (userDataUnsubscribe.current) userDataUnsubscribe.current();
    };
  }, []);

  // ---------------------------
  // 즐겨찾기 추가 시 기본 폴더 샘플 생성
  // ---------------------------
  useEffect(() => {
    const hasBookmark = favoritesData.items.some(Boolean);
    const hasFolders = favoritesData.folders.length > 0;
    if (hasBookmark && !hasFolders) {
      setFavoritesData((prev) => ({
        ...prev,
        folders: [
          {
            id: "sample-folder",
            name: "기본 폴더",
            items: [],
          },
        ],
      }));
    }
  }, [favoritesData.items, favoritesData.folders.length]);

  // ---------------------------
  // 2) 즐겨찾기/커스텀 사이트 변경 시 Firestore & localStorage 저장
  // ---------------------------
  useEffect(() => {
    if (user) {
      const authed = assertAuthed(auth);
      if (skipSave.current) {
        skipSave.current = false;
      } else {
        const batch = writeBatch(db);
        const userDocRef = getUserDocRef(authed.uid);
        const payload = stripUndefined({ favoritesData, customSites });
        batch.set(userDocRef, payload, { merge: true });
        setSaving(true);
        batch
          .commit()
          .then(() => toast.success("저장 완료"))
          .catch((e) => {
            console.error(e);
            toast.error("저장 실패: 입력값 확인");
          })
          .finally(() => setSaving(false));
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
        isCurrentlyFavorited ? "즐겨찾기에서 제거되었습니다." : "즐겨찾기에 추가되었습니다."
      );
    } catch (e) {
      toast.error("즐겨찾기 변경에 실패했습니다.");
    }
  };

  const handleAddFav = (id: string) => {
    try {
      setFavoritesData((prev) => applyPreset(prev, { items: [id], folders: [], widgets: [] }));
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
      <div className="p-4 space-y-4" aria-label="로딩">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  // ---------------------------
  // 목록 구성
  // ---------------------------
  const allWebsites: Website[] = [...websites, ...(customSites || [])];

  const favSet = new Set(getAllFavoriteIds());

  // 카테고리 그리드에는 즐겨찾기 제외(기존 로직 유지)
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

  // ---------------------------
  // 렌더
  // ---------------------------
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-center" role="alert">
          문제가 발생했습니다. 잠시 후 다시 시도해주세요.
        </div>
      }
    >
      <>
        <Header
          onContactClick={() => setIsContactModalOpen(true)}
          onHomepageClick={handleHomepageClick}
          onHomeClick={handleHomeClick}
          onStartPageClick={handleStartPageClick}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          // 로그인/회원가입 모달 열기
          onLoginClick={() => setIsLoginModalOpen(true)}
          onSignupClick={() => setIsSignupModalOpen(true)}
          // 로그인 유저 및 로그아웃
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
            <div className="flex justify-center">
              <div id="page-container" className="w-full !max-w-[900px] px-4 lg:px-6">
                {/* ---- 기존 스타트/홍보 영역은 SHOW_ONLY_CATEGORIES=true라 숨김 유지 ---- */}
                {!SHOW_ONLY_CATEGORIES && (
                  <FloatingContact onContactClick={() => setIsContactModalOpen(true)} />
                )}


                {!SHOW_ONLY_CATEGORIES && showOnboarding && (
                  <Onboarding
                    onOpenAddSite={() =>
                      window.dispatchEvent(new CustomEvent("openAddSiteModal"))
                    }
                    onOpenHomepageGuide={() =>
                      alert("브라우저 설정에서 시작페이지를 urwebs로 설정하세요.")
                    }
                    onClose={() => setShowOnboarding(false)}
                  />
                )}

                {/* 즐겨찾기 & 폴더: 즐겨찾기가 있을 때만 상단에 표시 */}
                {hasFav && (
                  <FavoritesSectionNew
                    favoritesData={favoritesData}
                    onUpdateFavorites={setFavoritesData}
                    onShowGuide={() => setShowOnboarding(true)}
                    onSaveData={() => toast.success("설정이 저장되었습니다!")}
                    onRequestLogin={() => setIsLoginModalOpen(true)}
                    isLoggedIn={!!user}
                  />
                )}

                {/* ✅ 메인: 카테고리 그리드 (항상 첫 화면에 보이게) */}
                <section className="mt-6 w-full overflow-x-hidden">
                  <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-5 lg:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-x-2 gap-y-4 min-w-0">
                      {categoryOrder.map((category) => (
                        <CategoryCard
                          key={category}
                          category={category}
                          sites={categorizedWebsites[category] || []}
                          config={categoryConfig[category]}
                          showDescriptions={showDescriptions}
                          // ✅ (핵심) 즐겨찾기 상태 & 토글 연결
                          favorites={getAllFavoriteIds()}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* ✅ 화면 오른쪽 위에 항상 떠있는 "즐겨찾기" 버튼 (클릭 가능) */}
            <button
              type="button"
              onClick={() => setIsFavOpen(true)}
              className="fixed right-4 top-20 z-50 px-4 py-2 rounded-md border bg-white shadow hover:shadow-lg hover:ring-4 focus:outline-hidden"
              title="즐겨찾기 열기"
            >
              즐겨찾기
            </button>

            {/* ✅ 즐겨찾기 오버레이 패널 (레이아웃을 밀지 않음) */}
            {isFavOpen && (
              <>
                {/* 백드롭 */}
                <div
                  className="fixed inset-0 bg-black/50 z-[9999]"
                  onClick={() => setIsFavOpen(false)}
                  aria-hidden
                />
                {/* 패널 (상단 고정) */}
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="즐겨찾기와 폴더"
                  className="fixed left-0 right-0 top-0 z-[10000] bg-white dark:bg-black border-b shadow-xl"
                >
                  {/* 헤더 */}
                  <div className="h-12 px-4 flex items-center justify-between border-b">
                    <strong className="text-sm">즐겨찾기 & 폴더</strong>
                    <div className="flex gap-2">
                      {/* 로그인 필요 시 안내 */}
                      {!user && (
                        <button
                          className="px-3 py-1 rounded border hover:bg-gray-50"
                          onClick={() => setIsLoginModalOpen(true)}
                        >
                          로그인
                        </button>
                      )}
                      <button
                        className="px-3 py-1 rounded border hover:bg-gray-50"
                        onClick={() => setIsFavOpen(false)}
                      >
                        닫기 (Esc)
                      </button>
                    </div>
                  </div>

                  {/* 내용: FavoritesSectionNew를 그대로 삽입 (내부 스크롤) */}
                  <div className="max-h-[300px] overflow-auto p-4 max-w-[1200px] mx-auto">
                    {hasFav ? (
                      <FavoritesSectionNew
                        favoritesData={favoritesData}
                        onUpdateFavorites={setFavoritesData}
                        onShowGuide={() => setShowOnboarding(true)}
                        onSaveData={() => toast.success("설정이 저장되었습니다!")}
                        onRequestLogin={() => setIsLoginModalOpen(true)}
                        isLoggedIn={!!user}
                      />
                    ) : (
                      <div className="text-sm text-gray-600">
                        아직 즐겨찾기가 없습니다. 사이트 카드의 ★ 아이콘을 눌러 추가해보세요.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* startpage, contact, add-site, footer 는 SHOW_ONLY_CATEGORIES 일 땐 계속 숨김 */}
            {!SHOW_ONLY_CATEGORIES && currentView === "startpage" && (
              <StartPage
                favoritesData={favoritesData}
                onUpdateFavorites={setFavoritesData}
                onClose={() => setCurrentView("home")}
                showDescriptions={showDescriptions}
              />
            )}

            {!SHOW_ONLY_CATEGORIES && isContactModalOpen && (
              <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
              />
            )}

            {!SHOW_ONLY_CATEGORIES && isAddSiteModalOpen && (
              <AddWebsiteModal
                isOpen={isAddSiteModalOpen}
                onClose={() => setIsAddSiteModalOpen(false)}
                favoritesData={favoritesData}
                onAddSite={(_site, _folderId) => {}}
              />
            )}

            {!SHOW_ONLY_CATEGORIES && <Footer />}
          </div>
        )}
      </>
    </ErrorBoundary>
  );
}
