/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import MonthlyProgressCard from './MonthlyProgressCard';

const baseProgress = {
  usedMl: 300,
  limitMl: 1000,
  remainingMl: 700,
  percent: 30,
  isTrial: false,
};

describe('MonthlyProgressCard', () => {
  it('renders flavored drink gauge and active unlimited-water callout', () => {
    const { container } = render(
      <MonthlyProgressCard
        progress={baseProgress}
        subscriptionEndsAt="2026-08-15T00:00:00.000Z"
        waterBenefitVariant="active"
      />,
    );

    expect(screen.getByText('ПАКЕТ НАПИТКОВ')).toBeTruthy();
    expect(screen.getByText('ОСТАЛОСЬ')).toBeTruthy();
    expect(screen.getByText('700')).toBeTruthy();
    expect(screen.getByText('ИЗ 1000 МЛ НАПИТКОВ')).toBeTruthy();
    expect(screen.getByText(/Вода без сиропа безлимитно/i)).toBeTruthy();
    expect(screen.queryByText(/Пакет напитков израсходован/i)).toBeNull();

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('700');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('1000');
    expect(progressbar.getAttribute('aria-label')).toMatch(/700.*напитков/i);

    const benefit = screen.getByTestId('unlimited-water-benefit');
    expect(benefit.getAttribute('data-variant')).toBe('active');

    expect(container.querySelectorAll('line').length).toBeGreaterThan(20);
  });

  it('shows trial status and trial water benefit copy', () => {
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
        waterBenefitVariant="trial"
      />,
    );

    expect(screen.getByText('Пробный абонемент активен')).toBeTruthy();
    expect(screen.getByText(/Вода без сиропа безлимитно/i)).toBeTruthy();
    expect(screen.getByTestId('unlimited-water-benefit').getAttribute('data-variant')).toBe(
      'trial',
    );
  });

  it('shows expired water benefit and validity line', () => {
    render(
      <MonthlyProgressCard
        progress={baseProgress}
        subscriptionEndsAt="2025-01-01T00:00:00.000Z"
        waterBenefitVariant="expired"
      />,
    );

    expect(screen.getByText(/Вода без сиропа безлимитно/i)).toBeTruthy();
    expect(screen.getByTestId('unlimited-water-benefit').getAttribute('data-variant')).toBe(
      'expired',
    );
  });

  it('announces exhausted flavored package with status role', () => {
    render(
      <MonthlyProgressCard
        progress={{
          usedMl: 1000,
          limitMl: 1000,
          remainingMl: 0,
          percent: 100,
          isTrial: false,
        }}
        subscriptionEndsAt="2099-01-01T00:00:00.000Z"
        waterBenefitVariant="active"
        limitExhausted
      />,
    );

    expect(screen.getByRole('status').textContent).toBe('Пакет напитков израсходован');
    expect(screen.getByRole('progressbar').getAttribute('aria-label')).toBe(
      'Пакет напитков израсходован',
    );
  });

  it('keeps unlimited-water callout readable at 360px width', () => {
    render(
      <div data-testid="narrow-shell" style={{ width: '360px' }}>
        <MonthlyProgressCard
          progress={baseProgress}
          subscriptionEndsAt="2099-01-01T00:00:00.000Z"
          waterBenefitVariant="active"
        />
      </div>,
    );

    const shell = screen.getByTestId('narrow-shell');
    const benefit = screen.getByTestId('unlimited-water-benefit');
    expect(shell.style.width).toBe('360px');
    expect(benefit.textContent).toMatch(/Вода без сиропа безлимитно/i);
  });
});
