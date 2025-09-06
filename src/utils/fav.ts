export function hasFavorites(folders: any[] = [], bookmarks: any[] = []) {
  const folderHas = folders?.some(f => (f.items?.length ?? 0) > 0);
  const bmHas = (bookmarks?.length ?? 0) > 0;
  return folderHas || bmHas;
}
