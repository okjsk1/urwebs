import { describe, it, expect } from 'vitest';
import { toggleFavorite, sortWebsitesByFavorites } from '../src/utils/favorites';
import type { FavoritesData, Website } from '../src/types';

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

  it('sorts websites so favorites come first', () => {
    const sites: Website[] = [
      { id: 'a', category: 'c', title: 'A', url: 'a', description: '' },
      { id: 'b', category: 'c', title: 'B', url: 'b', description: '' },
      { id: 'c', category: 'c', title: 'C', url: 'c', description: '' },
    ];
    const sorted = sortWebsitesByFavorites(sites, ['b', 'c']);
    expect(sorted.map((s) => s.id)).toEqual(['b', 'c', 'a']);
  });
});
