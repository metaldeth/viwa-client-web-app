/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import PlanSummaryCard from './PlanSummaryCard';

describe('PlanSummaryCard', () => {
  it('renders offer banner with recommended plan data and opens modal', () => {
    const onOpen = vi.fn();

    render(
      <PlanSummaryCard
        plan={{
          variant: 'offer',
          tierName: '12 литров',
          priceKopecks: 49900,
          monthlyVolumeMl: 12000,
          levelId: 'tier-12',
          isRecommended: true,
          subscriptionEndsAt: null,
        }}
        isLoading={false}
        isTrial
        onOpen={onOpen}
      />,
    );

    expect(screen.getByText('ПЕРЕЙТИ НА АБОНЕМЕНТ')).toBeTruthy();
    expect(screen.getByText('ПРОБНЫЙ ЛИТР')).toBeTruthy();
    expect(screen.getByText('12 литров')).toBeTruthy();
    expect(screen.getByText('12 л / мес')).toBeTruthy();
    expect(screen.getByText('499 ₽ / мес')).toBeTruthy();
    expect(screen.getByText('ВЫБРАТЬ ТАРИФ')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /тариф/i }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('renders current-plan banner with expiry and manage CTA', () => {
    const onOpen = vi.fn();

    render(
      <PlanSummaryCard
        plan={{
          variant: 'current',
          tierName: '18 литров',
          priceKopecks: 69900,
          monthlyVolumeMl: 18000,
          levelId: 'tier-18',
          isRecommended: false,
          subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
        }}
        isLoading={false}
        onOpen={onOpen}
      />,
    );

    expect(screen.getByText('ТВОЙ ТАРИФ')).toBeTruthy();
    expect(screen.getByText('18 литров')).toBeTruthy();
    expect(screen.getByText('18 л / мес')).toBeTruthy();
    expect(screen.getByText('699 ₽ / мес')).toBeTruthy();
    expect(screen.getByText(/Действует до/i)).toBeTruthy();
    expect(screen.getByText('УПРАВЛЯТЬ / ПРОДЛИТЬ')).toBeTruthy();
    expect(screen.queryByText('ПРОБНЫЙ ЛИТР')).toBeNull();
  });

  it('omits price and volume when active tier does not match levels API', () => {
    render(
      <PlanSummaryCard
        plan={{
          variant: 'current',
          tierName: 'Legacy VIP',
          priceKopecks: null,
          monthlyVolumeMl: null,
          levelId: null,
          isRecommended: false,
          subscriptionEndsAt: '2099-06-15T00:00:00.000Z',
        }}
        isLoading={false}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByText('Legacy VIP')).toBeTruthy();
    expect(screen.queryByText(/л \/ мес/)).toBeNull();
    expect(screen.queryByText(/₽ \/ мес/)).toBeNull();
    expect(screen.getByText(/Действует до/i)).toBeTruthy();
  });

  it('stays clickable while loading', () => {
    const onOpen = vi.fn();

    render(<PlanSummaryCard plan={null} isLoading onOpen={onOpen} />);

    const button = screen.getByRole('button', { name: /тариф/i });
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(false);

    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
