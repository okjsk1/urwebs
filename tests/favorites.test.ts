import { describe, it, expect } from 'vitest';
import { toggleFavorite } from '../src/utils/favorites';
import type { FavoritesData } from '../src/types';

describe('favorites management', () => {
  it('adds a favorite when not present', () => {
    const data: FavoritesData = { items: [], folders: [], widgets: [] };
    const updated = toggleFavorite(data, 'site1');
    expect(updated.items).toContain('site1');
  });

  it('removes a favorite when present', () => {
    const data: FavoritesData = { items: ['site1'], folders: [], widgets: [] };
    const updated = toggleFavorite(data, 'site1');
    expect(updated.items).not.toContain('site1');
  });
});
