/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import QrPromoCard from './QrPromoCard';

describe('QrPromoCard', () => {
  it('opens QR modal handler on tap', () => {
    const onOpen = vi.fn();

    render(<QrPromoCard qrPayload="viwa:test-qr" onOpen={onOpen} />);

    fireEvent.click(screen.getByRole('button', { name: /QR/i }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
