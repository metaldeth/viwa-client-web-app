import { FC, useCallback, useEffect, useState } from 'react';
import { api } from '../../app/api';
import { tSubscription } from '../../locale/subscriptionLocale';
import type { PublicSubscriptionLevelDTO } from '../../types/publicCatalog';
import { sortPublicSubscriptionLevels } from '../../utils/publicSubscriptionLevels';
import PublicTariffCard from './PublicTariffCard';
import styles from './AuthMarketingSection.module.scss';

const BENEFIT_KEYS = [
  'authMarketingBenefitFlavors',
  'authMarketingBenefitSugarFree',
  'authMarketingBenefitVitamins',
  'authMarketingBenefitMinerals',
] as const;

type LoadState = 'loading' | 'ready' | 'error';

const AuthMarketingSection: FC = () => {
  const [levels, setLevels] = useState<PublicSubscriptionLevelDTO[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [reloadToken, setReloadToken] = useState(0);

  const handleRetry = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');

    api.publicApi
      .fetchPublicSubscriptionLevels()
      .then((response) => {
        if (cancelled) {
          return;
        }
        setLevels(sortPublicSubscriptionLevels(response.items ?? []));
        setLoadState('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setLoadState('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return (
    <section
      className={styles.section}
      aria-label={tSubscription('authMarketingSectionAriaLabel')}
      data-testid="auth-marketing-section"
    >
      <div className={styles.productBlock}>
        <h2 id="auth-marketing-heading" className={styles.heading}>
          {tSubscription('authMarketingHeading')}
        </h2>
        <p className={styles.description}>{tSubscription('authMarketingDescription')}</p>
        <ul
          className={styles.benefits}
          aria-label={tSubscription('authMarketingBenefitsAriaLabel')}
        >
          {BENEFIT_KEYS.map((key) => (
            <li key={key} className={styles.benefitChip}>
              {tSubscription(key)}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.tariffsBlock} aria-labelledby="auth-marketing-tariffs-heading">
        <h3 id="auth-marketing-tariffs-heading" className={styles.tariffsHeading}>
          {tSubscription('authMarketingTariffsTitle')}
        </h3>

        {loadState === 'loading' ? (
          <p className={styles.loadingText} aria-live="polite">
            {tSubscription('authMarketingTariffsLoading')}
          </p>
        ) : null}

        {loadState === 'error' ? (
          <div className={styles.errorPanel} role="status" aria-live="polite">
            <p className={styles.errorText}>{tSubscription('authMarketingTariffsError')}</p>
            <button type="button" className={styles.retryButton} onClick={handleRetry}>
              {tSubscription('authMarketingTariffsRetry')}
            </button>
          </div>
        ) : null}

        {loadState === 'ready' && levels.length === 0 ? (
          <p className={styles.statusText} role="status" aria-live="polite">
            {tSubscription('planEmpty')}
          </p>
        ) : null}

        {loadState === 'ready' && levels.length > 0 ? (
          <div className={styles.tariffList} role="list">
            {levels.map((level, index) => (
              <div key={level.id} role="listitem">
                <PublicTariffCard level={level} accentIndex={index % 2} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default AuthMarketingSection;
