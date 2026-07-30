import {
  buildCabinetTastesFeed,
  buildFavoriteTasteSlots,
  shuffleArray,
} from './favoriteTastesSlots';
import type { FavoriteTasteCatalogEntry, FavoriteTasteCatalogItem } from './favoriteTastesSlots';

const catalog = new Map<string, FavoriteTasteCatalogEntry>([
  ['raspberry', { nameRu: 'Малина' }],
  ['lime', { nameRu: 'Лайм' }],
  ['peach-mango', { nameRu: 'Персик-манго' }],
]);

const catalogItems: FavoriteTasteCatalogItem[] = [
  { mediaKey: 'raspberry', nameRu: 'Малина', sortOrder: 0 },
  { mediaKey: 'lime', nameRu: 'Лайм', sortOrder: 1 },
  { mediaKey: 'peach-mango', nameRu: 'Персик-манго', sortOrder: 2 },
  { mediaKey: 'cherry', nameRu: 'Чёрная вишня', sortOrder: 3 },
];

describe('favoriteTastesSlots', () => {
  describe('buildFavoriteTasteSlots (legacy TOP-3)', () => {
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
      expect(slots[0]).toMatchObject({
        kind: 'filled',
        mediaKey: 'raspberry',
        nameRu: 'raspberry',
      });
    });
  });

  describe('buildCabinetTastesFeed', () => {
    it('puts favorites first with dose ranks, then remaining catalog in sortOrder', () => {
      const feed = buildCabinetTastesFeed(['lime', 'cherry'], catalogItems);

      expect(feed).toHaveLength(4);
      expect(feed[0]).toMatchObject({ mediaKey: 'lime', nameRu: 'Лайм', rank: 1 });
      expect(feed[1]).toMatchObject({ mediaKey: 'cherry', nameRu: 'Чёрная вишня', rank: 2 });
      expect(feed[2]).toMatchObject({ mediaKey: 'raspberry', nameRu: 'Малина', rank: null });
      expect(feed[3]).toMatchObject({
        mediaKey: 'peach-mango',
        nameRu: 'Персик-манго',
        rank: null,
      });
    });

    it('uses mediaKey as label for favorites missing from catalog', () => {
      const feed = buildCabinetTastesFeed(['unknown-taste'], catalogItems);

      expect(feed[0]).toMatchObject({
        mediaKey: 'unknown-taste',
        nameRu: 'unknown-taste',
        rank: 1,
      });
      expect(feed.slice(1).every((item) => item.rank === null)).toBe(true);
    });

    it('returns all catalog tastes shuffled with no ranks when favorites empty', () => {
      let call = 0;
      const random = () => {
        call += 1;
        return call === 1 ? 0 : 0.5;
      };

      const feed = buildCabinetTastesFeed([], catalogItems, { random });

      expect(feed).toHaveLength(4);
      expect(feed.every((item) => item.rank === null)).toBe(true);
      expect(feed.map((item) => item.mediaKey).sort()).toEqual(
        catalogItems.map((item) => item.mediaKey).sort(),
      );
    });

    it('produces deterministic shuffle with injectable RNG', () => {
      const randomSequence = [0.9, 0.1, 0.5];
      let index = 0;
      const random = () => randomSequence[index++ % randomSequence.length];

      const first = buildCabinetTastesFeed([], catalogItems, { random });
      index = 0;
      const second = buildCabinetTastesFeed([], catalogItems, { random });

      expect(first.map((item) => item.mediaKey)).toEqual(second.map((item) => item.mediaKey));
    });
  });

  describe('shuffleArray', () => {
    it('returns a permutation of the input', () => {
      const input = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(input, () => 0);

      expect(shuffled.sort()).toEqual(input.sort());
      expect(shuffled).not.toBe(input);
    });
  });
});
