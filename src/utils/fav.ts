export function hasFavorites(folders: any[] = [], bookmarks: any[] = []) {
  const folderHasItems = folders?.some(f => (f.items?.length ?? 0) > 0);
  const bmHasItems = (bookmarks?.length ?? 0) > 0;
  return folderHasItems || bmHasItems;
}
