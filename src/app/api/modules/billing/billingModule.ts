import { AbstractApiModule } from '../../abstractApiModule';
import { viwaTelemetryApiUrl } from '../../../../consts';
import type {
  InitSubscriptionPaymentRequest,
  InitSubscriptionPaymentResponse,
  PaymentPollResponse,
  SubscriptionPollResponse,
} from '../../../../types/billing';

const POLL_INTERVAL_MS = 2_000;
const POLL_MAX_MS = 120_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class BillingModule extends AbstractApiModule {
  initSubscriptionPayment(body: InitSubscriptionPaymentRequest) {
    return this.request.post<InitSubscriptionPaymentRequest, InitSubscriptionPaymentResponse>(
      `${viwaTelemetryApiUrl}/client/billing/subscription-payments/init`,
      body,
    );
  }

  getPaymentStatus(paymentId: string) {
    return this.request.get<void, PaymentPollResponse>(
      `${viwaTelemetryApiUrl}/client/billing/subscription-payments/${encodeURIComponent(paymentId)}/status`,
    );
  }

  getSubscriptionStatus(paymentId: string) {
    return this.request.get<void, SubscriptionPollResponse>(
      `${viwaTelemetryApiUrl}/client/billing/subscription-payments/${encodeURIComponent(paymentId)}/subscription`,
    );
  }

  async pollPaymentUntilPaid(paymentId: string): Promise<PaymentPollResponse> {
    const started = Date.now();

    while (Date.now() - started < POLL_MAX_MS) {
      const response = await this.getPaymentStatus(paymentId);

      if (response.status === 'PAID') {
        return response;
      }

      if (response.status === 'FAILED' || response.status === 'EXPIRED') {
        throw new Error(response.message || 'Оплата не прошла');
      }

      await sleep(POLL_INTERVAL_MS);
    }

    throw new Error('Время ожидания оплаты истекло');
  }

  async pollSubscriptionUntilCompleted(paymentId: string): Promise<SubscriptionPollResponse> {
    const started = Date.now();

    while (Date.now() - started < POLL_MAX_MS) {
      const response = await this.getSubscriptionStatus(paymentId);

      if (response.status === 'COMPLETED') {
        return response;
      }

      if (response.status === 'FAILED') {
        throw new Error(response.message || 'Не удалось подтвердить абонемент');
      }

      await sleep(POLL_INTERVAL_MS);
    }

    throw new Error('Время ожидания подтверждения абонемента истекло');
  }
}

export default BillingModule;
