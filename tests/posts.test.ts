import { describe, it, expect, beforeEach, vi } from 'vitest';

// In-memory store for posts
const posts: any[] = [];

vi.mock('firebase/firestore', () => ({
  collection: () => ({}),
  query: (_col: any, ...conds: any[]) => ({ conds }),
  where: (field: string, _op: string, value: any) => ({ type: 'where', field, value }),
  orderBy: (field: string, direction: string) => ({ type: 'orderBy', field, direction }),
  limit: (n: number) => ({ type: 'limit', n }),
  startAfter: (last: any) => ({ type: 'startAfter', last }),
  getDocs: async (q: any) => {
    let result = posts;
    const boardCond = q.conds.find((c: any) => c.type === 'where' && c.field === 'board');
    if (boardCond) result = result.filter((p) => p.board === boardCond.value);
    const pinnedCond = q.conds.find((c: any) => c.type === 'where' && c.field === 'pinned');
    if (pinnedCond) result = result.filter((p) => p.pinned === pinnedCond.value);
    const orderCond = q.conds.find((c: any) => c.type === 'orderBy');
    if (orderCond) result = result.slice().sort((a, b) => b.createdAt - a.createdAt);
    const limitCond = q.conds.find((c: any) => c.type === 'limit');
    if (limitCond) result = result.slice(0, limitCond.n);
    return { docs: result.map((p) => ({ id: p.id, data: () => p })) };
  },
  addDoc: async (_col: any, data: any) => {
    const id = String(posts.length + 1);
    posts.push({ id, ...data });
    return { id };
  },
  doc: (_db: any, _col: string, id: string) => ({ id }),
  getDoc: async (ref: any) => {
    const post = posts.find((p) => p.id === ref.id);
    return { exists: () => !!post, id: ref.id, data: () => post };
  },
  updateDoc: async (ref: any, data: any) => {
    const idx = posts.findIndex((p) => p.id === ref.id);
    if (idx >= 0) posts[idx] = { ...posts[idx], ...data };
  },
  deleteDoc: async (ref: any) => {
    const idx = posts.findIndex((p) => p.id === ref.id);
    if (idx >= 0) posts.splice(idx, 1);
  },
  serverTimestamp: () => Date.now(),
  increment: (n: number) => n,
}));

import { createPost, listPosts } from '../src/libs/posts.repo';

describe('posts repository', () => {
  beforeEach(() => {
    posts.length = 0;
  });

  it('creates a post and lists it', async () => {
    const id = await createPost({
      board: 'free',
      title: 'Hello',
      content: 'World',
      authorUid: 'u1',
      authorName: 'User',
      pinned: false,
    });

    const { posts: listed } = await listPosts('free');
    const found = listed.find((p) => p.id === id);
    expect(found).toBeTruthy();
    expect(found?.title).toBe('Hello');
  });
});
