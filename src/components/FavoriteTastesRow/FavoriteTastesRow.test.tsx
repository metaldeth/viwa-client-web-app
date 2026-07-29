/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import FavoriteTastesRow from './FavoriteTastesRow';
import { CABINET_PIXEL_FAVORITE_KEYS } from '../../constants/cabinetPixelFixture';

const loadPublicTastesCatalog = vi.fn();

vi.mock('../../utils/publicTastesCatalogCache', () => ({
  loadPublicTastesCatalog: (...args: unknown[]) => loadPublicTastesCatalog(...args),
}));

const mockCatalog = [
  { mediaKey: 'raspberry', nameRu: 'Малина', sortOrder: 0 },
  { mediaKey: 'lime', nameRu: 'Лайм', sortOrder: 1 },
  { mediaKey: 'peach-mango', nameRu: 'Персик-манго', sortOrder: 2 },
];

describe('FavoriteTastesRow', () => {
  beforeEach(() => {
    loadPublicTastesCatalog.mockReset();
    loadPublicTastesCatalog.mockResolvedValue(mockCatalog);
  });

  it('renders exactly 3 slots immediately while catalog is loading', () => {
    loadPublicTastesCatalog.mockReturnValue(new Promise(() => undefined));

    render(<FavoriteTastesRow favoriteKeys={['raspberry', 'lime']} />);

    expect(screen.getAllByText(/ДОЗА/i)).toHaveLength(3);
    expect(screen.getByText('raspberry')).toBeTruthy();
    expect(screen.getByText('lime')).toBeTruthy();
    expect(screen.getAllByText('ПОПРОБУЙ ВКУС')).toHaveLength(1);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('keeps 3 slots visible when catalog fetch fails', async () => {
    loadPublicTastesCatalog.mockRejectedValue(new Error('catalog down'));

    render(<FavoriteTastesRow favoriteKeys={['raspberry']} />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeTruthy();
    });

    expect(screen.getAllByText(/ДОЗА/i)).toHaveLength(3);
    expect(screen.getByText('raspberry')).toBeTruthy();
    expect(screen.getAllByText('ПОПРОБУЙ ВКУС')).toHaveLength(2);
  });

  it('enriches labels from catalog when loaded', async () => {
    render(<FavoriteTastesRow favoriteKeys={[...CABINET_PIXEL_FAVORITE_KEYS]} />);

    await waitFor(() => {
      expect(screen.getByText('Персик-манго')).toBeTruthy();
    });

    expect(screen.getAllByText(/ДОЗА/i)).toHaveLength(3);
  });

  it('uses cabinet medallion asset paths for known tastes', async () => {
    const { container } = render(<FavoriteTastesRow favoriteKeys={['raspberry', 'lime']} />);

    await waitFor(() => {
      expect(screen.getByText('Малина')).toBeTruthy();
    });

    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThan(0);
    imgs.forEach((img) => {
      expect(img.getAttribute('src')).toMatch(/\/assets\/viwa\/tastes\/medallions\/.+\.png$/);
    });
  });
});
