import { Routes, Route } from "react-router-dom";
import App from "./App";
import BoardList from "./pages/BoardList";
import PostDetail from "./pages/PostDetail";
import PostWrite from "./pages/PostWrite";

export default function Root() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/notice" element={<BoardList board="notice" />} />
      <Route path="/free" element={<BoardList board="free" />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="/write" element={<PostWrite />} />
    </Routes>
  );
}
