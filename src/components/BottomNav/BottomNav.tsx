import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { tSubscription } from '../../locale/subscriptionLocale';
import styles from './BottomNav.module.scss';

type NavItemConfig =
  | {
      id: string;
      kind: 'link';
      label: 'navHome';
      to: string;
      icon: FC;
    }
  | {
      id: string;
      kind: 'fab';
      label: 'navFab';
      icon: FC;
    }
  | {
      id: string;
      kind: 'stub';
      label: 'navHistory' | 'navAwards' | 'navProfile';
      icon: FC;
    };

const IconHome: FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const IconHistory: FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconLightning: FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
  </svg>
);

const IconAwards: FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="m12 3 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.2l5-.7L12 3Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const IconProfile: FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4.5V20h14v-1.5C19 16 16 14 12 14Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', kind: 'link', label: 'navHome', to: '/home', icon: IconHome },
  { id: 'history', kind: 'stub', label: 'navHistory', icon: IconHistory },
  { id: 'fab', kind: 'fab', label: 'navFab', icon: IconLightning },
  { id: 'awards', kind: 'stub', label: 'navAwards', icon: IconAwards },
  { id: 'profile', kind: 'stub', label: 'navProfile', icon: IconProfile },
];

function isCabinetHomePath(pathname: string): boolean {
  return pathname === '/home' || pathname.endsWith('/home');
}

/** Five-slot cabinet bottom navigation with center FAB stub. */
const BottomNav: FC = () => {
  const location = useLocation();
  const onCabinetHome = isCabinetHomePath(location.pathname);

  return (
    <nav className={styles.BottomNav} aria-label={tSubscription('navAriaLabel')}>
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const label = tSubscription(item.label);

          if (item.kind === 'fab') {
            return (
              <li key={item.id} className={styles.fabSlot}>
                <button
                  type="button"
                  className={styles.fab}
                  aria-label={label}
                  aria-disabled="true"
                  disabled
                  title={tSubscription('navStub')}
                >
                  <Icon />
                </button>
                <span className={styles.fabLabel}>{label}</span>
              </li>
            );
          }

          if (item.kind === 'stub') {
            return (
              <li key={item.id}>
                <span
                  className={styles.linkStub}
                  aria-disabled="true"
                  title={tSubscription('navStub')}
                >
                  <span className={styles.iconWrap}>
                    <Icon />
                  </span>
                  <span className={styles.label}>{label}</span>
                </span>
              </li>
            );
          }

          const homeActive = onCabinetHome;

          return (
            <li key={item.id}>
              <Link
                to={item.to}
                className={[styles.link, homeActive ? styles.linkActive : '']
                  .filter(Boolean)
                  .join(' ')}
                aria-current={homeActive ? 'page' : undefined}
              >
                <span className={styles.iconWrap}>
                  <Icon />
                </span>
                <span className={styles.label}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
