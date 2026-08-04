import { FC, ReactNode, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  consumeReloadReturnPath,
  hasAlreadyReloadedForVersion,
  isSafeReturnPath,
} from '../../utils/appVersion';
import { runBackgroundVersionCheck, runInitialVersionBoot } from '../../utils/appVersionBoot';

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
    let cancelled = false;
    let pollIntervalId: number | undefined;

    const checkVersionInBackground = async (): Promise<void> => {
      if (checkingRef.current) {
        return;
      }

      checkingRef.current = true;

      try {
        await runBackgroundVersionCheck({
          hasReloaded: hasAlreadyReloadedForVersion,
        });
      } finally {
        checkingRef.current = false;
      }
    };

    const startBackgroundPolling = (): (() => void) => {
      if (import.meta.env.DEV) {
        return () => undefined;
      }

      const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          void checkVersionInBackground();
        }
      };

      document.addEventListener('visibilitychange', onVisibilityChange);
      pollIntervalId = window.setInterval(() => void checkVersionInBackground(), POLL_INTERVAL_MS);

      return () => {
        document.removeEventListener('visibilitychange', onVisibilityChange);
        if (pollIntervalId !== undefined) {
          window.clearInterval(pollIntervalId);
        }
      };
    };

    let stopPolling: (() => void) | undefined;

    void runInitialVersionBoot().then((result) => {
      if (cancelled) {
        return;
      }

      if (result === 'ready') {
        stopPolling = startBackgroundPolling();
      }
    });

    return () => {
      cancelled = true;
      stopPolling?.();
    };
  }, []);

  return <>{children}</>;
};
