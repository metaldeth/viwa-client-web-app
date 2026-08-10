/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import RecurringStatusBlock from './RecurringStatusBlock';
import type { RecurringAgreementDTO, RecurringCapabilitiesDTO } from '../../types/recurring';

const activeAgreement: RecurringAgreementDTO = {
  status: 'ACTIVE',
  autoRenewEnabled: true,
  nextChargeAt: '2099-09-10T00:00:00.000Z',
  parentInvoiceId: '123',
  consentVersion: '2026-08-recurring-v1',
  consentedAt: '2026-08-10T12:00:00.000Z',
};

const toggleCapabilities: RecurringCapabilitiesDTO = {
  canToggleAutoRenew: true,
  requiresNewParentPayment: false,
  requiresConsent: false,
};

describe('RecurringStatusBlock', () => {
  it('calls onDisable when auto-renew switch is toggled off', () => {
    const onDisable = vi.fn();

    render(
      <RecurringStatusBlock
        agreement={activeAgreement}
        capabilities={toggleCapabilities}
        onDisable={onDisable}
        onReEnable={vi.fn()}
        onEnableNewParent={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('recurring-auto-renew-switch'));
    expect(onDisable).toHaveBeenCalledTimes(1);
  });

  it('shows enable CTA when requiresNewParentPayment is true', () => {
    const onEnableNewParent = vi.fn();

    render(
      <RecurringStatusBlock
        agreement={null}
        capabilities={{
          canToggleAutoRenew: false,
          requiresNewParentPayment: true,
          requiresConsent: false,
        }}
        onDisable={vi.fn()}
        onReEnable={vi.fn()}
        onEnableNewParent={onEnableNewParent}
        onRetry={vi.fn()}
      />,
    );

    const cta = screen.getByTestId('recurring-enable-new-parent-cta');
    expect(cta).toBeTruthy();
    fireEvent.click(cta);
    expect(onEnableNewParent).toHaveBeenCalledTimes(1);
  });

  it('shows requires action warning for REQUIRES_ACTION status', () => {
    render(
      <RecurringStatusBlock
        agreement={{ ...activeAgreement, status: 'REQUIRES_ACTION', autoRenewEnabled: false }}
        capabilities={{
          canToggleAutoRenew: false,
          requiresNewParentPayment: true,
          requiresConsent: false,
        }}
        onDisable={vi.fn()}
        onReEnable={vi.fn()}
        onEnableNewParent={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByTestId('recurring-requires-action')).toBeTruthy();
  });
});
