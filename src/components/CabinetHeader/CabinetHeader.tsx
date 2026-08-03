import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../app/api';
import {
  clearClientAuthStorage,
  getMachineAuthPath,
  getReturningAuthPath,
} from '../../pages/ValidationPage/helpers';
import { ViwaBrandLogo } from '../ViwaBrandLogo/ViwaBrandLogo';
import { tSubscription } from '../../locale/subscriptionLocale';
import styles from './CabinetHeader.module.scss';

/** Cabinet page header with VIWA logo and account menu. */
const CabinetHeader: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    closeMenu();

    const refreshToken = api.getRefreshToken();
    if (refreshToken) {
      void api.auth.logout(refreshToken).catch(() => undefined);
    }

    api.clearTokens();
    clearClientAuthStorage();

    const authPath = getMachineAuthPath(location.pathname) ?? getReturningAuthPath();
    navigate(authPath, { replace: true });
  }, [closeMenu, location.pathname, navigate]);

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuButtonRef.current?.contains(target) || menuPanelRef.current?.contains(target)) {
        return;
      }
      closeMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu, isMenuOpen]);

  return (
    <header className={styles.CabinetHeader}>
      <div className={styles.leading}>
        <ViwaBrandLogo size="header" />
      </div>

      <div className={styles.trailing}>
        <div className={styles.menuWrap}>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.iconButton}
            aria-label={tSubscription('cabinetMenuAria')}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-controls="cabinet-header-menu"
            onClick={handleMenuToggle}
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

          {isMenuOpen && (
            <div
              ref={menuPanelRef}
              id="cabinet-header-menu"
              className={styles.menuPanel}
              role="menu"
              aria-label={tSubscription('cabinetMenuAria')}
            >
              {/* Extension point: user profile / account summary */}
              <ul className={styles.menuList}>
                <li role="none">
                  <button
                    type="button"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    {tSubscription('cabinetMenuLogOut')}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CabinetHeader;
