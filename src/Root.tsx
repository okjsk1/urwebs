import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import BoardList from "./pages/BoardList";
import PostDetail from "./pages/PostDetail";
import PostWrite from "./pages/PostWrite";
import { AppErrorBoundary } from "./components/AppErrorBoundary";

export default function Root() {
  return (
    <AppErrorBoundary>
      <>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/notice" element={<BoardList board="notice" />} />
          <Route path="/free" element={<BoardList board="free" />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/write" element={<PostWrite />} />
        </Routes>
        <Toaster position="top-center" />
      </>
    </AppErrorBoundary>
  );
}
