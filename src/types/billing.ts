export type InitSubscriptionPaymentRequest = {
  subscriptionLevelId: string;
  requestUuid: string;
};

export type InitSubscriptionPaymentResponse = {
  paymentId: string;
  sbpQrUrl: string;
  amountKopecks: number;
  expiresAt: string;
};

export type PaymentPollResponse = {
  status: 'PAID' | 'PENDING' | 'FAILED' | 'EXPIRED';
  paidAt?: string | null;
  message?: string | null;
};

export type SubscriptionPollResponse = {
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  client?: import('./serverInterface/clientDTO').ClientProfileDTO;
  message?: string | null;
};
