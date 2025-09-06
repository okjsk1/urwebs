import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../firebase";

const LS_KEY = "urwebs_collect_guide_dismissed";

export function useCollectGuide(user: User | null) {
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (user) {
          const ref = doc(db, "users", user.uid, "settings", "collectGuide");
          const snap = await getDoc(ref);
          const data = snap.exists() ? snap.data() : {};
          setShowGuide((data as any).showCollectGuide !== false);
        } else {
          setShowGuide(!localStorage.getItem(LS_KEY));
        }
      } catch (e) {
        console.error("Failed to load collect guide", e);
        setShowGuide(false);
      }
    }
    load();
  }, [user]);

  const dismiss = async () => {
    setShowGuide(false);
    try {
      if (user) {
        const ref = doc(db, "users", user.uid, "settings", "collectGuide");
        await setDoc(ref, { showCollectGuide: false }, { merge: true });
      } else {
        localStorage.setItem(LS_KEY, "1");
      }
    } catch (e) {
      console.error("Failed to save collect guide state", e);
    }
  };

  return { showGuide, dismiss };
}
