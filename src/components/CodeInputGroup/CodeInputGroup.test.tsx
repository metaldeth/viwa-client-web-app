/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import CodeInputGroup from './CodeInputGroup';

describe('CodeInputGroup', () => {
  it('renders four OTP slots with accessible labels', () => {
    render(
      <CodeInputGroup
        count={4}
        isValid={undefined}
        disabled={false}
        onChangeInput={() => undefined}
        onComplete={() => undefined}
      />,
    );

    expect(screen.getByRole('group', { name: 'Код подтверждения' })).toBeTruthy();
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
    expect(screen.getByLabelText('Цифра 1 из 4')).toBeTruthy();
    expect(screen.getByLabelText('Цифра 4 из 4')).toBeTruthy();
  });

  it('marks group invalid when isValid is false', () => {
    render(
      <CodeInputGroup
        count={4}
        isValid={false}
        disabled={false}
        onChangeInput={() => undefined}
        onComplete={() => undefined}
      />,
    );

    expect(screen.getByRole('group').getAttribute('aria-invalid')).toBe('true');
  });
});
