import { runBackgroundVersionCheck, runInitialVersionBoot } from './appVersionBoot';
import { VERSION_FETCH_TIMEOUT_MS } from './appVersion';

describe('runInitialVersionBoot', () => {
  it('returns ready in dev after paint wait', async () => {
    const onReady = vi.fn();
    const waitForPaint = vi.fn(async () => undefined);

    await expect(
      runInitialVersionBoot({
        isDev: true,
        waitForPaint,
        onReady,
      }),
    ).resolves.toBe('ready');

    expect(waitForPaint).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('returns ready when server version matches', async () => {
    const onReady = vi.fn();
    const fetchVersion = vi.fn(async () => '1.0.0');

    await expect(
      runInitialVersionBoot({
        isDev: false,
        appVersion: '1.0.0',
        fetchVersion,
        onReady,
        waitForPaint: vi.fn(async () => undefined),
      }),
    ).resolves.toBe('ready');

    expect(fetchVersion).toHaveBeenCalledWith({ timeoutMs: VERSION_FETCH_TIMEOUT_MS });
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('returns ready when version fetch fails', async () => {
    const onReady = vi.fn();

    await expect(
      runInitialVersionBoot({
        isDev: false,
        fetchVersion: vi.fn(async () => null),
        onReady,
        waitForPaint: vi.fn(async () => undefined),
      }),
    ).resolves.toBe('ready');

    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('updates, waits for paint, then reloads on mismatch without ready', async () => {
    const onReady = vi.fn();
    const onUpdating = vi.fn();
    const reload = vi.fn();
    const markTarget = vi.fn();
    const saveReturnPath = vi.fn();
    const waitForPaint = vi.fn(async () => undefined);
    const callOrder: string[] = [];

    onUpdating.mockImplementation(() => {
      callOrder.push('updating');
    });
    waitForPaint.mockImplementation(async () => {
      callOrder.push('paint');
    });
    markTarget.mockImplementation(() => {
      callOrder.push('mark');
    });
    reload.mockImplementation(() => {
      callOrder.push('reload');
    });

    await expect(
      runInitialVersionBoot({
        isDev: false,
        appVersion: '1.0.0',
        fetchVersion: vi.fn(async () => '2.0.0'),
        onReady,
        onUpdating,
        reload,
        markTarget,
        saveReturnPath,
        waitForPaint,
      }),
    ).resolves.toBe('updating-reload');

    expect(callOrder).toEqual(['updating', 'paint', 'mark', 'reload']);
    expect(onUpdating).toHaveBeenCalledTimes(1);
    expect(markTarget).toHaveBeenCalledWith('2.0.0');
    expect(saveReturnPath).toHaveBeenCalledTimes(1);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(onReady).not.toHaveBeenCalled();
  });

  it('returns ready when loop guard already reloaded', async () => {
    const onReady = vi.fn();
    const onUpdating = vi.fn();

    await expect(
      runInitialVersionBoot({
        isDev: false,
        appVersion: '1.0.0',
        fetchVersion: vi.fn(async () => '2.0.0'),
        hasReloaded: vi.fn(() => true),
        onReady,
        onUpdating,
        waitForPaint: vi.fn(async () => undefined),
      }),
    ).resolves.toBe('ready');

    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onUpdating).not.toHaveBeenCalled();
  });
});

describe('runBackgroundVersionCheck', () => {
  it('returns noop when versions match', async () => {
    const onUpdating = vi.fn();

    await expect(
      runBackgroundVersionCheck({
        appVersion: '1.0.0',
        fetchVersion: vi.fn(async () => '1.0.0'),
        onUpdating,
      }),
    ).resolves.toBe('noop');

    expect(onUpdating).not.toHaveBeenCalled();
  });

  it('shows updating overlay, waits paint, then reloads on mismatch', async () => {
    const onUpdating = vi.fn();
    const reload = vi.fn();
    const waitForPaint = vi.fn(async () => undefined);
    const callOrder: string[] = [];

    onUpdating.mockImplementation(() => {
      callOrder.push('updating');
    });
    waitForPaint.mockImplementation(async () => {
      callOrder.push('paint');
    });
    reload.mockImplementation(() => {
      callOrder.push('reload');
    });

    await expect(
      runBackgroundVersionCheck({
        appVersion: '1.0.0',
        fetchVersion: vi.fn(async () => '2.0.0'),
        onUpdating,
        reload,
        waitForPaint,
        markTarget: vi.fn(),
        saveReturnPath: vi.fn(),
      }),
    ).resolves.toBe('updating-reload');

    expect(callOrder).toEqual(['updating', 'paint', 'reload']);
    expect(onUpdating).toHaveBeenCalledTimes(1);
  });
});
