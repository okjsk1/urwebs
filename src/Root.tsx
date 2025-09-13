// src/Root.tsx
import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import BoardList from "./pages/BoardList";
import PostDetail from "./pages/PostDetail";
import PostWrite from "./pages/PostWrite";
import MainLanding from "./pages/MainLanding";
import CategoryStartPage from "./pages/CategoryStartPage";
import RealEstateRoleSelect from "./pages/RealEstateRoleSelect";
import PersonaOverview from "./pages/PersonaOverview";
import { PersonaPicker } from "@/modules/insurance/PersonaPicker";
import InsurancePersonaPage from "@/modules/insurance/PersonaPage";

function RoutedCategoryStartPage() {
  const { slug = "architecture" } = useParams();
  return (
    <CategoryStartPage
      categorySlug={slug}
      title="나의 시작페이지"
      storageNamespace={`favorites:${slug}`}
    />
  );
}

function RoutedRealEstateRoleStartPage() {
  const { role = "student" } = useParams();
  const titleMap = {
    student: "부동산 - 학생",
    agent: "부동산 - 공인중개사",
    tenant: "부동산 - 임차인",
    landlord: "부동산 - 임대인",
    investor: "부동산 - 투자자",
  } as const;
  const categoryTitle = titleMap[role as keyof typeof titleMap] ?? "부동산";
  return (
    <CategoryStartPage
      categorySlug={`realestate-${role}`}
      title="나의 시작페이지"
      storageNamespace={`favorites:realestate-${role}`}
      categoryTitleOverride={categoryTitle}
    />
  );
}

function RedirectFieldsToCategory() {
  const { slug } = useParams();
  return <Navigate to={`/category/${slug ?? ""}`} replace />;
}

export default function Root() {
  return (
    <AppErrorBoundary>
      <>
        <Routes>
          <Route path="/" element={<MainLanding />} />
          {/* 구 라우트 호환: /fields/:slug -> /category/:slug */}
          <Route path="/fields/:slug" element={<RedirectFieldsToCategory />} />
          <Route path="/personas" element={<PersonaOverview />} />
          <Route path="/category/realestate" element={<RealEstateRoleSelect />} />
          <Route
            path="/category/realestate/:role"
            element={<RoutedRealEstateRoleStartPage />}
          />
          <Route path="/category/insurance" element={<PersonaPicker />} />
          <Route
            path="/category/insurance/:persona"
            element={<InsurancePersonaPage />}
          />
          <Route path="/category/:slug" element={<RoutedCategoryStartPage />} />
          <Route
            path="/architecture"
            element={<Navigate to="/category/architecture" replace />}
          />
          <Route
            path="/realestate"
            element={<Navigate to="/category/realestate" replace />}
          />
          <Route
            path="/stocks"
            element={<Navigate to="/category/stocks" replace />}
          />
          <Route
            path="/webdev"
            element={<Navigate to="/category/webdev" replace />}
          />
          <Route
            path="/start"
            element={<Navigate to="/category/architecture" replace />}
          />
          <Route path="/notice" element={<BoardList board="notice" />} />
          <Route path="/free" element={<BoardList board="free" />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/write" element={<PostWrite />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-center" />
      </>
    </AppErrorBoundary>
  );
}
