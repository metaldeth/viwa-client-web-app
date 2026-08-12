import { useEffect, useState } from 'react';

const KEYBOARD_SHRINK_PX = 120;

export type VisualViewportKeyboardState = {
  /** True when visual viewport is meaningfully shorter than layout viewport (keyboard / browser chrome). */
  isKeyboardOpen: boolean;
};

/**
 * Keeps `--vvh` / `--vv-offset-top` in sync with `visualViewport` so auth layouts
 * can fit above the iOS keyboard instead of overlapping the logo or clipping.
 */
export const useVisualViewportKeyboard = (): VisualViewportKeyboardState => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const vv = window.visualViewport;

    const sync = () => {
      const height = vv?.height ?? window.innerHeight;
      const offsetTop = vv?.offsetTop ?? 0;
      const layoutHeight = window.innerHeight;
      const keyboardOpen = layoutHeight - height > KEYBOARD_SHRINK_PX;

      root.style.setProperty('--vvh', `${Math.round(height)}px`);
      root.style.setProperty('--vv-offset-top', `${Math.round(offsetTop)}px`);
      root.classList.toggle('vv-keyboard-open', keyboardOpen);
      setIsKeyboardOpen(keyboardOpen);
    };

    sync();

    vv?.addEventListener('resize', sync);
    vv?.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);

    return () => {
      vv?.removeEventListener('resize', sync);
      vv?.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
      root.classList.remove('vv-keyboard-open');
      root.style.removeProperty('--vvh');
      root.style.removeProperty('--vv-offset-top');
    };
  }, []);

  return { isKeyboardOpen };
};
