/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps start and stop referentially stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useTimer());

    const { start: start1, stop: stop1 } = result.current;
    rerender();
    const { start: start2, stop: stop2 } = result.current;

    expect(start1).toBe(start2);
    expect(stop1).toBe(stop2);
  });

  it('does not reset timer when hook rerenders on each tick', () => {
    const onComplete = vi.fn();
    const { result, rerender } = renderHook(() => useTimer());

    act(() => {
      result.current.start(5, onComplete);
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    rerender();
    expect(result.current.currentTime).toBe(3);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    rerender();
    expect(result.current.currentTime).toBe(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('invokes completion callback once when timer naturally reaches zero', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start(2, onComplete);
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.current.currentTime).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it('does not invoke previous completion when restarting via start', () => {
    const firstComplete = vi.fn();
    const secondComplete = vi.fn();
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start(3, firstComplete);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.start(4, secondComplete);
    });

    expect(firstComplete).not.toHaveBeenCalled();
    expect(result.current.currentTime).toBe(4);

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(firstComplete).not.toHaveBeenCalled();
    expect(secondComplete).toHaveBeenCalledTimes(1);
  });

  it('does not invoke completion when stopped manually', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start(5, onComplete);
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.stop();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onComplete).not.toHaveBeenCalled();
    expect(result.current.currentTime).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it('clears interval on unmount without firing completion', () => {
    const onComplete = vi.fn();
    const { result, unmount } = renderHook(() => useTimer());

    act(() => {
      result.current.start(10, onComplete);
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
