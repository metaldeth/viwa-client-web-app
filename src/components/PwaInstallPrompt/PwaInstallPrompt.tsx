import { FC, KeyboardEvent, useCallback, useState } from 'react';
import classNames from 'classnames';
import { usePwaInstallPrompt, type PwaInstallTab } from '../../hooks/usePwaInstallPrompt';
import { tSubscription } from '../../locale/subscriptionLocale';
import styles from './PwaInstallPrompt.module.scss';

export type PwaInstallPromptProps = {
  className?: string;
  variant?: 'inline' | 'section';
};

const PWA_INSTALL_TABS: PwaInstallTab[] = ['android', 'ios'];

const PWA_INSTALL_TAB_ID: Record<PwaInstallTab, string> = {
  android: 'pwa-install-tab-android',
  ios: 'pwa-install-tab-ios',
};

const PWA_INSTALL_PANEL_ID: Record<PwaInstallTab, string> = {
  android: 'pwa-install-panel-android',
  ios: 'pwa-install-panel-ios',
};

const ANDROID_STEPS: Array<
  'pwaInstallAndroidManualStep1' | 'pwaInstallAndroidManualStep2' | 'pwaInstallAndroidManualStep3'
> = [
  'pwaInstallAndroidManualStep1',
  'pwaInstallAndroidManualStep2',
  'pwaInstallAndroidManualStep3',
];

const IOS_STEPS: Array<'pwaInstallIosStep1' | 'pwaInstallIosStep2' | 'pwaInstallIosStep3'> = [
  'pwaInstallIosStep1',
  'pwaInstallIosStep2',
  'pwaInstallIosStep3',
];

const TAB_LABEL_KEYS: Record<PwaInstallTab, 'pwaInstallAndroidTab' | 'pwaInstallIosTab'> = {
  android: 'pwaInstallAndroidTab',
  ios: 'pwaInstallIosTab',
};

const TAB_VISUAL_SRC: Record<PwaInstallTab, string> = {
  android: '/assets/pwa/android-install-steps.svg',
  ios: '/assets/pwa/ios-add-home-steps.svg',
};

const PwaInstallPrompt: FC<PwaInstallPromptProps> = ({ className, variant = 'inline' }) => {
  const { visible, activeTab, setActiveTab, canNativeInstall, dismiss, triggerNativeInstall } =
    usePwaInstallPrompt();
  const [installBusy, setInstallBusy] = useState(false);

  const handleInstall = async () => {
    if (!canNativeInstall || installBusy) {
      return;
    }

    setInstallBusy(true);
    try {
      await triggerNativeInstall();
    } finally {
      setInstallBusy(false);
    }
  };

  const handleTabChange = useCallback(
    (tab: PwaInstallTab) => {
      setActiveTab(tab);
    },
    [setActiveTab],
  );

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = PWA_INSTALL_TABS.indexOf(activeTab);
      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = (currentIndex + 1) % PWA_INSTALL_TABS.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = (currentIndex - 1 + PWA_INSTALL_TABS.length) % PWA_INSTALL_TABS.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = PWA_INSTALL_TABS.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const nextTab = PWA_INSTALL_TABS[nextIndex];
      handleTabChange(nextTab);
      document.getElementById(PWA_INSTALL_TAB_ID[nextTab])?.focus();
    },
    [activeTab, handleTabChange],
  );

  if (!visible) {
    return null;
  }

  return (
    <section
      className={classNames(
        styles.pwaInstallPrompt,
        variant === 'inline' && styles.inline,
        className,
      )}
      aria-label={tSubscription('pwaInstallAriaLabel')}
      data-testid="pwa-install-prompt"
    >
      <h2 className={styles.title}>{tSubscription('pwaInstallTitle')}</h2>
      <p className={styles.description}>{tSubscription('pwaInstallDescription')}</p>

      <div
        className={styles.tabs}
        role="tablist"
        aria-label={tSubscription('pwaInstallTabsAria')}
        onKeyDown={handleTabKeyDown}
      >
        {PWA_INSTALL_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            id={PWA_INSTALL_TAB_ID[tab]}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={PWA_INSTALL_PANEL_ID[tab]}
            tabIndex={activeTab === tab ? 0 : -1}
            className={classNames(styles.tab, activeTab === tab && styles.tabActive)}
            onClick={() => handleTabChange(tab)}
          >
            {tSubscription(TAB_LABEL_KEYS[tab])}
          </button>
        ))}
      </div>

      {PWA_INSTALL_TABS.map((tab) => {
        const steps = tab === 'ios' ? IOS_STEPS : ANDROID_STEPS;

        return (
          <div
            key={tab}
            id={PWA_INSTALL_PANEL_ID[tab]}
            role="tabpanel"
            aria-labelledby={PWA_INSTALL_TAB_ID[tab]}
            hidden={activeTab !== tab}
            className={styles.tabPanel}
          >
            <img
              className={styles.visual}
              src={TAB_VISUAL_SRC[tab]}
              alt=""
              loading="lazy"
              decoding="async"
            />

            <ol className={styles.steps}>
              {steps.map((key, index) => (
                <li key={key} className={styles.step}>
                  <span className={styles.stepIndex} aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>{tSubscription(key)}</span>
                </li>
              ))}
            </ol>

            {tab === 'android' && canNativeInstall ? (
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.installButton}
                  onClick={() => void handleInstall()}
                  disabled={installBusy}
                >
                  {tSubscription('pwaInstallInstallButton')}
                </button>
              </div>
            ) : null}
          </div>
        );
      })}

      <div className={styles.actions}>
        <button type="button" className={styles.dismissButton} onClick={dismiss}>
          {tSubscription('pwaInstallDismiss')}
        </button>
      </div>
    </section>
  );
};

export default PwaInstallPrompt;
