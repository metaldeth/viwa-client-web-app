export type InitSubscriptionPaymentResponse = {
  sessionId: string;
  paymentUrl: string;
  paymasterOrderId: string;
  amountKopecks: number;
};

export type PaymentPollResponse = {
  status: 'PAID' | 'PENDING' | 'FAILED' | 'TIMEOUT';
  message?: string | null;
};

export type SubscriptionPollResponse = {
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'TIMEOUT';
  message?: string | null;
};
