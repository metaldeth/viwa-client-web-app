export type RecurringAgreementStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'DISABLED'
  | 'REQUIRES_ACTION'
  | 'REVOKED';

export type RecurringAgreementDTO = {
  status: RecurringAgreementStatus;
  autoRenewEnabled: boolean;
  nextChargeAt: string | null;
  parentInvoiceId: string;
  consentVersion: string;
  consentedAt: string;
};

export type RecurringCapabilitiesDTO = {
  canToggleAutoRenew: boolean;
  requiresNewParentPayment: boolean;
  requiresConsent: boolean;
};

export type RecurringAgreementResponse = {
  agreement: RecurringAgreementDTO | null;
  capabilities: RecurringCapabilitiesDTO;
};

export type PatchRecurringAgreementRequest = {
  enabled: boolean;
  consentVersion?: string;
};
