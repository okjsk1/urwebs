import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebase";
import { parseFavoritesData } from "../utils/validation";
import { hasFavorites } from "../utils/fav";

const LS_FAV = "urwebs-favorites-v3";

export function useHasFavorites(uiMode: "discovery" | "collect") {
  const [hasFav, setHasFav] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (uiMode !== "collect") {
        setHasFav(false);
        setLoading(false);
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        try {
          const raw = localStorage.getItem(LS_FAV);
          const fav = parseFavoritesData(raw ? JSON.parse(raw) : undefined);
          if (!cancelled) {
            setHasFav(hasFavorites(fav.folders, fav.items));
          }
        } catch {
          if (!cancelled) setHasFav(false);
        }
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const q1 = query(collection(db, "users", user.uid, "bookmarks"), limit(1));
        const q2 = query(collection(db, "users", user.uid, "folders"), limit(1));
        const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        if (!cancelled) {
          setHasFav(!s1.empty || !s2.empty);
        }
      } catch {
        if (!cancelled) setHasFav(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [uiMode]);

  return { hasFav, loading };
}

