import { toggleFavoriteSelection, isFavoriteSelectionFull } from './favoriteTastesSelection';

describe('favoriteTastesSelection', () => {
  it('CW06-2: enforces max 3 selection', () => {
    const first = toggleFavoriteSelection([], 'cherry');
    expect(first).toEqual(['cherry']);

    const second = toggleFavoriteSelection(first!, 'lime');
    const third = toggleFavoriteSelection(second!, 'orange');
    expect(third).toHaveLength(3);
    expect(isFavoriteSelectionFull(third!)).toBe(true);

    const blocked = toggleFavoriteSelection(third!, 'watermelon');
    expect(blocked).toBeNull();
  });

  it('allows deselect then select another taste', () => {
    const selected = ['cherry', 'lime', 'orange'];
    const afterDeselect = toggleFavoriteSelection(selected, 'lime');
    expect(afterDeselect).toEqual(['cherry', 'orange']);

    const replaced = toggleFavoriteSelection(afterDeselect!, 'watermelon');
    expect(replaced).toEqual(['cherry', 'orange', 'watermelon']);
  });
});
