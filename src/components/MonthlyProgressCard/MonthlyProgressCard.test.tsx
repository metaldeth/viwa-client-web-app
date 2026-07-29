/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import MonthlyProgressCard from './MonthlyProgressCard';

describe('MonthlyProgressCard', () => {
  it('renders used/limit semantic progressbar', () => {
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

    expect(screen.getByText('780')).toBeTruthy();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('780');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('1000');
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('1000')).toBeTruthy();
  });
});
