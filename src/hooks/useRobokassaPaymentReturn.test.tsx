/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  BILLING_POLL_INTERVAL_MS,
  BILLING_POLL_MAX_MS,
} from '../app/api/modules/billing/billingModule';
import { VIWA_PENDING_PAYMENT_KEY } from '../constants/pendingPayment';
import { useRobokassaPaymentReturn } from './useRobokassaPaymentReturn';
import { api } from '../app/api';
import { installBrowserStorageMocks } from '../test/browserMocks';

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../app/api', () => ({
  api: {
    billing: {
      getPaymentStatus: vi.fn(),
      getSubscriptionStatus: vi.fn(),
    },
  },
}));

function renderReturnHook(mode: 'success' | 'failed') {
  return renderHook(() => useRobokassaPaymentReturn({ mode }), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

describe('useRobokassaPaymentReturn', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
    navigateMock.mockReset();
    vi.mocked(api.billing.getPaymentStatus).mockReset();
    vi.mocked(api.billing.getSubscriptionStatus).mockReset();
  });

  it('exposes polling interval and max duration constants', () => {
    expect(BILLING_POLL_INTERVAL_MS).toBe(2000);
    expect(BILLING_POLL_MAX_MS).toBe(120000);
  });

  it('failed mode clears pending session and preserves error phase', async () => {
    sessionStorage.setItem(
      VIWA_PENDING_PAYMENT_KEY,
      JSON.stringify({
        paymentId: 'pay-1',
        startedAt: Date.now(),
        returnPath: '/home',
      }),
    );
    localStorage.setItem('api/accessToken', 'token');

    const { result } = renderReturnHook('failed');

    await waitFor(() => {
      expect(result.current.phase).toBe('error');
    });

    expect(sessionStorage.getItem(VIWA_PENDING_PAYMENT_KEY)).toBeNull();
    expect(localStorage.getItem('api/accessToken')).toBe('token');
    expect(api.billing.getPaymentStatus).not.toHaveBeenCalled();
  });

  it('success mode polls every 2s until PAID then subscription COMPLETED', async () => {
    sessionStorage.setItem(
      VIWA_PENDING_PAYMENT_KEY,
      JSON.stringify({
        paymentId: 'pay-2',
        startedAt: Date.now(),
        returnPath: '/m/VIWA-001/home',
      }),
    );

    vi.mocked(api.billing.getPaymentStatus)
      .mockResolvedValueOnce({ status: 'PENDING', provider: 'ROBOKASSA' })
      .mockResolvedValueOnce({
        status: 'PAID',
        provider: 'ROBOKASSA',
        paidAt: '2026-08-10T12:00:00.000Z',
      });

    vi.mocked(api.billing.getSubscriptionStatus).mockResolvedValue({
      status: 'COMPLETED',
      client: undefined,
    });

    const { result } = renderReturnHook('success');

    await waitFor(
      () => {
        expect(api.billing.getPaymentStatus).toHaveBeenCalledTimes(2);
      },
      { timeout: 5_000 },
    );

    await waitFor(() => {
      expect(result.current.phase).toBe('done');
    });

    expect(api.billing.getSubscriptionStatus).toHaveBeenCalledWith('pay-2');
    expect(navigateMock).toHaveBeenCalledWith('/m/VIWA-001/home', { replace: true });
    expect(sessionStorage.getItem(VIWA_PENDING_PAYMENT_KEY)).toBeNull();
  }, 10_000);

  it('continues polling on transient 5xx without clearing auth tokens', async () => {
    sessionStorage.setItem(
      VIWA_PENDING_PAYMENT_KEY,
      JSON.stringify({
        paymentId: 'pay-3',
        startedAt: Date.now(),
        returnPath: '/home',
      }),
    );
    localStorage.setItem('api/accessToken', 'token');

    vi.mocked(api.billing.getPaymentStatus)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ status: 'PAID', provider: 'ROBOKASSA' });

    vi.mocked(api.billing.getSubscriptionStatus).mockResolvedValue({
      status: 'COMPLETED',
    });

    renderReturnHook('success');

    await waitFor(
      () => {
        expect(api.billing.getPaymentStatus).toHaveBeenCalledTimes(2);
      },
      { timeout: 5_000 },
    );

    expect(localStorage.getItem('api/accessToken')).toBe('token');
  }, 10_000);

  it('enters error phase when poll window expired', async () => {
    sessionStorage.setItem(
      VIWA_PENDING_PAYMENT_KEY,
      JSON.stringify({
        paymentId: 'pay-timeout',
        startedAt: Date.now() - BILLING_POLL_MAX_MS - 1_000,
        returnPath: '/home',
      }),
    );

    const { result } = renderReturnHook('success');

    await waitFor(() => {
      expect(result.current.phase).toBe('error');
    });

    expect(result.current.errorMessage).toBeTruthy();
    expect(api.billing.getPaymentStatus).not.toHaveBeenCalled();
  });

  it('navigates to machine home when returnPath is unsafe but machineSerial is set', async () => {
    sessionStorage.setItem(
      VIWA_PENDING_PAYMENT_KEY,
      JSON.stringify({
        paymentId: 'pay-unsafe',
        startedAt: Date.now(),
        returnPath: '//evil.test/phish',
        machineSerial: 'VIWA-001',
      }),
    );

    vi.mocked(api.billing.getPaymentStatus).mockResolvedValue({
      status: 'PAID',
      provider: 'ROBOKASSA',
    });

    vi.mocked(api.billing.getSubscriptionStatus).mockResolvedValue({
      status: 'COMPLETED',
    });

    const { result } = renderReturnHook('success');

    await waitFor(() => {
      expect(result.current.phase).toBe('done');
    });

    expect(navigateMock).toHaveBeenCalledWith('/m/VIWA-001/home', { replace: true });
    expect(result.current.returnPath).toBe('/m/VIWA-001/home');
  });

  it('cancels polling on unmount without navigating', async () => {
    sessionStorage.setItem(
      VIWA_PENDING_PAYMENT_KEY,
      JSON.stringify({
        paymentId: 'pay-unmount',
        startedAt: Date.now(),
        returnPath: '/home',
      }),
    );

    vi.mocked(api.billing.getPaymentStatus).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ status: 'PENDING', provider: 'ROBOKASSA' }), 50);
        }),
    );

    const { unmount } = renderReturnHook('success');

    await waitFor(() => {
      expect(api.billing.getPaymentStatus).toHaveBeenCalled();
    });

    unmount();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
