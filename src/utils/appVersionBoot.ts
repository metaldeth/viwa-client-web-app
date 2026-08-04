import { signalAppReady, signalAppUpdating, waitForBootPaint } from './appBoot';
import {
  APP_VERSION,
  fetchServerVersion,
  hasAlreadyReloadedForVersion,
  markReloadTargetVersion,
  saveReloadReturnPath,
  VERSION_FETCH_TIMEOUT_MS,
} from './appVersion';

export type InitialBootResult = 'ready' | 'updating-reload';
export type BackgroundVersionCheckResult = 'noop' | 'updating-reload';

export type VersionBootDeps = {
  fetchVersion?: typeof fetchServerVersion;
  waitForPaint?: typeof waitForBootPaint;
  onReady?: typeof signalAppReady;
  onUpdating?: typeof signalAppUpdating;
  reload?: () => void;
  markTarget?: typeof markReloadTargetVersion;
  saveReturnPath?: typeof saveReloadReturnPath;
  hasReloaded?: typeof hasAlreadyReloadedForVersion;
  appVersion?: string;
};

export type InitialBootOptions = VersionBootDeps & {
  isDev?: boolean;
  initialFetchTimeoutMs?: number;
};

const defaultReload = (): void => {
  window.location.reload();
};

const reloadForVersionUpdate = async ({
  serverVersion,
  waitForPaint,
  onUpdating,
  markTarget,
  saveReturnPath,
  reload,
}: {
  serverVersion: string;
  waitForPaint: typeof waitForBootPaint;
  onUpdating: typeof signalAppUpdating;
  markTarget: typeof markReloadTargetVersion;
  saveReturnPath: typeof saveReloadReturnPath;
  reload: () => void;
}): Promise<'updating-reload'> => {
  onUpdating();
  await waitForPaint();
  markTarget(serverVersion);
  saveReturnPath();
  reload();
  return 'updating-reload';
};

export const runBackgroundVersionCheck = async ({
  fetchVersion = fetchServerVersion,
  waitForPaint = waitForBootPaint,
  onUpdating = signalAppUpdating,
  reload = defaultReload,
  markTarget = markReloadTargetVersion,
  saveReturnPath = saveReloadReturnPath,
  hasReloaded = hasAlreadyReloadedForVersion,
  appVersion = APP_VERSION,
}: VersionBootDeps = {}): Promise<BackgroundVersionCheckResult> => {
  try {
    const serverVersion = await fetchVersion();

    if (!serverVersion || serverVersion === appVersion) {
      return 'noop';
    }

    if (hasReloaded(serverVersion)) {
      return 'noop';
    }

    return reloadForVersionUpdate({
      serverVersion,
      waitForPaint,
      onUpdating,
      markTarget,
      saveReturnPath,
      reload,
    });
  } catch {
    return 'noop';
  }
};

export const runInitialVersionBoot = async ({
  isDev = import.meta.env.DEV,
  fetchVersion = fetchServerVersion,
  waitForPaint = waitForBootPaint,
  onReady = signalAppReady,
  onUpdating = signalAppUpdating,
  reload = defaultReload,
  markTarget = markReloadTargetVersion,
  saveReturnPath = saveReloadReturnPath,
  hasReloaded = hasAlreadyReloadedForVersion,
  appVersion = APP_VERSION,
  initialFetchTimeoutMs = VERSION_FETCH_TIMEOUT_MS,
}: InitialBootOptions = {}): Promise<InitialBootResult> => {
  const reveal = async (): Promise<'ready'> => {
    await waitForPaint();
    onReady();
    return 'ready';
  };

  if (isDev) {
    return reveal();
  }

  try {
    const serverVersion = await fetchVersion({ timeoutMs: initialFetchTimeoutMs });

    if (!serverVersion || serverVersion === appVersion) {
      return reveal();
    }

    if (hasReloaded(serverVersion)) {
      return reveal();
    }

    return reloadForVersionUpdate({
      serverVersion,
      waitForPaint,
      onUpdating,
      markTarget,
      saveReturnPath,
      reload,
    });
  } catch {
    return reveal();
  }
};
