// favorites와 folders 구조를 튼튼하게 검사해서 "실제 아이템이 1개 이상이면 true"
export function hasFavorites(
  folders: Array<{ items?: string[] }> = [],
  bookmarks: string[] = []
): boolean {
  const hasItems = Array.isArray(bookmarks) && bookmarks.some(Boolean);
  const hasFolders = Array.isArray(folders) && folders.length > 0;
  const hasFolderItems =
    Array.isArray(folders) &&
    folders.some((f) => Array.isArray(f?.items) && f.items.some(Boolean));
  return hasItems || hasFolderItems || hasFolders;
}
