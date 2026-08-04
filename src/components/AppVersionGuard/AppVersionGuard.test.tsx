/**
 * @vitest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppVersionGuard } from './AppVersionGuard';
import { installBrowserStorageMocks } from '../../test/browserMocks';

const mocks = vi.hoisted(() => ({
  runInitialVersionBoot: vi.fn<() => Promise<'ready' | 'updating-reload'>>(),
  fetchServerVersion: vi.fn<() => Promise<string | null>>(),
}));

vi.mock('../../utils/appVersionBoot', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/appVersionBoot')>();
  return {
    ...actual,
    runInitialVersionBoot: (...args: unknown[]) => mocks.runInitialVersionBoot(...args),
  };
});

vi.mock('../../utils/appVersion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/appVersion')>();
  return {
    ...actual,
    APP_VERSION: '1.0.0-test',
    fetchServerVersion: (...args: unknown[]) => mocks.fetchServerVersion(...args),
  };
});

const reloadMock = vi.fn();

describe('AppVersionGuard boot integration', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
    mocks.runInitialVersionBoot.mockReset();
    mocks.fetchServerVersion.mockReset();
    reloadMock.mockReset();

    vi.stubGlobal('location', { ...window.location, reload: reloadMock });
    vi.stubEnv('DEV', 'false');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts interval polling without immediate recheck after ready boot', async () => {
    mocks.runInitialVersionBoot.mockResolvedValue('ready');
    mocks.fetchServerVersion.mockResolvedValue('1.0.0-test');

    render(
      <MemoryRouter>
        <AppVersionGuard>
          <div data-testid="app">app</div>
        </AppVersionGuard>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mocks.runInitialVersionBoot).toHaveBeenCalledTimes(1);
    });
    expect(mocks.fetchServerVersion).not.toHaveBeenCalled();
  });

  it('does not start polling when boot triggers updating reload', async () => {
    mocks.runInitialVersionBoot.mockResolvedValue('updating-reload');

    render(
      <MemoryRouter>
        <AppVersionGuard>
          <div>app</div>
        </AppVersionGuard>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mocks.runInitialVersionBoot).toHaveBeenCalledTimes(1);
    });
    expect(mocks.fetchServerVersion).not.toHaveBeenCalled();
  });
});
