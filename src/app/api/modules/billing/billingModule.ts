import { AbstractApiModule } from '../../abstractApiModule';
import { billingBaseUrl } from '../../../../consts';
import type {
  InitSubscriptionPaymentResponse,
  PaymentPollResponse,
  SubscriptionPollResponse,
} from '../../../../types/billing';

export type InitSubscriptionPaymentRequest = {
  clientId: string;
  organizationId: number;
  subscriptionLevelUuid: string;
};

const LONG_POLL_MS = 120_000;

export class BillingModule extends AbstractApiModule {
  initSubscriptionPayment(body: InitSubscriptionPaymentRequest) {
    return this.request.post<InitSubscriptionPaymentRequest, InitSubscriptionPaymentResponse>(
      `${billingBaseUrl}/api/v1/subscription-payments/init`,
      body,
    );
  }

  longPollPayment(sessionId: string) {
    return this.request.get<void, PaymentPollResponse>(
      `${billingBaseUrl}/api/v1/subscription-payments/${sessionId}/payment`,
      undefined,
      { timeout: LONG_POLL_MS },
    );
  }

  longPollSubscription(sessionId: string) {
    return this.request.get<void, SubscriptionPollResponse>(
      `${billingBaseUrl}/api/v1/subscription-payments/${sessionId}/subscription`,
      undefined,
      { timeout: LONG_POLL_MS },
    );
  }
}
