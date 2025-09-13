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
import PersonaOverview from "./pages/PersonaOverview";
import InsurancePersonaPage from "@/modules/insurance/PersonaPage";
import PersonaSelectPage from "./pages/PersonaSelectPage";
import { personaCategories } from "@/data/personas";

function RoutedCategoryPage() {
  const { slug = "architecture" } = useParams<{ slug: string }>();

  const personaCategory = personaCategories.find(
    (p) => slug === p.slug || slug.startsWith(`${p.slug}-`),
  );

  if (personaCategory) {
    const baseSlug = personaCategory.slug;
    const persona = slug === baseSlug ? undefined : slug.slice(baseSlug.length + 1);

    if (!persona && personaCategory.items.length > 1) {
      return <PersonaSelectPage slug={baseSlug} />;
    }

    if (baseSlug === "insurance") {
      return <InsurancePersonaPage persona={persona ?? ""} />;
    }
  }

  return (
    <CategoryStartPage
      categorySlug={slug}
      title="나의 시작페이지"
      storageNamespace={`favorites:${slug}`}
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
          <Route path="/category/:slug" element={<RoutedCategoryPage />} />
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
