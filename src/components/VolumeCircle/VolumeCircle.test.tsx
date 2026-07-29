/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import VolumeCircle from './VolumeCircle';

describe('VolumeCircle', () => {
  it('CW06-1: renders monthly percent correctly for 3500/12000 ml', () => {
    const { container } = render(
      <VolumeCircle
        consumedVolume={3500}
        limitVolume={12000}
        centerValue={8500}
        percent={29}
        ariaLabel="Monthly progress 29 percent"
      />,
    );

    expect(container.textContent).toContain('8500');
    expect(container.textContent).toContain('29%');

    const progressbar = screen.getByRole('progressbar', { name: 'Monthly progress 29 percent' });
    expect(progressbar.getAttribute('aria-valuenow')).toBe('3500');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('12000');
    expect(progressbar.getAttribute('aria-valuemin')).toBe('0');
  });

  it('computes percent from consumed/limit when percent prop omitted', () => {
    const { container } = render(<VolumeCircle consumedVolume={9000} limitVolume={18000} />);

    expect(container.textContent).toContain('50%');
    expect(container.textContent).toContain('9000');
  });
});
