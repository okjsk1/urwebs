const LS_KEY = "urwebs_guest_bookmarks_v1";

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  favicon?: string | null;
  folderId?: string | null;
  createdAt?: number;
  updatedAt?: number;
};

export const guestStore = {
  list(): Bookmark[] {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {
      return [];
    }
  },
  add(bm: Bookmark) {
    const now = Date.now();
    const data = { ...bm, createdAt: now, updatedAt: now };
    const items = guestStore.list();
    items.unshift(data);
    localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, 500)));
    return data;
  },
  clear() {
    localStorage.removeItem(LS_KEY);
  },
};
