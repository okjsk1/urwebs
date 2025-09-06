import { describe, it, expect } from 'vitest';
import { hasFavorites } from '../src/utils/fav';

describe('hasFavorites', () => {
  it('returns false when no favorites exist', () => {
    expect(hasFavorites([], [])).toBe(false);
  });

  it('returns true when bookmarks contain an item', () => {
    expect(hasFavorites([], ['site1'])).toBe(true);
  });

  it('returns true when a folder contains an item', () => {
    expect(hasFavorites([{ items: ['site1'] }], [])).toBe(true);
  });

  it('returns true when a folder exists even without items', () => {
    expect(hasFavorites([{ items: [] }], [])).toBe(true);
  });
});
