import { FC, memo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export const SBP_ICON_SRC = '/assets/viwa/payment/sbp-icon.svg';
export const SBP_PAYMENT_QR_SIZE = 252;
export const SBP_ICON_WIDTH = 56;
export const SBP_ICON_HEIGHT = 65;

export const SBP_PAYMENT_QR_IMAGE_SETTINGS = {
  src: SBP_ICON_SRC,
  width: SBP_ICON_WIDTH,
  height: SBP_ICON_HEIGHT,
  excavate: true,
} as const;

type SbpPaymentQrProps = {
  value: string;
  ariaLabel: string;
  className?: string;
};

const SbpPaymentQr: FC<SbpPaymentQrProps> = memo(function SbpPaymentQr({
  value,
  ariaLabel,
  className,
}) {
  if (!value) {
    return null;
  }

  return (
    <div role="img" aria-label={ariaLabel} className={className}>
      <QRCodeSVG
        value={value}
        size={SBP_PAYMENT_QR_SIZE}
        level="H"
        includeMargin
        fgColor="#000000"
        bgColor="#ffffff"
        imageSettings={SBP_PAYMENT_QR_IMAGE_SETTINGS}
        aria-hidden="true"
      />
    </div>
  );
});

export default SbpPaymentQr;
