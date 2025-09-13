// favorites와 folders 구조를 튼튼하게 검사해서 "실제 아이템이 1개 이상이면 true"
export function hasFavorites(
  folders: Array<unknown> = [],
  bookmarks: Array<{ id: string }> = []
): boolean {
  const hasItems = Array.isArray(bookmarks) && bookmarks.length > 0;
  const hasFolders = Array.isArray(folders) && folders.length > 0;
  return hasItems || hasFolders;
}
