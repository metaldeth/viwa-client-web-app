import { FC, ReactNode, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  APP_VERSION,
  consumeReloadReturnPath,
  fetchServerVersion,
  hasAlreadyReloadedForVersion,
  isSafeReturnPath,
  markReloadTargetVersion,
  saveReloadReturnPath,
} from '../../utils/appVersion';

const POLL_INTERVAL_MS = 60_000;

type AppVersionGuardProps = {
  children: ReactNode;
};

export const AppVersionGuard: FC<AppVersionGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const checkingRef = useRef(false);

  useEffect(() => {
    const returnPath = consumeReloadReturnPath();
    if (returnPath && isSafeReturnPath(returnPath)) {
      navigate(returnPath, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      return;
    }

    const checkVersion = async () => {
      if (checkingRef.current) {
        return;
      }

      checkingRef.current = true;

      try {
        const serverVersion = await fetchServerVersion();

        if (!serverVersion || serverVersion === APP_VERSION) {
          return;
        }

        if (hasAlreadyReloadedForVersion(serverVersion)) {
          return;
        }

        markReloadTargetVersion(serverVersion);
        saveReloadReturnPath();
        window.location.reload();
      } finally {
        checkingRef.current = false;
      }
    };

    void checkVersion();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkVersion();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    const intervalId = window.setInterval(() => void checkVersion(), POLL_INTERVAL_MS);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, []);

  return <>{children}</>;
};
