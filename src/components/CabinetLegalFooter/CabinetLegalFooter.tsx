import { FC, useState } from 'react';
import BottomSheetModal from '../BottomSheetModal';
import { ViwaBrandLogo } from '../ViwaBrandLogo/ViwaBrandLogo';
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_CONTACT_PHONE,
  LEGAL_CONTACT_PHONE_DISPLAY,
  LEGAL_MADE_BY_URL,
  LEGAL_MADE_BY_YEAR,
  LEGAL_OFFER_URL,
  LEGAL_PERSONAL_DATA_URL,
  LEGAL_REQUISITES,
} from '../../constants/legalLinks';
import { tSubscription } from '../../locale/subscriptionLocale';
import styles from './CabinetLegalFooter.module.scss';

const CabinetLegalFooter: FC = () => {
  const [isRequisitesOpen, setIsRequisitesOpen] = useState(false);

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.inner}>
          <div className={styles.brand}>
            <ViwaBrandLogo size="md" />
          </div>

          <nav className={styles.legal} aria-label={tSubscription('legalFooterAria')}>
            <ul className={styles.links}>
              <li>
                <button
                  type="button"
                  className={styles.linkButton}
                  aria-controls="cabinet-requisites-modal"
                  onClick={() => setIsRequisitesOpen(true)}
                >
                  {tSubscription('legalRequisites')}
                </button>
              </li>
              <li>
                <a className={styles.link} href={`mailto:${LEGAL_CONTACT_EMAIL}`}>
                  {LEGAL_CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a className={styles.link} href={`tel:${LEGAL_CONTACT_PHONE}`}>
                  {LEGAL_CONTACT_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a className={styles.link} href={LEGAL_OFFER_URL}>
                  {tSubscription('legalOffer')}
                </a>
              </li>
              <li>
                <a className={styles.link} href={LEGAL_PERSONAL_DATA_URL}>
                  {tSubscription('legalPersonalData')}
                </a>
              </li>
              <li>
                <a
                  className={styles.link}
                  href={LEGAL_MADE_BY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tSubscription('legalMadeBy', { year: LEGAL_MADE_BY_YEAR })}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>

      <BottomSheetModal
        isOpen={isRequisitesOpen}
        modalTitle={tSubscription('legalRequisites')}
        onClose={() => setIsRequisitesOpen(false)}
      >
        <div
          id="cabinet-requisites-modal"
          className={styles.requisitesBody}
          role="document"
          aria-label={tSubscription('legalRequisites')}
        >
          <dl className={styles.requisitesList}>
            {LEGAL_REQUISITES.map(({ labelKey, value }) => (
              <div key={labelKey} className={styles.requisitesRow}>
                <dt className={styles.requisitesTerm}>{tSubscription(labelKey)}</dt>
                <dd className={styles.requisitesDetail}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </BottomSheetModal>
    </>
  );
};

export default CabinetLegalFooter;
