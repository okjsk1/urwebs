import type { Auth, User } from "firebase/auth";

export function assertAuthed(auth: Auth): User {
  const u = auth.currentUser;
  if (!u) throw new Error("Unauthenticated");
  return u;
}
