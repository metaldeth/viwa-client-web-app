/**
 * @vitest-environment jsdom
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render, screen } from '@testing-library/react';
import PwaInstallPrompt from './PwaInstallPrompt';
import styles from './PwaInstallPrompt.module.scss';
import { PWA_INSTALL_DISMISS_KEY } from '../../utils/pwaInstall';
import { createStorageMock } from '../../test/browserMocks';

const pwaInstallPromptScss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'PwaInstallPrompt.module.scss'),
  'utf8',
);
const subscriptionPageScss = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../pages/SubscriptionPage/SubscriptionPage.module.scss',
  ),
  'utf8',
);

const hookState = {
  visible: true,
  activeTab: 'android' as const,
  setActiveTab: vi.fn(),
  canNativeInstall: true,
  dismiss: vi.fn(),
  triggerNativeInstall: vi.fn().mockResolvedValue('accepted'),
};

vi.mock('../../hooks/usePwaInstallPrompt', () => ({
  usePwaInstallPrompt: () => hookState,
}));

describe('PwaInstallPrompt', () => {
  beforeEach(() => {
    hookState.visible = true;
    hookState.activeTab = 'android';
    hookState.canNativeInstall = true;
    hookState.setActiveTab.mockReset();
    hookState.dismiss.mockReset();
    hookState.triggerNativeInstall.mockClear();
    vi.stubGlobal('localStorage', createStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders install prompt with platform tabs and native install action', () => {
    render(<PwaInstallPrompt />);

    expect(screen.getByTestId('pwa-install-prompt')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Установить приложение' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Скрыть и больше не показывать' })).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: 'iPhone' }));
    expect(hookState.setActiveTab).toHaveBeenCalledWith('ios');
  });

  it('wires tab/tabpanel a11y attributes', () => {
    render(<PwaInstallPrompt />);

    const androidTab = screen.getByRole('tab', { name: 'Android' });
    const iosTab = screen.getByRole('tab', { name: 'iPhone' });

    expect(androidTab.getAttribute('aria-selected')).toBe('true');
    expect(androidTab.getAttribute('aria-controls')).toBe('pwa-install-panel-android');
    expect(iosTab.getAttribute('aria-selected')).toBe('false');
    expect(iosTab.getAttribute('aria-controls')).toBe('pwa-install-panel-ios');

    expect(screen.getByRole('tabpanel', { name: 'Android' })).toBeTruthy();

    const iosPanel = document.getElementById('pwa-install-panel-ios');
    expect(iosPanel).toBeTruthy();
    expect(iosPanel?.getAttribute('role')).toBe('tabpanel');
    expect(iosPanel?.getAttribute('aria-labelledby')).toBe('pwa-install-tab-ios');
    expect(iosPanel?.hasAttribute('hidden')).toBe(true);
  });

  it('supports keyboard navigation between tabs', () => {
    render(<PwaInstallPrompt />);

    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });

    expect(hookState.setActiveTab).toHaveBeenCalledWith('ios');

    hookState.setActiveTab.mockClear();
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(hookState.setActiveTab).toHaveBeenCalledWith('ios');

    hookState.activeTab = 'ios';
    hookState.setActiveTab.mockClear();
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(hookState.setActiveTab).toHaveBeenCalledWith('android');
  });

  it('hides when hook reports not visible', () => {
    hookState.visible = false;
    render(<PwaInstallPrompt />);
    expect(screen.queryByTestId('pwa-install-prompt')).toBeNull();
  });

  it('calls dismiss handler from action button', () => {
    render(<PwaInstallPrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Скрыть и больше не показывать' }));
    expect(hookState.dismiss).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(PWA_INSTALL_DISMISS_KEY)).toBeNull();
  });

  it('triggers native install when available', async () => {
    render(<PwaInstallPrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Установить приложение' }));
    expect(hookState.triggerNativeInstall).toHaveBeenCalledTimes(1);
  });

  it('applies responsive containment classes to shell, tabs, and actions', () => {
    render(<PwaInstallPrompt />);

    const prompt = screen.getByTestId('pwa-install-prompt');
    expect(prompt.className).toContain(styles.pwaInstallPrompt);

    const tablist = screen.getByRole('tablist');
    expect(tablist.className).toContain(styles.tabs);

    for (const tab of screen.getAllByRole('tab')) {
      expect(tab.className).toContain(styles.tab);
    }

    expect(screen.getByRole('button', { name: 'Установить приложение' }).className).toContain(
      styles.installButton,
    );
    expect(
      screen.getByRole('button', { name: 'Скрыть и больше не показывать' }).className,
    ).toContain(styles.dismissButton);

    expect(screen.getByRole('img').className).toContain(styles.visual);
  });

  it('keeps narrow-layout containment rules in stylesheet source (320–430px cabinet)', () => {
    expect(pwaInstallPromptScss).toMatch(/\.pwaInstallPrompt[\s\S]*max-width:\s*100%/);
    expect(pwaInstallPromptScss).toMatch(/\.tabs[\s\S]*flex-wrap:\s*wrap/);
    expect(pwaInstallPromptScss).toMatch(/\.tab[\s\S]*flex:\s*1\s*1\s*8\.5rem/);
    expect(pwaInstallPromptScss).toMatch(/\.visual[\s\S]*max-width:\s*240px/);
    expect(pwaInstallPromptScss).toMatch(/\.installButton[\s\S]*width:\s*100%/);
    expect(pwaInstallPromptScss).toMatch(/overflow-wrap:\s*anywhere/);

    expect(subscriptionPageScss).toMatch(/\.pwaInstallSection[\s\S]*flex-shrink:\s*0/);
    expect(subscriptionPageScss).toMatch(/\.pwaInstallSection[\s\S]*max-width:\s*100%/);
    expect(subscriptionPageScss).toMatch(
      /\.pageShell[\s\S]*max-width:\s*var\(--viwa-cabinet-max,\s*430px\)/,
    );
    expect(subscriptionPageScss).toMatch(/@media\s*\(max-width:\s*360px\)/);
    expect(subscriptionPageScss).toMatch(/@media\s*\(max-width:\s*390px\)/);
  });
});
