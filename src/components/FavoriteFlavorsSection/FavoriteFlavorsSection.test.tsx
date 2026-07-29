/**
 * @vitest-environment jsdom
 */
import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import FavoriteFlavorsSection from './FavoriteFlavorsSection';

const fetchPublicTastes = vi.fn();

vi.mock('../../app/api', () => ({
  api: {
    publicApi: {
      fetchPublicTastes: (...args: unknown[]) => fetchPublicTastes(...args),
    },
  },
}));

const mockCatalog = [
  { mediaKey: 'cherry', nameRu: 'Чёрная вишня', sortOrder: 0 },
  { mediaKey: 'lime', nameRu: 'Лайм', sortOrder: 1 },
  { mediaKey: 'orange', nameRu: 'Апельсин', sortOrder: 2 },
  { mediaKey: 'watermelon', nameRu: 'Арбуз', sortOrder: 3 },
];

function FavoriteFlavorsHarness() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  return (
    <FavoriteFlavorsSection
      selectedKeys={selectedKeys}
      onSelectionChange={async (keys) => {
        setSelectedKeys(keys);
      }}
    />
  );
}

describe('FavoriteFlavorsSection', () => {
  beforeEach(() => {
    fetchPublicTastes.mockReset();
    fetchPublicTastes.mockResolvedValue({ items: mockCatalog });
  });

  it('CW06-2: enforces max 3 selection in UI', async () => {
    render(<FavoriteFlavorsHarness />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Чёрная вишня/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /Чёрная вишня/i }));
    fireEvent.click(screen.getByRole('button', { name: /Лайм/i }));
    fireEvent.click(screen.getByRole('button', { name: /Апельсин/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Арбуз/i }).hasAttribute('disabled')).toBe(true);
    });

    fireEvent.click(screen.getByRole('button', { name: /Арбуз/i }));
    expect(screen.getByRole('button', { name: /Арбуз/i }).hasAttribute('disabled')).toBe(true);
  });
});
