import { describe, it, expect } from 'vitest';
import { hasFavorites } from '../src/utils/fav';

describe('hasFavorites', () => {
  it('returns false when no favorites exist', () => {
    expect(hasFavorites([], [])).toBe(false);
  });

  it('returns true when bookmarks contain an item', () => {
    expect(hasFavorites([], [{ id: 'site1' }])).toBe(true);
  });

  it('returns true when a folder contains an item', () => {
    expect(
      hasFavorites(
        [{ id: 'f1', name: 'folder1' }],
        [{ id: 'site1', parentId: 'f1' }]
      )
    ).toBe(true);
  });

  it('returns true when a folder exists even without items', () => {
    expect(hasFavorites([{ id: 'f1', name: 'folder1' }], [])).toBe(true);
  });
});
