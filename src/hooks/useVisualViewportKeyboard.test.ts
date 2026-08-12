/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useVisualViewportKeyboard } from './useVisualViewportKeyboard';

describe('useVisualViewportKeyboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.classList.remove('vv-keyboard-open');
    document.documentElement.style.removeProperty('--vvh');
    document.documentElement.style.removeProperty('--vv-offset-top');
  });

  it('sets --vvh from visualViewport and toggles keyboard class when shrunk', () => {
    const listeners = new Map<string, Set<() => void>>();
    const vv = {
      height: 400,
      offsetTop: 12,
      addEventListener: (type: string, cb: () => void) => {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type)!.add(cb);
      },
      removeEventListener: (type: string, cb: () => void) => {
        listeners.get(type)?.delete(cb);
      },
    };

    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
    vi.stubGlobal('visualViewport', vv);

    const { result, unmount } = renderHook(() => useVisualViewportKeyboard());

    expect(result.current.isKeyboardOpen).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--vvh')).toBe('400px');
    expect(document.documentElement.style.getPropertyValue('--vv-offset-top')).toBe('12px');
    expect(document.documentElement.classList.contains('vv-keyboard-open')).toBe(true);

    act(() => {
      vv.height = 844;
      vv.offsetTop = 0;
      listeners.get('resize')?.forEach((cb) => cb());
    });

    expect(result.current.isKeyboardOpen).toBe(false);
    expect(document.documentElement.classList.contains('vv-keyboard-open')).toBe(false);

    unmount();
    expect(document.documentElement.classList.contains('vv-keyboard-open')).toBe(false);
  });
});
