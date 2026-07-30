/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ACCESS_TOKEN_STORAGE_NAME, REFRESH_TOKEN_STORAGE_NAME } from '../../consts/env/storage';
import { installBrowserStorageMocks } from '../../test/browserMocks';
import ReturningAuthGuard from './ReturningAuthGuard';

vi.mock('../AuthPage', () => ({
  default: () => <div data-testid="auth-page">auth</div>,
}));

describe('ReturningAuthGuard', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
  });

  it('redirects returning users with refresh token away from auth', () => {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, 'refresh-token');

    render(
      <MemoryRouter initialEntries={['/auth']}>
        <ReturningAuthGuard>
          <div data-testid="auth-page">auth</div>
        </ReturningAuthGuard>
      </MemoryRouter>,
    );

    expect(screen.queryByTestId('auth-page')).toBeNull();
  });

  it('shows auth UI for users without credentials', () => {
    render(
      <MemoryRouter initialEntries={['/auth']}>
        <ReturningAuthGuard>
          <div data-testid="auth-page">auth</div>
        </ReturningAuthGuard>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('auth-page')).toBeTruthy();
  });

  it('redirects access-only returning users away from auth', () => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, 'access-only');

    render(
      <MemoryRouter initialEntries={['/auth']}>
        <ReturningAuthGuard>
          <div data-testid="auth-page">auth</div>
        </ReturningAuthGuard>
      </MemoryRouter>,
    );

    expect(screen.queryByTestId('auth-page')).toBeNull();
  });
});
