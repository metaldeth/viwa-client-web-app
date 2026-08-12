/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import CabinetAuthShell from './CabinetAuthShell';
import styles from './CabinetAuthShell.module.scss';

describe('CabinetAuthShell', () => {
  it('centers main content by default for short auth flows', () => {
    const { container } = render(
      <CabinetAuthShell title="SMS">
        <div>child</div>
      </CabinetAuthShell>,
    );

    const main = container.querySelector('main');
    expect(main?.className).toContain(styles.main);
    expect(main?.className).not.toContain(styles.mainScroll);
  });

  it('applies scroll-friendly top alignment when mainLayout is scroll', () => {
    const { container } = render(
      <CabinetAuthShell title="Auth" mainLayout="scroll">
        <div>child</div>
      </CabinetAuthShell>,
    );

    const main = container.querySelector('main');
    expect(main?.className).toContain(styles.mainScroll);
  });

  it('renders legal footer while keyboard is closed', () => {
    const { container } = render(
      <CabinetAuthShell title="SMS">
        <div>child</div>
      </CabinetAuthShell>,
    );

    expect(container.querySelector('footer')).not.toBeNull();
    expect(container.firstElementChild?.className).not.toContain(styles.pageShellKeyboard);
  });
});
