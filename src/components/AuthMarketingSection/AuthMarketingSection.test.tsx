/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AuthMarketingSection from './AuthMarketingSection';

const fetchPublicSubscriptionLevels = vi.fn();

vi.mock('../../app/api', () => ({
  api: {
    publicApi: {
      fetchPublicSubscriptionLevels: (...args: unknown[]) => fetchPublicSubscriptionLevels(...args),
    },
  },
}));

const mockLevels = {
  items: [
    {
      id: 'tier-12',
      name: '12 литров',
      monthlyVolumeMl: 12000,
      priceKopecks: 49900,
      sortOrder: 1,
    },
    {
      id: 'tier-18',
      name: '18 литров',
      monthlyVolumeMl: 18000,
      priceKopecks: 69900,
      sortOrder: 2,
      description: 'Больше вкусовых напитков каждый месяц',
    },
  ],
};

describe('AuthMarketingSection', () => {
  beforeEach(() => {
    fetchPublicSubscriptionLevels.mockReset();
    fetchPublicSubscriptionLevels.mockResolvedValue(mockLevels);
  });

  it('renders product copy and public tariff cards from API', async () => {
    render(<AuthMarketingSection />);

    expect(screen.getByTestId('auth-marketing-section')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Витаминная вода VIWA' })).toBeTruthy();
    expect(screen.getByText(/Лёгкая витаминная вода без сахара/i)).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Преимущества VIWA' })).toBeTruthy();
    expect(screen.getByText('Без сахара')).toBeTruthy();
    expect(screen.getByText('B3 · B6 · B12')).toBeTruthy();
    expect(screen.getByText('Mg · Zn')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByTestId('public-tariff-card-tier-12')).toBeTruthy();
    });

    const card = screen.getByTestId('public-tariff-card-tier-12');
    expect(card.getAttribute('aria-labelledby')).toBe('public-tariff-name-tier-12');
    expect(card.getAttribute('aria-describedby')).toBe('public-tariff-description-tier-12');
    expect(document.getElementById('public-tariff-description-tier-12')?.textContent).toContain(
      'Вкусовые напитки + вода безлимитно',
    );

    expect(screen.getByText('12 литров')).toBeTruthy();
    expect(screen.getByText('12 л вкусовых напитков')).toBeTruthy();
    expect(screen.getByText('499 ₽ / мес')).toBeTruthy();
    expect(
      screen.getByText('Вкусовые напитки + вода безлимитно (обычная, холодная, газированная)'),
    ).toBeTruthy();

    expect(screen.getByText('18 литров')).toBeTruthy();
    expect(screen.getByText('Больше вкусовых напитков каждый месяц')).toBeTruthy();
    expect(screen.getByText('699 ₽ / мес')).toBeTruthy();
  });

  it('shows localized empty message when API returns no tiers', async () => {
    fetchPublicSubscriptionLevels.mockResolvedValueOnce({ items: [] });

    render(<AuthMarketingSection />);

    expect(await screen.findByText('Нет доступных тарифов')).toBeTruthy();
    expect(screen.queryByTestId('public-tariff-card-tier-12')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Витаминная вода VIWA' })).toBeTruthy();
  });

  it('uses fallback description when API description is null', async () => {
    fetchPublicSubscriptionLevels.mockResolvedValueOnce({
      items: [
        {
          id: 'tier-12',
          name: '12 литров',
          monthlyVolumeMl: 12000,
          priceKopecks: 49900,
          sortOrder: 1,
          description: null,
        },
      ],
    });

    render(<AuthMarketingSection />);

    expect(await screen.findByTestId('public-tariff-card-tier-12')).toBeTruthy();
    expect(
      screen.getByText('Вкусовые напитки + вода безлимитно (обычная, холодная, газированная)'),
    ).toBeTruthy();
  });

  it('shows compact error with retry and keeps auth section usable', async () => {
    fetchPublicSubscriptionLevels
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(mockLevels);

    render(<AuthMarketingSection />);

    expect(await screen.findByText('Не удалось загрузить тарифы')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Повторить' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Витаминная вода VIWA' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));

    await waitFor(() => {
      expect(screen.getByTestId('public-tariff-card-tier-12')).toBeTruthy();
    });
    expect(fetchPublicSubscriptionLevels).toHaveBeenCalledTimes(2);
  });
});
