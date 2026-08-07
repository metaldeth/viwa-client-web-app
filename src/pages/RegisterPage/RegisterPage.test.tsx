/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { VIWA_ENTRY_STORAGE_KEY } from '../../utils/landingEntry';
import { installBrowserStorageMocks } from '../../test/browserMocks';

vi.mock('../SerialCapturePage', () => ({
  default: () => <div data-testid="serial-capture-page">SerialCapture</div>,
}));

describe('RegisterPage website entry', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('CW05-2: /register?entry=website without serial redirects to /auth', async () => {
    render(
      <MemoryRouter initialEntries={['/register?entry=website']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth" element={<div data-testid="auth-page">Auth</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('auth-page')).toBeTruthy();
    expect(screen.queryByTestId('serial-capture-page')).toBeNull();
    expect(sessionStorage.getItem(VIWA_ENTRY_STORAGE_KEY)).toBe('website');
  });

  it('keeps SerialCapture when entry is not website and serial is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth" element={<div data-testid="auth-page">Auth</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('serial-capture-page')).toBeTruthy();
    expect(screen.queryByTestId('auth-page')).toBeNull();
  });
});
