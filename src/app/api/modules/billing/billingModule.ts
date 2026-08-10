import { AbstractApiModule } from '../../abstractApiModule';
import { viwaTelemetryApiUrl } from '../../../../consts';
import type {
  InitRobokassaPaymentRequest,
  InitRobokassaPaymentResponse,
  InitSubscriptionPaymentRequest,
  InitSubscriptionPaymentResponse,
  PaymentPollResponse,
  SubscriptionPollResponse,
} from '../../../../types/billing';
import type {
  PatchRecurringAgreementRequest,
  RecurringAgreementResponse,
} from '../../../../types/recurring';

export const BILLING_POLL_INTERVAL_MS = 2_000;
export const BILLING_POLL_MAX_MS = 120_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function buildUnifiedPaymentStatusPath(paymentId: string): string {
  return `${viwaTelemetryApiUrl}/client/billing/payments/${encodeURIComponent(paymentId)}/status`;
}

export class BillingModule extends AbstractApiModule {
  initSubscriptionPayment(body: InitSubscriptionPaymentRequest) {
    return this.request.post<InitSubscriptionPaymentRequest, InitSubscriptionPaymentResponse>(
      `${viwaTelemetryApiUrl}/client/billing/subscription-payments/init`,
      body,
    );
  }

  initRobokassaPayment(body: InitRobokassaPaymentRequest) {
    return this.request.post<InitRobokassaPaymentRequest, InitRobokassaPaymentResponse>(
      `${viwaTelemetryApiUrl}/client/billing/robokassa/init`,
      body,
    );
  }

  getPaymentStatus(paymentId: string) {
    return this.request.get<void, PaymentPollResponse>(buildUnifiedPaymentStatusPath(paymentId));
  }

  getRecurringAgreement() {
    return this.request.get<void, RecurringAgreementResponse>(
      `${viwaTelemetryApiUrl}/client/billing/recurring`,
    );
  }

  patchRecurringAgreement(body: PatchRecurringAgreementRequest) {
    return this.request.patch<PatchRecurringAgreementRequest, RecurringAgreementResponse>(
      `${viwaTelemetryApiUrl}/client/billing/recurring`,
      body,
    );
  }

  getSubscriptionStatus(paymentId: string) {
    return this.request.get<void, SubscriptionPollResponse>(
      `${viwaTelemetryApiUrl}/client/billing/subscription-payments/${encodeURIComponent(paymentId)}/subscription`,
    );
  }

  async pollPaymentUntilPaid(paymentId: string): Promise<PaymentPollResponse> {
    const started = Date.now();

    while (Date.now() - started < BILLING_POLL_MAX_MS) {
      const response = await this.getPaymentStatus(paymentId);

      if (response.status === 'PAID') {
        return response;
      }

      if (response.status === 'FAILED' || response.status === 'EXPIRED') {
        throw new Error(response.message || 'Оплата не прошла');
      }

      await sleep(BILLING_POLL_INTERVAL_MS);
    }

    throw new Error('Время ожидания оплаты истекло');
  }

  async pollSubscriptionUntilCompleted(paymentId: string): Promise<SubscriptionPollResponse> {
    const started = Date.now();

    while (Date.now() - started < BILLING_POLL_MAX_MS) {
      const response = await this.getSubscriptionStatus(paymentId);

      if (response.status === 'COMPLETED') {
        return response;
      }

      if (response.status === 'FAILED') {
        throw new Error(response.message || 'Не удалось подтвердить абонемент');
      }

      await sleep(BILLING_POLL_INTERVAL_MS);
    }

    throw new Error('Время ожидания подтверждения абонемента истекло');
  }
}

export default BillingModule;
