import { FC } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { tSubscription } from '../../locale/subscriptionLocale';
import styles from './BottomNav.module.scss';

type NavItem = {
  id: string;
  label: 'navHome' | 'navProfile' | 'navHistory' | 'navSettings';
  to?: string;
  isStub?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'navHome', to: '/home' },
  { id: 'profile', label: 'navProfile', to: '/home' },
  { id: 'history', label: 'navHistory', isStub: true },
  { id: 'settings', label: 'navSettings', isStub: true },
];

const BottomNav: FC = () => {
  const location = useLocation();
  const onSubscriptionHome = location.pathname === '/home' || location.pathname.endsWith('/home');

  return (
    <nav className={styles.BottomNav} aria-label={tSubscription('navAriaLabel')}>
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          if (item.isStub) {
            return (
              <li key={item.id}>
                <span
                  className={styles.linkStub}
                  aria-disabled="true"
                  title={tSubscription('navStub')}
                >
                  <span className={styles.icon} aria-hidden="true" />
                  <span className={styles.label}>{tSubscription(item.label)}</span>
                  <span className={styles.stubBadge}>{tSubscription('navStub')}</span>
                </span>
              </li>
            );
          }

          const isProfileItem = item.id === 'profile';
          const ariaCurrent = isProfileItem && onSubscriptionHome ? 'page' : undefined;

          return (
            <li key={item.id}>
              <NavLink
                to={item.to ?? '/home'}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
                aria-current={ariaCurrent}
              >
                <span className={styles.icon} aria-hidden="true" />
                <span className={styles.label}>{tSubscription(item.label)}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
