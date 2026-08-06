import { FC, ReactNode } from 'react';
import { ViwaBrandLogo } from '../ViwaBrandLogo/ViwaBrandLogo';
import CabinetLegalFooter from '../CabinetLegalFooter';
import styles from './CabinetAuthShell.module.scss';

export type CabinetAuthShellProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

const CabinetAuthShell: FC<CabinetAuthShellProps> = ({
  eyebrow,
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={[styles.pageShell, className].filter(Boolean).join(' ')}>
      <div className={styles.glow} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <ViwaBrandLogo size="lg" />
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.card} aria-labelledby="cabinet-auth-title">
          {eyebrow ? (
            <span className={styles.eyebrow} aria-hidden="true">
              {eyebrow}
            </span>
          ) : null}
          <h1 id="cabinet-auth-title" className={styles.title}>
            {title}
          </h1>
          {description ? <p className={styles.description}>{description}</p> : null}
          <div className={styles.cardBody}>{children}</div>
        </section>
      </main>
      <CabinetLegalFooter />
    </div>
  );
};

export default CabinetAuthShell;
