export const PWA_INSTALL_DISMISS_KEY = 'viwa_pwa_install_dismissed';

export type PwaPlatform = 'android' | 'ios' | 'desktop' | 'unknown';

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

declare global {
  interface Navigator {
    standalone?: boolean;
    getInstalledRelatedApps?: () => Promise<{ platform?: string; url?: string }[]>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

export function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (typeof window.matchMedia === 'function') {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return true;
    }

    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return true;
    }
  }

  return Boolean(window.navigator.standalone);
}

export type DetectPwaPlatformInput = {
  userAgent?: string;
  maxTouchPoints?: number;
};

export function detectPwaPlatform(input: DetectPwaPlatformInput | string = {}): PwaPlatform {
  const userAgent =
    typeof input === 'string'
      ? input
      : (input.userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : ''));
  const maxTouchPoints =
    typeof input === 'string'
      ? typeof navigator !== 'undefined'
        ? navigator.maxTouchPoints
        : 0
      : (input.maxTouchPoints ?? (typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0));

  const ua = userAgent.toLowerCase();

  if (/android/.test(ua)) {
    return 'android';
  }

  if (/iphone|ipad|ipod/.test(ua)) {
    return 'ios';
  }

  if (/macintosh/.test(ua) && maxTouchPoints > 1) {
    return 'ios';
  }

  if (/windows|macintosh|linux|cros/.test(ua)) {
    return 'desktop';
  }

  return 'unknown';
}

export function isPwaInstallDismissed(storage: Storage = localStorage): boolean {
  return storage.getItem(PWA_INSTALL_DISMISS_KEY) === '1';
}

export function dismissPwaInstallPrompt(storage: Storage = localStorage): void {
  storage.setItem(PWA_INSTALL_DISMISS_KEY, '1');
}

export function isPwaLikelyInstalled(options?: {
  standalone?: boolean;
  installedRelatedApps?: boolean;
}): boolean {
  if (options?.standalone ?? isStandaloneDisplayMode()) {
    return true;
  }

  return Boolean(options?.installedRelatedApps);
}

export function shouldShowPwaInstallPrompt(options?: {
  standalone?: boolean;
  dismissed?: boolean;
  installed?: boolean;
  platform?: PwaPlatform;
}): boolean {
  const platform = options?.platform ?? detectPwaPlatform();
  const standalone = options?.standalone ?? isStandaloneDisplayMode();
  const dismissed = options?.dismissed ?? isPwaInstallDismissed();
  const installed = options?.installed ?? false;

  if (standalone || dismissed || installed) {
    return false;
  }

  if (platform === 'desktop') {
    return false;
  }

  return platform === 'android' || platform === 'ios';
}

export function isBeforeInstallPromptEvent(event: Event): event is BeforeInstallPromptEvent {
  return 'prompt' in event && typeof (event as BeforeInstallPromptEvent).prompt === 'function';
}

export async function queryInstalledRelatedApps(): Promise<boolean> {
  if (typeof navigator === 'undefined' || typeof navigator.getInstalledRelatedApps !== 'function') {
    return false;
  }

  try {
    const apps = await navigator.getInstalledRelatedApps();
    return apps.length > 0;
  } catch {
    return false;
  }
}

export function resolveDefaultInstallTab(platform: PwaPlatform): 'android' | 'ios' {
  return platform === 'ios' ? 'ios' : 'android';
}

export function supportsNativeInstallPrompt(platform: PwaPlatform): boolean {
  return platform === 'android';
}
