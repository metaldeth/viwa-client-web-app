/**

 * @vitest-environment jsdom

 */

import { act, renderHook, waitFor } from '@testing-library/react';

import { useSubscriptionPriceNotice } from './useSubscriptionPriceNotice';

import { api } from '../app/api';

vi.mock('../app/api', () => ({
  api: {
    subscriptionPriceNotice: {
      fetchNotice: vi.fn(),

      accept: vi.fn(),

      decline: vi.fn(),
    },
  },
}));

const wireNotice = {
  schedule: {
    id: 'sched-1',

    subscriptionLevelId: 'tier-12',

    currentPriceKopecks: 49900,

    newPriceKopecks: 59900,

    effectiveAt: '2026-09-01T00:00:00.000Z',
  },

  latestDecision: null as const,
};

describe('useSubscriptionPriceNotice', () => {
  beforeEach(() => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice).mockReset();

    vi.mocked(api.subscriptionPriceNotice.accept).mockReset();

    vi.mocked(api.subscriptionPriceNotice.decline).mockReset();
  });

  it('loads notice when authed', async () => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice).mockResolvedValue(wireNotice);

    const { result } = renderHook(() => useSubscriptionPriceNotice(true));

    await waitFor(() => {
      expect(result.current.fetchState).toBe('ready');
    });

    expect(result.current.notice?.scheduleId).toBe('sched-1');
  });

  it('treats schedule=null as empty notice without error', async () => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice).mockResolvedValue({
      schedule: null,

      latestDecision: null,
    });

    const { result } = renderHook(() => useSubscriptionPriceNotice(true));

    await waitFor(() => {
      expect(result.current.fetchState).toBe('ready');
    });

    expect(result.current.notice).toBeNull();

    expect(result.current.fetchError).toBeNull();
  });

  it('keeps fetch error on transient failure', async () => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice).mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useSubscriptionPriceNotice(true));

    await waitFor(() => {
      expect(result.current.fetchState).toBe('error');
    });

    expect(result.current.fetchError).toMatch(/загрузить/i);
  });

  it('accepts and refetches notice', async () => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice)

      .mockResolvedValueOnce(wireNotice)

      .mockResolvedValueOnce({
        ...wireNotice,

        latestDecision: 'ACCEPTED',
      });

    vi.mocked(api.subscriptionPriceNotice.accept).mockResolvedValue({
      decision: 'ACCEPTED',

      decidedAt: '2026-08-01T00:00:00.000Z',
    });

    const { result } = renderHook(() => useSubscriptionPriceNotice(true));

    await waitFor(() => {
      expect(result.current.notice?.scheduleId).toBe('sched-1');
    });

    await act(async () => {
      await result.current.submitDecision('ACCEPTED');
    });

    await waitFor(() => {
      expect(result.current.notice?.latestDecision).toBe('ACCEPTED');
    });

    expect(api.subscriptionPriceNotice.accept).toHaveBeenCalledWith({ scheduleId: 'sched-1' });
  });

  it('declines via decline endpoint and maps REFUSED to DECLINED', async () => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice)

      .mockResolvedValueOnce(wireNotice)

      .mockResolvedValueOnce({
        ...wireNotice,

        latestDecision: 'REFUSED',
      });

    vi.mocked(api.subscriptionPriceNotice.decline).mockResolvedValue({
      decision: 'REFUSED',

      decidedAt: '2026-08-01T00:00:00.000Z',
    });

    const { result } = renderHook(() => useSubscriptionPriceNotice(true));

    await waitFor(() => {
      expect(result.current.notice?.scheduleId).toBe('sched-1');
    });

    await act(async () => {
      await result.current.submitDecision('DECLINED');
    });

    await waitFor(() => {
      expect(result.current.notice?.latestDecision).toBe('DECLINED');
    });

    expect(api.subscriptionPriceNotice.decline).toHaveBeenCalledWith({ scheduleId: 'sched-1' });
  });

  it('surfaces submit error without throwing', async () => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice).mockResolvedValue(wireNotice);

    vi.mocked(api.subscriptionPriceNotice.decline).mockRejectedValue(new Error('500'));

    const { result } = renderHook(() => useSubscriptionPriceNotice(true));

    await waitFor(() => {
      expect(result.current.notice?.scheduleId).toBe('sched-1');
    });

    await act(async () => {
      await result.current.submitDecision('DECLINED');
    });

    await waitFor(() => {
      expect(result.current.submitError).toMatch(/сохранить/i);
    });
  });

  it('keeps optimistic decision when POST succeeds but refetch fails', async () => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice)

      .mockResolvedValueOnce(wireNotice)

      .mockRejectedValueOnce(new Error('network'));

    vi.mocked(api.subscriptionPriceNotice.accept).mockResolvedValue({
      decision: 'ACCEPTED',

      decidedAt: '2026-08-01T00:00:00.000Z',
    });

    const { result } = renderHook(() => useSubscriptionPriceNotice(true));

    await waitFor(() => {
      expect(result.current.notice?.scheduleId).toBe('sched-1');
    });

    await act(async () => {
      await result.current.submitDecision('ACCEPTED');
    });

    await waitFor(() => {
      expect(result.current.notice?.latestDecision).toBe('ACCEPTED');
    });

    expect(result.current.submitError).toBeNull();

    expect(result.current.fetchError).toMatch(/загрузить/i);

    expect(result.current.fetchState).toBe('error');
  });

  it('refetches and replaces UI on stale schedule 404 without submit error', async () => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice)

      .mockResolvedValueOnce(wireNotice)

      .mockResolvedValueOnce({
        schedule: {
          id: 'sched-2',

          subscriptionLevelId: 'tier-12',

          currentPriceKopecks: 59900,

          newPriceKopecks: 69900,

          effectiveAt: '2026-10-01T00:00:00.000Z',
        },

        latestDecision: null,
      });

    vi.mocked(api.subscriptionPriceNotice.accept).mockRejectedValue({
      status: 404,

      code: '404',

      message: 'Active price schedule not found',
    });

    const { result } = renderHook(() => useSubscriptionPriceNotice(true));

    await waitFor(() => {
      expect(result.current.notice?.scheduleId).toBe('sched-1');
    });

    await act(async () => {
      await result.current.submitDecision('ACCEPTED');
    });

    await waitFor(() => {
      expect(result.current.notice?.scheduleId).toBe('sched-2');
    });

    expect(result.current.submitError).toBeNull();

    expect(api.subscriptionPriceNotice.fetchNotice).toHaveBeenCalledTimes(2);
  });

  it('hides notice when stale 404 refetch returns schedule=null', async () => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice)

      .mockResolvedValueOnce(wireNotice)

      .mockResolvedValueOnce({
        schedule: null,

        latestDecision: null,
      });

    vi.mocked(api.subscriptionPriceNotice.decline).mockRejectedValue({
      status: 404,

      code: '404',

      message: 'Active price schedule not found',
    });

    const { result } = renderHook(() => useSubscriptionPriceNotice(true));

    await waitFor(() => {
      expect(result.current.notice?.scheduleId).toBe('sched-1');
    });

    await act(async () => {
      await result.current.submitDecision('DECLINED');
    });

    await waitFor(() => {
      expect(result.current.notice).toBeNull();
    });

    expect(result.current.submitError).toBeNull();

    expect(result.current.fetchState).toBe('ready');
  });

  it('ignores concurrent double submit calls', async () => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice).mockResolvedValue(wireNotice);

    let resolveAccept: ((value: unknown) => void) | undefined;

    vi.mocked(api.subscriptionPriceNotice.accept).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAccept = resolve;
        }),
    );

    const { result } = renderHook(() => useSubscriptionPriceNotice(true));

    await waitFor(() => {
      expect(result.current.notice?.scheduleId).toBe('sched-1');
    });

    let firstCall: Promise<void>;

    let secondCall: Promise<void>;

    await act(async () => {
      firstCall = result.current.submitDecision('ACCEPTED');

      secondCall = result.current.submitDecision('ACCEPTED');
    });

    expect(api.subscriptionPriceNotice.accept).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveAccept?.({
        decision: 'ACCEPTED',

        decidedAt: '2026-08-01T00:00:00.000Z',
      });

      await firstCall!;

      await secondCall!;
    });
  });

  it('wires tierName from client profile into normalized notice', async () => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice).mockResolvedValue(wireNotice);

    const { result, rerender } = renderHook(
      ({ tierName }: { tierName: string | null }) => useSubscriptionPriceNotice(true, tierName),

      { initialProps: { tierName: null as string | null } },
    );

    await waitFor(() => {
      expect(result.current.notice?.scheduleId).toBe('sched-1');
    });

    expect(result.current.notice?.tierName).toBeUndefined();

    rerender({ tierName: '12 литров' });

    await waitFor(() => {
      expect(result.current.notice?.tierName).toBe('12 литров');
    });
  });

  it('clears submit error via clearSubmitError', async () => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice).mockResolvedValue(wireNotice);

    vi.mocked(api.subscriptionPriceNotice.decline).mockRejectedValue(new Error('500'));

    const { result } = renderHook(() => useSubscriptionPriceNotice(true));

    await waitFor(() => {
      expect(result.current.notice?.scheduleId).toBe('sched-1');
    });

    await act(async () => {
      await result.current.submitDecision('DECLINED');
    });

    await waitFor(() => {
      expect(result.current.submitError).toMatch(/сохранить/i);
    });

    act(() => {
      result.current.clearSubmitError();
    });

    expect(result.current.submitError).toBeNull();
  });

  it('sets isRetrying while reloading with existing notice', async () => {
    vi.mocked(api.subscriptionPriceNotice.fetchNotice).mockResolvedValue(wireNotice);

    const { result } = renderHook(() => useSubscriptionPriceNotice(true));

    await waitFor(() => {
      expect(result.current.fetchState).toBe('ready');
    });

    expect(result.current.isRetrying).toBe(false);

    let resolveReload: ((value: unknown) => void) | undefined;

    vi.mocked(api.subscriptionPriceNotice.fetchNotice).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveReload = resolve;
        }),
    );

    act(() => {
      void result.current.load();
    });

    await waitFor(() => {
      expect(result.current.isRetrying).toBe(true);
    });

    await act(async () => {
      resolveReload?.(wireNotice);
    });

    await waitFor(() => {
      expect(result.current.isRetrying).toBe(false);
    });
  });
});
