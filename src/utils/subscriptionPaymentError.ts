import type { SubscriptionLocaleKey } from '../locale/subscriptionLocale';
import { tSubscription } from '../locale/subscriptionLocale';

/** Extracts machine error code from axios interceptor rejections and raw Nest payloads. */
export function extractApiErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const record = error as Record<string, unknown>;

  if (typeof record.code === 'string' && !/^\d{3}$/.test(record.code)) {
    return record.code;
  }

  const response = record.response;
  if (response && typeof response === 'object') {
    const data = (response as { data?: unknown }).data;
    if (data && typeof data === 'object') {
      const body = data as Record<string, unknown>;
      if (typeof body.code === 'string') {
        return body.code;
      }

      const message = body.message;
      if (message && typeof message === 'object' && message !== null) {
        const nestedCode = (message as { code?: unknown }).code;
        if (typeof nestedCode === 'string') {
          return nestedCode;
        }
      }
    }
  }

  return undefined;
}

export function resolveSubscriptionPaymentErrorMessage(
  error: unknown,
  translate: (key: SubscriptionLocaleKey) => string = tSubscription,
): string {
  const code = extractApiErrorCode(error);
  if (code === 'SUBSCRIPTION_DOWNGRADE_NOT_ALLOWED') {
    return translate('subscribeDowngradeNotAllowed');
  }

  if (code === 'PRICE_CHANGE_CONSENT_REQUIRED') {
    return translate('priceNoticePendingLead');
  }

  if (code === 'RECURRING_PARENT_REQUIRED') {
    return translate('recurringRequiresAction');
  }

  if (code === 'RECURRING_PARENT_NOT_REQUIRED') {
    return translate('recurringParentNotRequired');
  }

  if (code === 'BILLING_MAINTENANCE') {
    return translate('billingMaintenance');
  }

  if (error instanceof Error && error.message && error.message !== '[object Object]') {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message !== '[object Object]') {
      return message;
    }
  }

  return translate('planError');
}
