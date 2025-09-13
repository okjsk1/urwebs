// src/Root.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import BoardList from "./pages/BoardList";
import PostDetail from "./pages/PostDetail";
import PostWrite from "./pages/PostWrite";
import MainLanding from "./pages/MainLanding";
import RealEstateRoleSelect from "./pages/RealEstateRoleSelect";
import PersonaOverview from "./pages/PersonaOverview";
import { PersonaPicker } from "@/modules/insurance/PersonaPicker";
import InsurancePersonaPage from "@/modules/insurance/PersonaPage";


export default function Root() {
  return (
    <AppErrorBoundary>
      <>
        <Routes>
          <Route path="/" element={<MainLanding />} />
          <Route path="/personas" element={<PersonaOverview />} />
          <Route path="/category/realestate" element={<RealEstateRoleSelect />} />
          <Route path="/category/insurance" element={<PersonaPicker />} />
          <Route
            path="/category/insurance/:persona"
            element={<InsurancePersonaPage />}
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
