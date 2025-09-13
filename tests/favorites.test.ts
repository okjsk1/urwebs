import { describe, it, expect } from 'vitest';
import { toggleFavorite } from '../src/utils/favorites';
import type { FavoritesData } from '../src/types';

describe('favorites management', () => {
  it('adds a favorite when not present', () => {
    const data: FavoritesData = { items: [], folders: [], widgets: [], layout: [] };
    const updated = toggleFavorite(data, 'site1');
    expect(updated.items.some((i) => i.id === 'site1')).toBe(true);
  });

  it('removes a favorite when present', () => {
    const data: FavoritesData = {
      items: [{ id: 'site1' }],
      folders: [],
      widgets: [],
      layout: ['item:site1'],
    };
    const updated = toggleFavorite(data, 'site1');
    expect(updated.items.some((i) => i.id === 'site1')).toBe(false);
  });
});
