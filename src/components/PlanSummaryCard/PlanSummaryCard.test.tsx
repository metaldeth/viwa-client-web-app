/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import PlanSummaryCard from './PlanSummaryCard';

describe('PlanSummaryCard', () => {
  it('shows API price and opens subscription modal', () => {
    const onOpen = vi.fn();

    render(
      <PlanSummaryCard
        plan={{
          tierName: '12 литров',
          priceKopecks: 49900,
          levelId: 'tier-12',
          isRecommended: true,
        }}
        isLoading={false}
        onOpen={onOpen}
      />,
    );

    expect(screen.getByText('499 ₽')).toBeTruthy();
    expect(screen.getByText('/ мес')).toBeTruthy();
    expect(screen.getByText('Выгоднее на 20%')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /тариф/i }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
