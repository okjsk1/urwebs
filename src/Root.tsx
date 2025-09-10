import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import BoardList from "./pages/BoardList";
import PostDetail from "./pages/PostDetail";
import PostWrite from "./pages/PostWrite";
import MainLanding from "./pages/MainLanding";
import ArchitectureHome from "./pages/ArchitectureHome";
import RealEstateHome from "./pages/RealEstateHome";
import StocksHome from "./pages/StocksHome";
import StartPageWrapper from "./pages/StartPageWrapper";

export default function Root() {
  return (
    <AppErrorBoundary>
      <>
        <Routes>
          <Route path="/" element={<MainLanding />} />
          <Route path="/architecture" element={<ArchitectureHome />} />
          <Route path="/realestate" element={<RealEstateHome />} />
          <Route path="/stocks" element={<StocksHome />} />
          <Route path="/start" element={<StartPageWrapper />} />
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

