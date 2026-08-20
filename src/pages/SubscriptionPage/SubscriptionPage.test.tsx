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

function getCheckbox(testId: string): HTMLInputElement {
  return screen.getByTestId(testId) as HTMLInputElement;
}

async function openCheckoutModal() {
  const planButton = await screen.findByRole('button', { name: /тариф/i });
  fireEvent.click(planButton);
  await screen.findByTestId('checkout-offer-accept-row');
}

function acceptBaseOffer() {
  fireEvent.click(screen.getByTestId('checkout-offer-accept-checkbox'));
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

  it('shows checkout controls unchecked by default', async () => {
    renderPage();
    await openCheckoutModal();

    expect(getCheckbox('checkout-offer-accept-checkbox').checked).toBe(false);
    expect(getCheckbox('checkout-auto-renew-checkbox').checked).toBe(false);
    expect(screen.queryByTestId('checkout-recurring-consent-section')).toBeNull();
    expect(screen.getByTestId('subscription-pay-button').hasAttribute('disabled')).toBe(true);
    expect(screen.queryByTestId('payment-method-tabs')).toBeNull();
  });

  it('exposes accessible auto-renew labeling without duplicate aria-label', async () => {
    renderPage();
    await openCheckoutModal();

    const checkbox = getCheckbox('checkout-auto-renew-checkbox');
    expect(checkbox.getAttribute('aria-label')).toBeNull();
    expect(checkbox.id).toBeTruthy();
    expect(checkbox.getAttribute('aria-describedby')).toBeTruthy();

    const hint = document.getElementById(checkbox.getAttribute('aria-describedby')!);
    expect(hint?.textContent).toMatch(/действующей цене/i);
  });

  it('keeps offer link outside checkbox label with aria-describedby association', async () => {
    renderPage();
    await openCheckoutModal();

    const row = screen.getByTestId('checkout-offer-accept-row');
    const label = row.querySelector('label');
    const link = screen.getByTestId('checkout-offer-accept-link');
    const checkbox = getCheckbox('checkout-offer-accept-checkbox');

    expect(label?.contains(link)).toBe(false);
    expect(checkbox.getAttribute('aria-describedby')).toBe(link.id);
    expect(link.getAttribute('href')).toBe('/legal/oferta_663903715112.docx');
  });

  it('does not toggle offer checkbox when offer link is clicked', async () => {
    renderPage();
    await openCheckoutModal();

    const checkbox = getCheckbox('checkout-offer-accept-checkbox');
    fireEvent.click(screen.getByTestId('checkout-offer-accept-link'));
    expect(checkbox.checked).toBe(false);
  });

  it('blocks one-time Robokassa init until base offer is accepted', async () => {
    vi.mocked(api.billing.initRobokassaPayment).mockResolvedValue({
      paymentId: 'pay-rob',
      paymentUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx?test=1',
      provider: 'ROBOKASSA',
      amountKopecks: 49900,
      expiresAt: '2026-09-10T12:00:00.000Z',
    });

    renderPage();
    await openCheckoutModal();

    expect(screen.getByTestId('subscription-pay-button').hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByTestId('subscription-pay-button'));
    expect(api.billing.initRobokassaPayment).not.toHaveBeenCalled();

    acceptBaseOffer();
    expect(screen.getByTestId('subscription-pay-button').hasAttribute('disabled')).toBe(false);
    fireEvent.click(screen.getByTestId('subscription-pay-button'));

    await waitFor(() => {
      expect(api.billing.initRobokassaPayment).toHaveBeenCalledWith({
        subscriptionLevelId: 'tier-12',
        requestUuid: expect.any(String),
        autoRenew: false,
      });
    });
  });

  it('initializes Robokassa without consentVersion for one-time checkout', async () => {
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
    acceptBaseOffer();
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

  it('ignores same-frame double-clicks on pay CTA after offer acceptance', async () => {
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
    acceptBaseOffer();

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

  it('resets checkout checking state after bfcache return from Robokassa', async () => {
    vi.mocked(api.billing.initRobokassaPayment).mockImplementation(
      () => new Promise(() => undefined),
    );

    renderPage();
    await openCheckoutModal();
    acceptBaseOffer();
    fireEvent.click(screen.getByTestId('subscription-pay-button'));

    await waitFor(() => {
      expect(screen.getByText('Проверяем оплату…')).toBeTruthy();
    });

    const pageShow = new Event('pageshow');
    Object.defineProperty(pageShow, 'persisted', { configurable: true, value: true });
    window.dispatchEvent(pageShow);

    await waitFor(() => {
      expect(screen.queryByText('Проверяем оплату…')).toBeNull();
    });
    expect(screen.getByTestId('subscription-pay-button').hasAttribute('disabled')).toBe(false);
  });

  it('requires base offer and recurring consent before recurring Robokassa init', async () => {
    vi.mocked(api.billing.initRobokassaPayment).mockResolvedValue({
      paymentId: 'pay-rob',
      paymentUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx?test=1',
      provider: 'ROBOKASSA',
      amountKopecks: 49900,
      expiresAt: '2026-09-10T12:00:00.000Z',
    });

    renderPage();
    await openCheckoutModal();
    fireEvent.click(screen.getByTestId('checkout-auto-renew-checkbox'));

    expect(screen.getByTestId('checkout-recurring-consent-section')).toBeTruthy();
    expect(screen.queryByTestId('checkout-recurring-consent-details')).toBeNull();
    fireEvent.click(screen.getByTestId('checkout-recurring-consent-details-toggle'));
    expect(screen.getByTestId('checkout-recurring-consent-details')).toBeTruthy();
    expect(screen.getByTestId('subscription-pay-button').hasAttribute('disabled')).toBe(true);
    expect(screen.queryByTestId('recurring-consent-modal')).toBeNull();

    acceptBaseOffer();
    expect(screen.getByTestId('subscription-pay-button').hasAttribute('disabled')).toBe(true);

    fireEvent.click(screen.getByTestId('checkout-recurring-consent-checkbox'));
    expect(screen.getByTestId('subscription-pay-button').hasAttribute('disabled')).toBe(false);

    fireEvent.click(screen.getByTestId('subscription-pay-button'));

    await waitFor(() => {
      expect(api.billing.initRobokassaPayment).toHaveBeenCalledWith({
        subscriptionLevelId: 'tier-12',
        requestUuid: expect.any(String),
        autoRenew: true,
        consentVersion: RECURRING_CONSENT_VERSION,
      });
    });

    expect(RECURRING_CONSENT_VERSION).toBe('2026-08-recurring-v3');
  });

  it('clears recurring consent when auto-renew is unchecked', async () => {
    renderPage();
    await openCheckoutModal();

    fireEvent.click(screen.getByTestId('checkout-auto-renew-checkbox'));
    fireEvent.click(screen.getByTestId('checkout-recurring-consent-checkbox'));
    fireEvent.click(screen.getByTestId('checkout-auto-renew-checkbox'));

    expect(screen.queryByTestId('checkout-recurring-consent-section')).toBeNull();
    expect(getCheckbox('checkout-auto-renew-checkbox').checked).toBe(false);
  });

  it('resets all checkout consent state when modal is reopened', async () => {
    renderPage();
    await openCheckoutModal();

    acceptBaseOffer();
    fireEvent.click(screen.getByTestId('checkout-auto-renew-checkbox'));
    fireEvent.click(screen.getByTestId('checkout-recurring-consent-checkbox'));

    fireEvent.click(screen.getByLabelText('Закрыть'));
    await waitFor(() => {
      expect(screen.queryByTestId('checkout-offer-accept-row')).toBeNull();
    });

    await openCheckoutModal();

    expect(getCheckbox('checkout-offer-accept-checkbox').checked).toBe(false);
    expect(getCheckbox('checkout-auto-renew-checkbox').checked).toBe(false);
    expect(screen.queryByTestId('checkout-recurring-consent-section')).toBeNull();
    expect(screen.getByTestId('subscription-pay-button').hasAttribute('disabled')).toBe(true);
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

  it('opens checkout from CTA without pre-checking auto-renew or consent', async () => {
    renderPage('/home', {
      tierName: '12 литров',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 12000,
    });

    const cta = await screen.findByTestId('recurring-enable-new-parent-cta');
    fireEvent.click(cta);

    await screen.findByTestId('checkout-offer-accept-row');
    expect(getCheckbox('checkout-auto-renew-checkbox').checked).toBe(false);
    expect(getCheckbox('checkout-offer-accept-checkbox').checked).toBe(false);
    expect(screen.queryByTestId('checkout-recurring-consent-section')).toBeNull();
    expect(screen.getByTestId('subscription-pay-button').hasAttribute('disabled')).toBe(true);
    expect(screen.queryByTestId('payment-method-tabs')).toBeNull();
  });
});
