/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import {
  SubscriptionPriceConsentPanel,
  SubscriptionPriceNoticeFetchError,
} from './SubscriptionPriceConsentPanel';
import type { SubscriptionPriceNoticeDTO } from '../../types/subscriptionPriceNotice';

const baseNotice: SubscriptionPriceNoticeDTO = {
  scheduleId: 'sched-1',
  currentPriceKopecks: 49900,
  newPriceKopecks: 59900,
  effectiveAt: '2026-09-01T00:00:00.000Z',
  latestDecision: null,
  tierName: '12 литров',
};

describe('SubscriptionPriceConsentPanel', () => {
  it('renders pending consent with current/new prices and non-dismissable actions', () => {
    const onAccept = vi.fn();
    const onDecline = vi.fn();

    render(
      <SubscriptionPriceConsentPanel
        notice={baseNotice}
        submitting={null}
        submitError={null}
        onAccept={onAccept}
        onDecline={onDecline}
      />,
    );

    const panel = screen.getByTestId('subscription-price-consent-panel');
    expect(panel.getAttribute('role')).toBe('status');
    expect(panel.getAttribute('aria-live')).toBe('polite');

    expect(screen.getByText('Изменение цены абонемента')).toBeTruthy();
    expect(screen.getByText(/Тариф «12 литров»/)).toBeTruthy();
    expect(screen.getByText('499 ₽ / мес')).toBeTruthy();
    expect(screen.getByText('599 ₽ / мес')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Согласен' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Отказываюсь' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Закрыть' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Согласен' }));
    fireEvent.click(screen.getByRole('button', { name: 'Отказываюсь' }));
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  it('renders compact accepted state with change decision action', () => {
    render(
      <SubscriptionPriceConsentPanel
        notice={{ ...baseNotice, latestDecision: 'ACCEPTED' }}
        submitting={null}
        submitError={null}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );

    expect(screen.getByText('Новая цена принята')).toBeTruthy();
    expect(screen.getByText(/599 ₽ \/ мес/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Отказываюсь' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Изменить решение' })).toBeTruthy();
  });

  it('renders declined state with accept and review actions', () => {
    const onAccept = vi.fn();

    render(
      <SubscriptionPriceConsentPanel
        notice={{ ...baseNotice, latestDecision: 'DECLINED' }}
        submitting={null}
        submitError={null}
        onAccept={onAccept}
        onDecline={vi.fn()}
      />,
    );

    expect(screen.getByText('Продление по новой цене отклонено')).toBeTruthy();
    expect(screen.getByText(/Продление после/)).toBeTruthy();
    expect(screen.getByText(/недоступно/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Согласиться' }));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('shows inline submit error in pending state', () => {
    render(
      <SubscriptionPriceConsentPanel
        notice={baseNotice}
        submitting={null}
        submitError="Не удалось сохранить решение. Попробуйте ещё раз."
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert').textContent).toMatch(/Не удалось сохранить решение/);
  });

  it('disables actions while submitting', () => {
    render(
      <SubscriptionPriceConsentPanel
        notice={baseNotice}
        submitting="ACCEPTED"
        submitError={null}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Согласен' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Отказываюсь' }).hasAttribute('disabled')).toBe(true);
  });

  it('expands full consent UI after change decision from accepted state', () => {
    render(
      <SubscriptionPriceConsentPanel
        notice={{ ...baseNotice, latestDecision: 'ACCEPTED' }}
        submitting={null}
        submitError={null}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Изменить решение' }));
    expect(screen.getByRole('button', { name: 'Отказываюсь' })).toBeTruthy();
  });
});

describe('SubscriptionPriceNoticeFetchError', () => {
  it('renders fetch error with retry action', () => {
    const onRetry = vi.fn();

    render(
      <SubscriptionPriceNoticeFetchError
        message="Не удалось загрузить уведомление об изменении цены."
        onRetry={onRetry}
      />,
    );

    const panel = screen.getByTestId('subscription-price-notice-fetch-error');
    expect(panel.getAttribute('role')).toBe('status');
    expect(panel.getAttribute('aria-live')).toBe('polite');

    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
