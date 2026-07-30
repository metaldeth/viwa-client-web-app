import { FC, memo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { tSubscription } from '../../locale/subscriptionLocale';
import styles from './QrPromoCard.module.scss';

export type QrPromoCardProps = {
  qrPayload: string;
  onOpen: () => void;
};

/** Light QR promo card opening the loyalty scan modal. */
const QrPromoCard: FC<QrPromoCardProps> = ({ qrPayload, onOpen }) => {
  return (
    <button
      type="button"
      className={styles.QrPromoCard}
      onClick={onOpen}
      aria-label={tSubscription('scanOpenHint')}
      disabled={!qrPayload}
    >
      <div className={styles.copy}>
        <h2 className={styles.title}>{tSubscription('qrCardTitle')}</h2>
        <p className={styles.subtitle}>
          <span className={styles.subtitleLine}>{tSubscription('qrCardSubtitleLine1')}</span>
          <span className={styles.subtitleLine}>{tSubscription('qrCardSubtitleLine2')}</span>
        </p>
      </div>

      <div className={styles.qrWrap} aria-hidden="true">
        {qrPayload ? (
          <LoyaltyQrPreview value={qrPayload} />
        ) : (
          <span className={styles.qrPlaceholder} />
        )}
      </div>
    </button>
  );
};

const LoyaltyQrPreview = memo(function LoyaltyQrPreview({ value }: { value: string }) {
  return <QRCodeSVG value={value} size={93} level="M" includeMargin={false} />;
});

export default QrPromoCard;
