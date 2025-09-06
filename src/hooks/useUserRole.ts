import { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { getDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { getUserDocRef } from "../services/firestoreClient";

export function useUserRole() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(getUserDocRef(u.uid));
        setRole(snap.data()?.role || "user");
      } else {
        setRole(null);
      }
    });
    return () => unsub();
  }, []);

  return { user, role, isAdmin: role === "admin" };
}

export default useUserRole;
