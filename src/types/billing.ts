export type PaymentProvider = 'PAYMASTER_SBP' | 'ROBOKASSA' | 'POS';

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

export type InitRobokassaPaymentRequest = {
  subscriptionLevelId: string;
  requestUuid: string;
  autoRenew?: boolean;
  consentVersion?: string;
};

export type InitRobokassaPaymentResponse = {
  paymentId: string;
  paymentUrl: string;
  provider: 'ROBOKASSA';
  amountKopecks: number;
  expiresAt: string;
};

export type PaymentPollResponse = {
  status: 'PAID' | 'PENDING' | 'FAILED' | 'EXPIRED';
  paidAt?: string | null;
  message?: string | null;
  provider?: PaymentProvider;
};

export type SubscriptionPollResponse = {
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  client?: import('./serverInterface/clientDTO').ClientProfileDTO;
  message?: string | null;
};
