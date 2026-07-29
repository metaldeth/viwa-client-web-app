import { api } from '../app/api';
import {
  loadPublicTastesCatalog,
  resetPublicTastesCatalogCacheForTests,
} from './publicTastesCatalogCache';

vi.mock('../app/api', () => ({
  api: {
    publicApi: {
      fetchPublicTastes: vi.fn(),
    },
  },
}));

const fetchPublicTastes = vi.mocked(api.publicApi.fetchPublicTastes);

const mockItems = [
  { mediaKey: 'raspberry', nameRu: 'Малина', sortOrder: 0 },
  { mediaKey: 'lime', nameRu: 'Лайм', sortOrder: 1 },
];

describe('publicTastesCatalogCache', () => {
  beforeEach(() => {
    resetPublicTastesCatalogCacheForTests();
    fetchPublicTastes.mockReset();
  });

  it('returns cached items on subsequent calls without refetching', async () => {
    fetchPublicTastes.mockResolvedValue({ items: mockItems });

    const first = await loadPublicTastesCatalog();
    const second = await loadPublicTastesCatalog();

    expect(first).toEqual(mockItems);
    expect(second).toEqual(mockItems);
    expect(fetchPublicTastes).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent in-flight requests', async () => {
    let resolveFetch!: (value: { items: typeof mockItems }) => void;
    fetchPublicTastes.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const pendingA = loadPublicTastesCatalog();
    const pendingB = loadPublicTastesCatalog();

    resolveFetch({ items: mockItems });

    const [resultA, resultB] = await Promise.all([pendingA, pendingB]);

    expect(resultA).toEqual(mockItems);
    expect(resultB).toEqual(mockItems);
    expect(fetchPublicTastes).toHaveBeenCalledTimes(1);
  });

  it('clears pending request on error so a retry can refetch', async () => {
    fetchPublicTastes
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ items: mockItems });

    await expect(loadPublicTastesCatalog()).rejects.toThrow('network down');
    await expect(loadPublicTastesCatalog()).resolves.toEqual(mockItems);

    expect(fetchPublicTastes).toHaveBeenCalledTimes(2);
  });
});
