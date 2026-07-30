/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import RemainingVolumeBar from './RemainingVolumeBar';

describe('RemainingVolumeBar', () => {
  it('shows remaining caption and dual segments', () => {
    const { container } = render(<RemainingVolumeBar remainingMl={700} limitMl={1000} />);

    expect(screen.getByText('ОСТАЛОСЬ')).toBeTruthy();
    expect(screen.getByText('700')).toBeTruthy();
    expect(screen.getByText('ИЗ 1000 МЛ')).toBeTruthy();

    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('700');
    expect(bar.getAttribute('aria-valuemax')).toBe('1000');

    const goal = container.querySelector('[style*="width: 30%"]');
    expect(goal).toBeTruthy();
  });
});
