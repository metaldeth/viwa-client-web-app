import { FC } from 'react';
import { ViwaBrandLogo } from '../ViwaBrandLogo/ViwaBrandLogo';
import { tSubscription } from '../../locale/subscriptionLocale';
import styles from './CabinetHeader.module.scss';

/** Cabinet page header with VIWA logo and decorative menu/notifications. */
const CabinetHeader: FC = () => {
  return (
    <header className={styles.CabinetHeader}>
      <div className={styles.leading}>
        <ViwaBrandLogo size="header" />
      </div>

      <div className={styles.trailing}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{tSubscription('cabinetTitle')}</h1>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={tSubscription('cabinetMenuAria')}
            aria-disabled="true"
            disabled
          >
            <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.bellRow}>
          <div className={styles.bellWrap}>
            <span
              className={styles.iconButton}
              role="img"
              aria-label={tSubscription('cabinetNotificationsDecorative')}
            >
              <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 3a5 5 0 0 0-5 5v2.5c0 .8-.3 1.6-.8 2.2L5 14.5h14l-1.2-1.8c-.5-.6-.8-1.4-.8-2.2V8a5 5 0 0 0-5-5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 18a2 2 0 0 0 4 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className={styles.badge} aria-hidden="true">
              3
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CabinetHeader;
