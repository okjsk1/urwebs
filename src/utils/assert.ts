// src/utils/assert.ts
import type { Auth } from 'firebase/auth';

export function assertAuthed(auth: Auth) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User is not authenticated');
  }
  return user;
}
