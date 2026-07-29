import { buildFavoriteTasteSlots } from './favoriteTastesSlots';
import type { FavoriteTasteCatalogEntry } from './favoriteTastesSlots';

const catalog = new Map<string, FavoriteTasteCatalogEntry>([
  ['raspberry', { nameRu: 'Малина' }],
  ['lime', { nameRu: 'Лайм' }],
  ['peach-mango', { nameRu: 'Персик-манго' }],
]);

describe('favoriteTastesSlots', () => {
  it('always returns exactly 3 slots preserving API top order', () => {
    const slots = buildFavoriteTasteSlots(['raspberry', 'lime', 'peach-mango'], catalog);

    expect(slots).toHaveLength(3);
    expect(slots.map((slot) => slot.rank)).toEqual([1, 2, 3]);
    expect(slots.every((slot) => slot.kind === 'filled')).toBe(true);
    expect(slots[0]).toMatchObject({ kind: 'filled', mediaKey: 'raspberry', nameRu: 'Малина' });
    expect(slots[1]).toMatchObject({ kind: 'filled', mediaKey: 'lime', nameRu: 'Лайм' });
    expect(slots[2]).toMatchObject({
      kind: 'filled',
      mediaKey: 'peach-mango',
      nameRu: 'Персик-манго',
    });
  });

  it('fills remaining slots with placeholders for 0-2 favorites', () => {
    const slots = buildFavoriteTasteSlots(['lime'], catalog);

    expect(slots).toHaveLength(3);
    expect(slots[0]).toMatchObject({ kind: 'filled', mediaKey: 'lime' });
    expect(slots[1]).toMatchObject({ kind: 'placeholder', rank: 2 });
    expect(slots[2]).toMatchObject({ kind: 'placeholder', rank: 3 });
  });

  it('never pads with fake favorites beyond API keys', () => {
    const slots = buildFavoriteTasteSlots([], catalog);
    expect(slots.every((slot) => slot.kind === 'placeholder')).toBe(true);
  });

  it('uses mediaKey label before catalog enrichment', () => {
    const slots = buildFavoriteTasteSlots(['raspberry'], new Map());
    expect(slots[0]).toMatchObject({ kind: 'filled', mediaKey: 'raspberry', nameRu: 'raspberry' });
  });
});
