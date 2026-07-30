/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import MonthlyProgressCard from './MonthlyProgressCard';

describe('MonthlyProgressCard', () => {
  it('renders remaining caption and dual goal/remaining arcs', () => {
    const { container } = render(
      <MonthlyProgressCard
        progress={{
          usedMl: 300,
          limitMl: 1000,
          remainingMl: 700,
          percent: 30,
          isTrial: false,
        }}
        subscriptionEndsAt="2026-08-15T00:00:00.000Z"
      />,
    );

    expect(screen.getByText('ОСТАЛОСЬ')).toBeTruthy();
    expect(screen.getByText('700')).toBeTruthy();
    expect(screen.queryByText('300')).toBeNull();
    expect(screen.getByText('ИЗ 1000 МЛ')).toBeTruthy();
    expect(screen.getByText(/Действует до/i)).toBeTruthy();
    expect(screen.queryByText(/сегодня/i)).toBeNull();

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('700');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('1000');

    expect(container.querySelectorAll('line').length).toBeGreaterThan(20);
    const paths = Array.from(container.querySelectorAll('path'));
    expect(paths.length).toBeGreaterThanOrEqual(3);
    expect(paths.some((p) => p.getAttribute('stroke') === '#A6FFE0')).toBe(true);
  });

  it('shows trial status when plan has no end date', () => {
    render(
      <MonthlyProgressCard
        progress={{
          usedMl: 0,
          limitMl: 1000,
          remainingMl: 1000,
          percent: 0,
          isTrial: true,
        }}
        subscriptionEndsAt={null}
      />,
    );

    expect(screen.getByText('Пробный абонемент активен')).toBeTruthy();
    expect(screen.queryByText(/Действует до/i)).toBeNull();
  });
});
