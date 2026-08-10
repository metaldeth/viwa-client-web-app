/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { useRecurringAgreement } from './useRecurringAgreement';
import { api } from '../app/api';

vi.mock('../app/api', () => ({
  api: {
    billing: {
      getRecurringAgreement: vi.fn(),
      patchRecurringAgreement: vi.fn(),
    },
  },
}));

describe('useRecurringAgreement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches agreement when enabled', async () => {
    vi.mocked(api.billing.getRecurringAgreement).mockResolvedValue({
      agreement: null,
      capabilities: {
        canToggleAutoRenew: false,
        requiresNewParentPayment: true,
        requiresConsent: false,
      },
    });

    const { result } = renderHook(() => useRecurringAgreement(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.billing.getRecurringAgreement).toHaveBeenCalledTimes(1);
    expect(result.current.data?.capabilities.requiresNewParentPayment).toBe(true);
  });

  it('patchAgreement updates data after PATCH', async () => {
    vi.mocked(api.billing.getRecurringAgreement).mockResolvedValue({
      agreement: {
        status: 'ACTIVE',
        autoRenewEnabled: true,
        nextChargeAt: null,
        parentInvoiceId: '1',
        consentVersion: '2026-08-recurring-v1',
        consentedAt: '2026-08-10T12:00:00.000Z',
      },
      capabilities: {
        canToggleAutoRenew: true,
        requiresNewParentPayment: false,
        requiresConsent: false,
      },
    });

    vi.mocked(api.billing.patchRecurringAgreement).mockResolvedValue({
      agreement: {
        status: 'DISABLED',
        autoRenewEnabled: false,
        nextChargeAt: null,
        parentInvoiceId: '1',
        consentVersion: '2026-08-recurring-v1',
        consentedAt: '2026-08-10T12:00:00.000Z',
      },
      capabilities: {
        canToggleAutoRenew: true,
        requiresNewParentPayment: false,
        requiresConsent: true,
      },
    });

    const { result } = renderHook(() => useRecurringAgreement(true));

    await waitFor(() => {
      expect(result.current.data?.agreement?.status).toBe('ACTIVE');
    });

    await act(async () => {
      await result.current.patchAgreement({ enabled: false });
    });

    await waitFor(() => {
      expect(result.current.data?.agreement?.status).toBe('DISABLED');
    });

    expect(api.billing.patchRecurringAgreement).toHaveBeenCalledWith({ enabled: false });
  });

  it('surfaces localized error message on fetch failure', async () => {
    vi.mocked(api.billing.getRecurringAgreement).mockRejectedValue({
      code: 'RECURRING_PARENT_REQUIRED',
    });

    const { result } = renderHook(() => useRecurringAgreement(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      'Не удалось продлить абонемент автоматически. Привяжите карту заново.',
    );
  });
});
