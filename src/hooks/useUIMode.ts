import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../firebase";

// Storage key for non-logged-in users
const LS_KEY = "urwebs_uiMode_v1";

export function useUIMode(user: User | null) {
  const [uiMode, setUiMode] = useState<"discovery" | "collect">("discovery");

  // Load initial state from Firestore or localStorage
  useEffect(() => {
    async function load() {
      try {
        if (user) {
          const ref = doc(db, "users", user.uid, "settings", "ui");
          const snap = await getDoc(ref);
          const data = snap.exists() ? snap.data() : {};
          if (data && (data as any).uiMode) {
            setUiMode((data as any).uiMode);
            return;
          }
        } else {
          const stored = localStorage.getItem(LS_KEY);
          if (stored === "collect" || stored === "discovery") {
            setUiMode(stored);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load uiMode", e);
      }
    }
    load();
  }, [user]);

  // Update body class when mode changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.toggle("is-collect", uiMode === "collect");
      document.body.classList.toggle("is-discovery", uiMode === "discovery");
    }
  }, [uiMode]);

  const update = async (mode: "discovery" | "collect") => {
    setUiMode(mode);
    try {
      if (user) {
        const ref = doc(db, "users", user.uid, "settings", "ui");
        await setDoc(ref, { uiMode: mode }, { merge: true });
      } else {
        localStorage.setItem(LS_KEY, mode);
      }
    } catch (e) {
      console.error("Failed to save uiMode", e);
    }
  };

  return { uiMode, setUIMode: update };
}

export type UIMode = "discovery" | "collect";
