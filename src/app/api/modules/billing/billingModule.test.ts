import BillingModule, {
  BILLING_POLL_INTERVAL_MS,
  BILLING_POLL_MAX_MS,
  buildUnifiedPaymentStatusPath,
} from './billingModule';
import { viwaTelemetryApiUrl } from '../../../../consts';

describe('billingModule', () => {
  it('initRobokassaPayment posts to robokassa init with request body', async () => {
    const post = vi.fn().mockResolvedValue({
      paymentId: 'pay-1',
      paymentUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx?...',
      provider: 'ROBOKASSA',
      amountKopecks: 49900,
      expiresAt: '2026-08-10T12:00:00.000Z',
    });
    const module = new BillingModule({ post, get: vi.fn() } as never);

    const body = {
      subscriptionLevelId: 'tier-1',
      requestUuid: 'req-1',
      autoRenew: true,
      consentVersion: '2026-08-recurring-v1',
    };

    const response = await module.initRobokassaPayment(body);

    expect(post).toHaveBeenCalledWith(`${viwaTelemetryApiUrl}/client/billing/robokassa/init`, body);
    expect(response.provider).toBe('ROBOKASSA');
    expect(response.paymentUrl).toContain('robokassa.ru');
  });

  it('getPaymentStatus uses unified payments status path', async () => {
    const get = vi.fn().mockResolvedValue({
      status: 'PENDING',
      provider: 'ROBOKASSA',
    });
    const module = new BillingModule({ get, post: vi.fn() } as never);

    await module.getPaymentStatus('pay-42');

    expect(get).toHaveBeenCalledWith(buildUnifiedPaymentStatusPath('pay-42'));
    expect(get).toHaveBeenCalledWith(
      `${viwaTelemetryApiUrl}/client/billing/payments/pay-42/status`,
    );
  });

  it('getRecurringAgreement fetches recurring endpoint', async () => {
    const get = vi.fn().mockResolvedValue({
      agreement: null,
      capabilities: {
        canToggleAutoRenew: false,
        requiresNewParentPayment: true,
        requiresConsent: false,
      },
    });
    const module = new BillingModule({ get, post: vi.fn() } as never);

    await module.getRecurringAgreement();

    expect(get).toHaveBeenCalledWith(`${viwaTelemetryApiUrl}/client/billing/recurring`);
  });

  it('patchRecurringAgreement patches recurring endpoint', async () => {
    const patch = vi.fn().mockResolvedValue({
      agreement: {
        status: 'DISABLED',
        autoRenewEnabled: false,
        nextChargeAt: null,
        parentInvoiceId: '123',
        consentVersion: '2026-08-recurring-v1',
        consentedAt: '2026-08-10T12:00:00.000Z',
      },
      capabilities: {
        canToggleAutoRenew: true,
        requiresNewParentPayment: false,
        requiresConsent: true,
      },
    });
    const module = new BillingModule({ patch, get: vi.fn(), post: vi.fn() } as never);

    await module.patchRecurringAgreement({ enabled: false });

    expect(patch).toHaveBeenCalledWith(`${viwaTelemetryApiUrl}/client/billing/recurring`, {
      enabled: false,
    });
  });

  it('keeps SBP initSubscriptionPayment path unchanged', async () => {
    const post = vi.fn().mockResolvedValue({
      paymentId: 'pay-sbp',
      sbpQrUrl: 'https://qr.example',
      amountKopecks: 49900,
      expiresAt: '2026-08-10T12:00:00.000Z',
    });
    const module = new BillingModule({ post, get: vi.fn() } as never);

    await module.initSubscriptionPayment({
      subscriptionLevelId: 'tier-1',
      requestUuid: 'req-sbp',
    });

    expect(post).toHaveBeenCalledWith(
      `${viwaTelemetryApiUrl}/client/billing/subscription-payments/init`,
      {
        subscriptionLevelId: 'tier-1',
        requestUuid: 'req-sbp',
      },
    );
  });

  it('exports polling constants for return flow', () => {
    expect(BILLING_POLL_INTERVAL_MS).toBe(2000);
    expect(BILLING_POLL_MAX_MS).toBe(120000);
  });
});
