import { describe, it, expect } from 'vitest';
import { toggleFavorite } from '../src/utils/favorites';
import type { FavoritesData } from '../src/types';

describe('favorites management', () => {
  it('adds a favorite when not present', () => {
    const data: FavoritesData = {
      items: [{ id: 'site2', parentId: null }],
      folders: [],
      widgets: [],
      layout: ['item:site2'],
    };
    const updated = toggleFavorite(data, 'site1');
    expect(updated.items[0].id).toBe('site1');
    expect(updated.items[1].id).toBe('site2');
    expect(updated.layout[0]).toBe('item:site1');
    expect(updated.layout[1]).toBe('item:site2');
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
