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
});
