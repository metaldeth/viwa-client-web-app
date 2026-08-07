import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  clearDeferredInstallPrompt,
  getPwaInstallPromptStoreSnapshot,
  markPwaInstallConfirmed,
  subscribePwaInstallPromptStore,
} from '../pwa/pwaInstallPromptStore';
import {
  detectPwaPlatform,
  dismissPwaInstallPrompt,
  isPwaInstallDismissed,
  isPwaLikelyInstalled,
  isStandaloneDisplayMode,
  queryInstalledRelatedApps,
  resolveDefaultInstallTab,
  shouldShowPwaInstallPrompt,
  type PwaPlatform,
} from '../utils/pwaInstall';

export type PwaInstallTab = 'android' | 'ios';

export function usePwaInstallPrompt() {
  const { deferredPrompt, confirmedInstalled } = useSyncExternalStore(
    subscribePwaInstallPromptStore,
    getPwaInstallPromptStoreSnapshot,
    getPwaInstallPromptStoreSnapshot,
  );

  const [dismissed, setDismissed] = useState(() => isPwaInstallDismissed());
  const [standalone, setStandalone] = useState(() => isStandaloneDisplayMode());
  const [platform] = useState<PwaPlatform>(() => detectPwaPlatform());
  const [activeTab, setActiveTab] = useState<PwaInstallTab>(() =>
    resolveDefaultInstallTab(detectPwaPlatform()),
  );
  const [relatedAppsInstalled, setRelatedAppsInstalled] = useState(false);

  useEffect(() => {
    const syncStandalone = () => setStandalone(isStandaloneDisplayMode());
    syncStandalone();

    const media = window.matchMedia('(display-mode: standalone)');
    media.addEventListener('change', syncStandalone);

    return () => media.removeEventListener('change', syncStandalone);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void queryInstalledRelatedApps().then((installed) => {
      if (!cancelled) {
        setRelatedAppsInstalled(installed);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const installed = isPwaLikelyInstalled({
    standalone,
    installedRelatedApps: confirmedInstalled || relatedAppsInstalled,
  });

  const visible = shouldShowPwaInstallPrompt({
    standalone,
    dismissed,
    installed,
    platform,
  });

  const canNativeInstall = platform === 'android' && deferredPrompt != null;

  const dismiss = useCallback(() => {
    dismissPwaInstallPrompt();
    setDismissed(true);
  }, []);

  const triggerNativeInstall = useCallback(async (): Promise<
    'accepted' | 'dismissed' | 'unavailable'
  > => {
    if (!deferredPrompt) {
      return 'unavailable';
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    clearDeferredInstallPrompt();

    if (choice.outcome === 'accepted') {
      markPwaInstallConfirmed();
    }

    return choice.outcome;
  }, [deferredPrompt]);

  const state = useMemo(
    () => ({
      visible,
      platform,
      activeTab,
      canNativeInstall,
      dismissed,
      installed,
      standalone,
    }),
    [visible, platform, activeTab, canNativeInstall, dismissed, installed, standalone],
  );

  return {
    ...state,
    setActiveTab,
    dismiss,
    triggerNativeInstall,
  };
}
