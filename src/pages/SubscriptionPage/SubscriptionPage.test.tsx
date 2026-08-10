/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SubscriptionPage from './SubscriptionPage';
import { api } from '../../app/api';
import { writePendingPayment } from '../../constants/pendingPayment';
import { RECURRING_CONSENT_VERSION } from '../../constants/recurringConsent';
import { loyaltyReducer } from '../../state/loyalty/slice';

vi.mock('../../app/api', () => ({
  api: {
    loyalty: {
      fetchSubscriptionLevels: vi.fn(),
    },
    billing: {
      initRobokassaPayment: vi.fn(),
      getRecurringAgreement: vi.fn(),
    },
  },
}));

vi.mock('../../hooks/useClientSubscriptionWs', () => ({
  useClientSubscriptionWs: vi.fn(),
}));

vi.mock('../../hooks/useSubscriptionPriceNotice', () => ({
  useSubscriptionPriceNotice: () => ({
    notice: null,
    fetchState: 'idle',
    fetchError: null,
    submitting: null,
    submitError: null,
    isRetrying: false,
    load: vi.fn(),
    submitDecision: vi.fn(),
    clearSubmitError: vi.fn(),
  }),
}));

vi.mock('../../components/PwaInstallPrompt/PwaInstallPrompt', () => ({
  default: () => null,
}));

vi.mock('../../constants/pendingPayment', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../constants/pendingPayment')>();
  return {
    ...actual,
    writePendingPayment: vi.fn(),
  };
});

const levelsResponse = {
  items: [
    {
      id: 'tier-12',
      name: '12 литров',
      priceKopecks: 49900,
      monthlyVolumeMl: 12000,
      sortOrder: 1,
    },
  ],
};

function renderPage(path = '/home', profileOverrides: Record<string, unknown> = {}) {
  const store = configureStore({
    reducer: {
      loyalty: loyaltyReducer,
    },
    preloadedState: {
      loyalty: {
        clientList: { state: [], isLoading: false, isReject: false },
        clientProfile: {
          state: {
            tierName: null,
            subscriptionEndsAt: null,
            monthlyLimitMl: 0,
            dailyLimitMl: 0,
            active: true,
            qrPayload: 'qr',
            favoriteTasteKeys: [],
            ...profileOverrides,
          },
          isLoading: false,
          isReject: false,
          localRevision: 0,
          pendingFetchRevision: null,
        },
        waterHistoryList: {
          state: [],
          totalElements: null,
          isLoading: false,
          isReject: false,
        },
        sendCodeToPhone: { state: null, isLoading: false, isReject: false },
        checkCodeAndCreateClient: { state: null, isLoading: false, isReject: false },
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <SubscriptionPage />
      </MemoryRouter>
    </Provider>,
  );
}

async function openCheckoutModal() {
  const planButton = await screen.findByRole('button', { name: /тариф/i });
  fireEvent.click(planButton);
  await screen.findByTestId('checkout-auto-renew-row');
}

describe('SubscriptionPage Robokassa checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('api/accessToken', 'token');
    localStorage.setItem('api/refreshToken', 'refresh');

    vi.mocked(api.loyalty.fetchSubscriptionLevels).mockResolvedValue(levelsResponse);
    vi.mocked(api.billing.getRecurringAgreement).mockResolvedValue({
      agreement: null,
      capabilities: {
        canToggleAutoRenew: false,
        requiresNewParentPayment: false,
        requiresConsent: false,
      },
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('shows auto-renew opt-in in checkout modal (Robokassa only)', async () => {
    renderPage();
    await openCheckoutModal();

    expect(screen.getByTestId('checkout-auto-renew-row')).toBeTruthy();
    expect(screen.queryByTestId('payment-method-tabs')).toBeNull();
    expect(screen.getByTestId('checkout-auto-renew-switch').getAttribute('aria-checked')).toBe(
      'false',
    );
  });

  it('initializes Robokassa without consentVersion when auto-renew is off', async () => {
    vi.mocked(api.billing.initRobokassaPayment).mockResolvedValue({
      paymentId: 'pay-rob',
      paymentUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx?test=1',
      provider: 'ROBOKASSA',
      amountKopecks: 49900,
      expiresAt: '2026-09-10T12:00:00.000Z',
    });

    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: 'http://localhost/m/ABC123/home' },
    });

    renderPage('/m/ABC123/home');
    await openCheckoutModal();
    fireEvent.click(screen.getByTestId('subscription-pay-button'));

    await waitFor(() => {
      expect(api.billing.initRobokassaPayment).toHaveBeenCalledWith({
        subscriptionLevelId: 'tier-12',
        requestUuid: expect.any(String),
        autoRenew: false,
      });
    });

    expect(writePendingPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentId: 'pay-rob',
        returnPath: '/m/ABC123/home',
        machineSerial: 'ABC123',
        startedAt: expect.any(Number),
      }),
    );

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('does not expose SBP payment UI in checkout', async () => {
    renderPage();
    await openCheckoutModal();

    expect(screen.queryByTestId('payment-method-sbp')).toBeNull();
    expect(screen.queryByTestId('payment-method-robokassa')).toBeNull();
    expect(screen.queryByLabelText('Оплата СБП')).toBeNull();
  });

  it('ignores same-frame double-clicks on pay CTA', async () => {
    type InitResponse = Awaited<ReturnType<typeof api.billing.initRobokassaPayment>>;
    let resolveInit!: (value: InitResponse) => void;

    vi.mocked(api.billing.initRobokassaPayment).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveInit = resolve;
        }),
    );

    renderPage();
    await openCheckoutModal();

    const payButton = screen.getByTestId('subscription-pay-button');
    fireEvent.click(payButton);
    fireEvent.click(payButton);

    expect(api.billing.initRobokassaPayment).toHaveBeenCalledTimes(1);

    resolveInit({
      paymentId: 'pay-rob',
      paymentUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx?test=1',
      provider: 'ROBOKASSA',
      amountKopecks: 49900,
      expiresAt: '2026-09-10T12:00:00.000Z',
    });
  });

  it('requires consent modal before Robokassa init when auto-renew is on', async () => {
    vi.mocked(api.billing.initRobokassaPayment).mockResolvedValue({
      paymentId: 'pay-rob',
      paymentUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx?test=1',
      provider: 'ROBOKASSA',
      amountKopecks: 49900,
      expiresAt: '2026-09-10T12:00:00.000Z',
    });

    renderPage();
    await openCheckoutModal();
    fireEvent.click(screen.getByTestId('checkout-auto-renew-switch'));
    fireEvent.click(screen.getByTestId('subscription-pay-button'));

    expect(screen.getByTestId('recurring-consent-modal')).toBeTruthy();
    expect(api.billing.initRobokassaPayment).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('recurring-consent-checkbox'));
    fireEvent.click(screen.getByTestId('recurring-consent-accept'));

    await waitFor(() => {
      expect(api.billing.initRobokassaPayment).toHaveBeenCalledWith({
        subscriptionLevelId: 'tier-12',
        requestUuid: expect.any(String),
        autoRenew: true,
        consentVersion: RECURRING_CONSENT_VERSION,
      });
    });
  });
});

describe('SubscriptionPage requiresNewParentPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('api/accessToken', 'token');
    localStorage.setItem('api/refreshToken', 'refresh');

    vi.mocked(api.loyalty.fetchSubscriptionLevels).mockResolvedValue(levelsResponse);
    vi.mocked(api.billing.getRecurringAgreement).mockResolvedValue({
      agreement: null,
      capabilities: {
        canToggleAutoRenew: false,
        requiresNewParentPayment: true,
        requiresConsent: false,
      },
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('opens checkout with auto-renew forced from CTA', async () => {
    renderPage('/home', {
      tierName: '12 литров',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 12000,
    });

    const cta = await screen.findByTestId('recurring-enable-new-parent-cta');
    fireEvent.click(cta);

    await screen.findByTestId('checkout-auto-renew-row');
    expect(screen.getByTestId('checkout-auto-renew-switch').getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(screen.queryByTestId('payment-method-tabs')).toBeNull();
  });
});
