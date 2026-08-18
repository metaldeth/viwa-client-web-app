/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import PlanSummaryCard from './PlanSummaryCard';

describe('PlanSummaryCard', () => {
  it('renders offer banner with flavored volume and subscription water benefit', () => {
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
        waterBenefitVariant="trial"
        onOpen={onOpen}
      />,
    );

    expect(screen.getByText('ПЕРЕЙТИ НА АБОНЕМЕНТ')).toBeTruthy();
    expect(screen.getByText('ПРОБНЫЙ ЛИТР')).toBeTruthy();
    expect(screen.getByText('12 литров')).toBeTruthy();
    expect(screen.getByText('12 л вкусовых / мес')).toBeTruthy();
    expect(screen.getByText(/\+ вода безлимитно/i)).toBeTruthy();
    expect(screen.queryByText('12 л / мес')).toBeNull();
    expect(screen.getByText('499 ₽ / мес')).toBeTruthy();
    expect(screen.getByText('ВЫБРАТЬ ТАРИФ')).toBeTruthy();

    const button = screen.getByRole('button', { name: /тариф/i });
    expect(button.getAttribute('aria-label')).toMatch(/вкусовых/i);
    expect(button.getAttribute('aria-label')).toMatch(/без сиропа/i);

    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('renders current-plan banner with active water benefit', () => {
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
        waterBenefitVariant="active"
        onOpen={onOpen}
      />,
    );

    expect(screen.getByText('ТВОЙ ТАРИФ')).toBeTruthy();
    expect(screen.getByText('18 л вкусовых / мес')).toBeTruthy();
    expect(screen.getByText('Вода безлимитно')).toBeTruthy();
    expect(screen.getByText(/Действует до/i)).toBeTruthy();
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
        waterBenefitVariant="active"
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByText('Legacy VIP')).toBeTruthy();
    expect(screen.queryByText(/вкусовых/)).toBeNull();
    expect(screen.getByText('Вода безлимитно')).toBeTruthy();
  });

  it('stays clickable while loading', () => {
    const onOpen = vi.fn();

    render(<PlanSummaryCard plan={null} isLoading waterBenefitVariant="trial" onOpen={onOpen} />);

    const button = screen.getByRole('button', { name: /тариф/i });
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(false);

    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
