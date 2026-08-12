/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import RecurringConsentModal from './RecurringConsentModal';

describe('RecurringConsentModal', () => {
  it('blocks accept until checkbox is checked', () => {
    const onAccept = vi.fn();

    render(
      <RecurringConsentModal isOpen variant="checkout" onClose={vi.fn()} onAccept={onAccept} />,
    );

    const acceptButton = screen.getByTestId('recurring-consent-accept');
    expect(acceptButton.hasAttribute('disabled')).toBe(true);

    fireEvent.click(screen.getByTestId('recurring-consent-checkbox'));
    expect(acceptButton.hasAttribute('disabled')).toBe(false);

    fireEvent.click(acceptButton);
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('renders re-enable title for reenable variant', () => {
    render(
      <RecurringConsentModal isOpen variant="reenable" onClose={vi.fn()} onAccept={vi.fn()} />,
    );

    expect(screen.getByTestId('recurring-consent-modal')).toBeTruthy();
  });

  it('links to the public offer from the consent checkbox', () => {
    render(
      <RecurringConsentModal isOpen variant="checkout" onClose={vi.fn()} onAccept={vi.fn()} />,
    );

    const offerLink = screen.getByTestId('recurring-consent-offer-link');
    expect(offerLink.getAttribute('href')).toBe('/legal/oferta_663903715112.docx');
  });
});
