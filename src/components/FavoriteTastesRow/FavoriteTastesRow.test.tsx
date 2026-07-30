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

  { mediaKey: 'cherry', nameRu: 'Чёрная вишня', sortOrder: 3 },
];

describe('FavoriteTastesRow', () => {
  beforeEach(() => {
    loadPublicTastesCatalog.mockReset();

    loadPublicTastesCatalog.mockResolvedValue(mockCatalog);
  });

  it('shows favorites immediately while catalog is loading', () => {
    loadPublicTastesCatalog.mockReturnValue(new Promise(() => undefined));

    render(<FavoriteTastesRow favoriteKeys={['raspberry', 'lime']} />);

    expect(screen.getByText('raspberry')).toBeTruthy();

    expect(screen.getByText('lime')).toBeTruthy();

    expect(screen.getAllByText(/ДОЗА 1/i)).toHaveLength(1);

    expect(screen.getAllByText(/ДОЗА 2/i)).toHaveLength(1);

    expect(screen.queryByText('ПОПРОБУЙ ВКУС')).toBeNull();

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('waits for catalog before showing tastes when favorites are empty', () => {
    loadPublicTastesCatalog.mockReturnValue(new Promise(() => undefined));

    const { container } = render(<FavoriteTastesRow favoriteKeys={[]} />);

    expect(container.querySelector('ul')).toBeNull();

    expect(screen.queryByText('ПОПРОБУЙ ВКУС')).toBeNull();
  });

  it('shows all catalog tastes without dose ranks when favorites are empty', async () => {
    render(<FavoriteTastesRow favoriteKeys={[]} />);

    await waitFor(() => {
      expect(screen.getByText('Малина')).toBeTruthy();
    });

    expect(screen.getByText('Лайм')).toBeTruthy();

    expect(screen.getByText('Персик-манго')).toBeTruthy();

    expect(screen.getByText('Чёрная вишня')).toBeTruthy();

    expect(screen.queryByText(/ДОЗА/i)).toBeNull();

    expect(screen.queryByText('ПОПРОБУЙ ВКУС')).toBeNull();
  });

  it('shows favorites on catalog error and keeps dose ranks', async () => {
    loadPublicTastesCatalog.mockRejectedValue(new Error('catalog down'));

    render(<FavoriteTastesRow favoriteKeys={['raspberry']} />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeTruthy();
    });

    expect(screen.getByText('raspberry')).toBeTruthy();

    expect(screen.getByText(/ДОЗА 1/i)).toBeTruthy();

    expect(screen.queryByText('ПОПРОБУЙ ВКУС')).toBeNull();
  });

  it('shows error without taste row when catalog fails and favorites are empty', async () => {
    loadPublicTastesCatalog.mockRejectedValue(new Error('catalog down'));

    const { container } = render(<FavoriteTastesRow favoriteKeys={[]} />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeTruthy();
    });

    expect(container.querySelector('ul')).toBeNull();
  });

  it('enriches labels from catalog and shows full scrollable feed', async () => {
    render(<FavoriteTastesRow favoriteKeys={[...CABINET_PIXEL_FAVORITE_KEYS]} />);

    await waitFor(() => {
      expect(screen.getByText('Персик-манго')).toBeTruthy();
    });

    expect(screen.getAllByText(/ДОЗА/i).length).toBeGreaterThanOrEqual(3);

    expect(screen.getByText('Малина')).toBeTruthy();

    expect(screen.getByText('Чёрная вишня')).toBeTruthy();
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
