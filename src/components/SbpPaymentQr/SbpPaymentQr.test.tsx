/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import SbpPaymentQr, {
  SBP_ICON_SRC,
  SBP_ICON_HEIGHT,
  SBP_ICON_WIDTH,
  SBP_PAYMENT_QR_IMAGE_SETTINGS,
  SBP_PAYMENT_QR_SIZE,
} from './SbpPaymentQr';

const qrCodeSvgMock = vi.fn(({ value }: { value: string }) => (
  <div data-testid="qr-code-svg" data-value={value} />
));

vi.mock('qrcode.react', () => ({
  QRCodeSVG: (props: Record<string, unknown>) => {
    qrCodeSvgMock(props);
    return <div data-testid="qr-code-svg" data-value={String(props.value ?? '')} />;
  },
}));

describe('SbpPaymentQr', () => {
  beforeEach(() => {
    qrCodeSvgMock.mockClear();
  });

  it('renders high-ECC payment QR with quiet zone and excavated SBP logo', () => {
    render(<SbpPaymentQr value="https://qr.nspk.ru/example" ariaLabel="Оплата СБП" />);

    expect(screen.getByRole('img', { name: 'Оплата СБП' })).toBeTruthy();
    expect(qrCodeSvgMock).toHaveBeenCalledTimes(1);

    expect(qrCodeSvgMock).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'https://qr.nspk.ru/example',
        size: SBP_PAYMENT_QR_SIZE,
        level: 'H',
        includeMargin: true,
        fgColor: '#000000',
        bgColor: '#ffffff',
        imageSettings: SBP_PAYMENT_QR_IMAGE_SETTINGS,
      }),
    );

    expect(SBP_PAYMENT_QR_IMAGE_SETTINGS).toEqual({
      src: SBP_ICON_SRC,
      width: SBP_ICON_WIDTH,
      height: SBP_ICON_HEIGHT,
      excavate: true,
    });
    expect(SBP_ICON_WIDTH / SBP_PAYMENT_QR_SIZE).toBeGreaterThanOrEqual(0.22);
    expect(SBP_ICON_WIDTH / SBP_PAYMENT_QR_SIZE).toBeLessThanOrEqual(0.24);
  });

  it('returns null for empty value', () => {
    const { container } = render(<SbpPaymentQr value="" ariaLabel="Оплата СБП" />);

    expect(container.firstChild).toBeNull();
    expect(qrCodeSvgMock).not.toHaveBeenCalled();
  });
});
