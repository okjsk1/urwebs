// src/Root.tsx
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import AppLandingPage from "@/app/page";
import StarterPackRoute from "@/app/StarterPackRoute";
import { AppErrorBoundary } from "./components/AppErrorBoundary";

export default function Root() {
  return (
    <AppErrorBoundary>
      <>
        <Routes>
          <Route path="/" element={<AppLandingPage />} />
          <Route path="/app" element={<AppLandingPage />} />
          <Route path="/app/:section/:topic" element={<StarterPackRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-center" />
      </>
    </AppErrorBoundary>
  );
}
