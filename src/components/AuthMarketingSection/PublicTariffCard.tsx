import { FC } from 'react';
import classNames from 'classnames';
import { formatLitersFromMl, formatPriceRub, tSubscription } from '../../locale/subscriptionLocale';
import type { PublicSubscriptionLevelDTO } from '../../types/publicCatalog';
import { resolvePublicTierDescription } from '../../utils/publicSubscriptionLevels';
import styles from './AuthMarketingSection.module.scss';

export type PublicTariffCardProps = {
  level: PublicSubscriptionLevelDTO;
  accentIndex: number;
};

const PublicTariffCard: FC<PublicTariffCardProps> = ({ level, accentIndex }) => {
  const titleId = `public-tariff-name-${level.id}`;
  const descriptionId = `public-tariff-description-${level.id}`;
  const description = resolvePublicTierDescription(
    level,
    tSubscription('authMarketingTariffDescriptionFallback'),
  );

  return (
    <article
      className={classNames(styles.tariffCard, styles[`tariffCardAccent${accentIndex}`])}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      data-testid={`public-tariff-card-${level.id}`}
    >
      <span className={styles.tariffCardGlow} aria-hidden="true" />
      <div className={styles.tariffCardBody}>
        <h4 id={titleId} className={styles.tariffCardName}>
          {level.name}
        </h4>
        <p className={styles.tariffCardVolume}>
          {tSubscription('tierFlavoredVolume', {
            liters: formatLitersFromMl(level.monthlyVolumeMl),
          })}
        </p>
        <p id={descriptionId} className={styles.tariffCardDescription}>
          {description}
        </p>
        <p className={styles.tariffCardPrice}>
          {tSubscription('planPerMonth', { price: formatPriceRub(level.priceKopecks) })}
        </p>
      </div>
    </article>
  );
};

export default PublicTariffCard;
