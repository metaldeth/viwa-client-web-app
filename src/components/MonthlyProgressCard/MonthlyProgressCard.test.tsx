/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import MonthlyProgressCard from './MonthlyProgressCard';

describe('MonthlyProgressCard', () => {
  it('renders remaining/limit semantic progressbar with gauge', () => {
    render(
      <MonthlyProgressCard
        progress={{
          usedMl: 780,
          limitMl: 1000,
          remainingMl: 220,
          percent: 78,
          isTrial: false,
        }}
      />,
    );

    expect(screen.getByText('220')).toBeTruthy();
    expect(screen.queryByText('780')).toBeNull();
    expect(screen.getByText('ИЗ 1000 МЛ')).toBeTruthy();

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('220');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('1000');
    expect(progressbar.getAttribute('aria-valuemin')).toBe('0');

    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('1000')).toBeTruthy();
  });

  it('does not show today label', () => {
    render(
      <MonthlyProgressCard
        progress={{
          usedMl: 300,
          limitMl: 1000,
          remainingMl: 700,
          percent: 30,
          isTrial: false,
        }}
      />,
    );

    expect(screen.getByText('700')).toBeTruthy();
    expect(screen.queryByText(/сегодня/i)).toBeNull();
  });
});
