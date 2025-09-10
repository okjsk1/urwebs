// src/Root.tsx
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import BoardList from "./pages/BoardList";
import PostDetail from "./pages/PostDetail";
import PostWrite from "./pages/PostWrite";
import MainLanding from "./pages/MainLanding";
import CategoryStartPage from "./pages/CategoryStartPage";
import FieldPage from "./pages/FieldPage";

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

export default function Root() {
  return (
    <AppErrorBoundary>
      <>
        <Routes>
          <Route path="/" element={<MainLanding />} />
          <Route path="/fields/:slug" element={<FieldPage />} />
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
