import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import {
  FavoritesData,
  FavoriteFolder,
  Widget,
  FavoritesDataMeta,
} from "../types";

export interface FavoritesDataWithMeta extends FavoritesData {
  meta?: FavoritesDataMeta;
}

function mergeIds(a: string[] = [], b: string[] = []): string[] {
  return Array.from(new Set([...(a || []), ...(b || [])]));
}

function mergeFolders(
  a: FavoriteFolder[] = [],
  b: FavoriteFolder[] = []
): FavoriteFolder[] {
  const map = new Map<string, FavoriteFolder>();
  a.forEach((f) => map.set(f.id, { ...f }));
  b.forEach((f) => {
    if (map.has(f.id)) {
      const cur = map.get(f.id)!;
      cur.items = mergeIds(cur.items, f.items);
    } else {
      map.set(f.id, { ...f });
    }
  });
  return Array.from(map.values());
}

function mergeWidgets(a: Widget[] = [], b: Widget[] = []): Widget[] {
  const map = new Map<string, Widget>();
  a.forEach((w) => map.set(w.id, { ...w }));
  b.forEach((w) => {
    if (!map.has(w.id)) {
      map.set(w.id, { ...w });
    }
  });
  return Array.from(map.values());
}

export async function pullUserState(uid: string): Promise<FavoritesDataWithMeta> {
  const ref = doc(db, "favorites", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as FavoritesDataWithMeta;
  }
  return { items: [], folders: [], widgets: [] };
}

export async function pushUserState(
  uid: string,
  data: FavoritesData
): Promise<void> {
  const ref = doc(db, "favorites", uid);
  const meta: FavoritesDataMeta = {
    updatedAt: Date.now(),
    source: "cloud",
  };
  await setDoc(ref, { ...data, meta }, { merge: true });
}

export function mergeLocalAndCloud(
  local: FavoritesData,
  cloud: FavoritesData
): FavoritesData {
  const localTime = local?.meta?.updatedAt || 0;
  const cloudTime = cloud?.meta?.updatedAt || 0;
  const base = localTime >= cloudTime ? local : cloud;
  const other = base === local ? cloud : local;
  return {
    items: mergeIds(base.items, other.items),
    folders: mergeFolders(base.folders, other.folders),
    widgets: mergeWidgets(base.widgets, other.widgets),
    itemsSortMode: base.itemsSortMode,
    meta: { updatedAt: Date.now(), source: base.meta?.source },
  };
}

export async function saveVersion(
  uid: string,
  data: FavoritesData,
  meta?: FavoritesDataMeta
): Promise<void> {
  const versionsRef = collection(db, "favorites_versions", uid, "items");
  const timestamp = Date.now();
  await setDoc(doc(versionsRef, String(timestamp)), {
    ...data,
    meta: { ...(meta || {}), updatedAt: timestamp },
    timestamp,
  });
  const q = query(versionsRef, orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  let count = 0;
  const deletions: Promise<void>[] = [];
  snap.forEach((d) => {
    count++;
    if (count > 20) {
      deletions.push(deleteDoc(d.ref));
    }
  });
  await Promise.all(deletions);
}

