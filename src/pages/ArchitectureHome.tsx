import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StartPage } from "../components/StartPage";
import type { FavoritesData } from "../types";
import { loadFavoritesData } from "../utils/startPageStorage";

export default function ArchitectureHome() {
  const navigate = useNavigate();
  const [favoritesData, setFavoritesData] = useState<FavoritesData>(() =>
    loadFavoritesData()
  );

  return (
    <StartPage
      favoritesData={favoritesData}
      onUpdateFavorites={setFavoritesData}
      onClose={() => navigate("/")}
      showDescriptions={true}
    />
  );
}

