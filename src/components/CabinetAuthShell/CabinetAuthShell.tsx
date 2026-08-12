import { FC, ReactNode } from 'react';
import classNames from 'classnames';
import { ViwaBrandLogo } from '../ViwaBrandLogo/ViwaBrandLogo';
import CabinetLegalFooter from '../CabinetLegalFooter';
import { useVisualViewportKeyboard } from '../../hooks/useVisualViewportKeyboard';
import styles from './CabinetAuthShell.module.scss';

export type CabinetAuthShellMainLayout = 'centered' | 'scroll';

export type CabinetAuthShellProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Default centers short auth flows; scroll keeps long AuthPage top-aligned. */
  mainLayout?: CabinetAuthShellMainLayout;
};

const CabinetAuthShell: FC<CabinetAuthShellProps> = ({
  eyebrow,
  title,
  description,
  children,
  className,
  mainLayout = 'centered',
}) => {
  const { isKeyboardOpen } = useVisualViewportKeyboard();

  return (
    <div
      className={classNames(
        styles.pageShell,
        isKeyboardOpen && styles.pageShellKeyboard,
        className,
      )}
    >
      <div className={styles.glow} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <ViwaBrandLogo size={isKeyboardOpen ? 'sm' : 'lg'} />
        </div>
      </header>
      <main className={classNames(styles.main, mainLayout === 'scroll' && styles.mainScroll)}>
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
      {!isKeyboardOpen ? <CabinetLegalFooter /> : null}
    </div>
  );
};

export default CabinetAuthShell;
