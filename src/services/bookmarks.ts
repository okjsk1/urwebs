import { doc, setDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { guestStore, Bookmark } from "./guestStore";
import { stripUndefined } from "../utils/sanitize";

export async function saveBookmark(input: Omit<Bookmark, "id">) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    const id = crypto.randomUUID();
    guestStore.add({ id, ...input });
    return { mode: "guest", id } as const;
  }
  const id = crypto.randomUUID();
  const ref = doc(db, "users", user.uid, "bookmarks", id);
  const payload = stripUndefined({
    title: input.title || "(제목 없음)",
    url: input.url,
    favicon: input.favicon ?? null,
    folderId: input.folderId ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await setDoc(ref, payload, { merge: true });
  return { mode: "authed", id } as const;
}

export function setupGuestMigration() {
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const items = guestStore.list();
    if (!items.length) return;
    const batch = writeBatch(db);
    items.forEach((bm) => {
      const id = bm.id || crypto.randomUUID();
      const ref = doc(db, "users", user.uid, "bookmarks", id);
      batch.set(
        ref,
        stripUndefined({
          title: bm.title || "(제목 없음)",
          url: bm.url,
          favicon: bm.favicon ?? null,
          folderId: bm.folderId ?? null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
        { merge: true }
      );
    });
    await batch.commit();
    guestStore.clear();
  });
}
