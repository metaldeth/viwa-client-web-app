import {
  extractApiErrorCode,
  resolveSubscriptionPaymentErrorMessage,
} from './subscriptionPaymentError';

describe('subscriptionPaymentError', () => {
  it('extracts nested Nest machine error code from axios rejection', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          statusCode: 409,
          message: {
            code: 'SUBSCRIPTION_DOWNGRADE_NOT_ALLOWED',
            message:
              'Cannot purchase a lower subscription tier while an active subscription is in effect',
          },
        },
      },
      code: '409',
      message: '[object Object]',
    };

    expect(extractApiErrorCode(error)).toBe('SUBSCRIPTION_DOWNGRADE_NOT_ALLOWED');
  });

  it('maps downgrade guard to localized copy', () => {
    const error = {
      response: {
        data: {
          message: {
            code: 'SUBSCRIPTION_DOWNGRADE_NOT_ALLOWED',
            message:
              'Cannot purchase a lower subscription tier while an active subscription is in effect',
          },
        },
      },
    };

    expect(
      resolveSubscriptionPaymentErrorMessage(error, (key) =>
        key === 'subscribeDowngradeNotAllowed' ? 'Downgrade blocked' : 'Generic error',
      ),
    ).toBe('Downgrade blocked');
  });

  it('does not map downgrade guard to plan loading copy', () => {
    const error = {
      response: {
        data: {
          message: {
            code: 'SUBSCRIPTION_DOWNGRADE_NOT_ALLOWED',
            message:
              'Cannot purchase a lower subscription tier while an active subscription is in effect',
          },
        },
      },
    };

    expect(resolveSubscriptionPaymentErrorMessage(error)).not.toBe('Не удалось загрузить тарифы');
    expect(resolveSubscriptionPaymentErrorMessage(error)).not.toBe('Could not load plans');
  });

  it('maps billing maintenance to localized copy', () => {
    const error = {
      response: {
        data: {
          message: {
            code: 'BILLING_MAINTENANCE',
            message: 'Billing is temporarily unavailable',
          },
        },
      },
    };

    expect(
      resolveSubscriptionPaymentErrorMessage(error, (key) =>
        key === 'billingMaintenance' ? 'Billing paused' : 'Generic error',
      ),
    ).toBe('Billing paused');
  });

  it('maps recurring parent not required to localized copy', () => {
    const error = {
      response: {
        data: {
          message: {
            code: 'RECURRING_PARENT_NOT_REQUIRED',
            message: 'Reusable recurring parent already exists',
          },
        },
      },
    };

    expect(
      resolveSubscriptionPaymentErrorMessage(error, (key) =>
        key === 'recurringParentNotRequired' ? 'Use account settings' : 'Generic error',
      ),
    ).toBe('Use account settings');
  });

  it('does not map billing maintenance to plan loading copy', () => {
    const error = {
      response: {
        data: {
          message: {
            code: 'BILLING_MAINTENANCE',
            message: 'Billing is temporarily unavailable',
          },
        },
      },
    };

    expect(resolveSubscriptionPaymentErrorMessage(error)).not.toBe('Не удалось загрузить тарифы');
  });
});
