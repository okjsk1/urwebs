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
import RealEstateRoleSelect from "./pages/RealEstateRoleSelect";
import { DomainPersonaPicker } from "@/modules/category/DomainPersonaPicker";
import DomainPersonaPage from "@/modules/category/DomainPersonaPage";
import RegistryDiagnose from "@/modules/category/RegistryDiagnose";
import { registry } from "@/modules/category/registry";

function CategorySwitch() {
  const { domain = "architecture" } = useParams();
  if (registry.domains[domain]) {
    return <DomainPersonaPicker />;
  }
  return (
    <CategoryStartPage
      categorySlug={domain}
      title="나의 시작페이지"
      storageNamespace={`favorites:${domain}`}
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

export default function Root() {
  return (
    <AppErrorBoundary>
      <>
        <Routes>
          <Route path="/" element={<MainLanding />} />
          <Route path="/fields/:slug" element={<FieldPage />} />
          <Route path="/category/realestate" element={<RealEstateRoleSelect />} />
          <Route
            path="/category/realestate/:role"
            element={<RoutedRealEstateRoleStartPage />}
          />
          <Route
            path="/category/:domain/:persona"
            element={<DomainPersonaPage />}
          />
          <Route path="/category/:domain" element={<CategorySwitch />} />
          <Route path="/__registry-diagnose" element={<RegistryDiagnose />} />
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
