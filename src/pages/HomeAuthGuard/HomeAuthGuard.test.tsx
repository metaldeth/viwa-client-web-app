/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HomeAuthGuard from './HomeAuthGuard';
import { VIWA_PENDING_PAYMENT_KEY } from '../../constants/pendingPayment';
import { installBrowserStorageMocks } from '../../test/browserMocks';

describe('HomeAuthGuard', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
    localStorage.clear();
  });

  it('redirects payment return to machine auth when pending session has machine context', async () => {
    sessionStorage.setItem(
      VIWA_PENDING_PAYMENT_KEY,
      JSON.stringify({
        paymentId: 'pay-1',
        startedAt: Date.now(),
        returnPath: '/m/VIWA-001/home',
      }),
    );

    render(
      <MemoryRouter initialEntries={['/payment/success']}>
        <Routes>
          <Route
            path="/payment/success"
            element={
              <HomeAuthGuard>
                <div data-testid="protected">protected</div>
              </HomeAuthGuard>
            }
          />
          <Route path="/m/:serial/auth" element={<div data-testid="machine-auth">auth</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('machine-auth')).toBeTruthy();
    });
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('redirects /home without tokens to global auth', async () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <Routes>
          <Route
            path="/home"
            element={
              <HomeAuthGuard>
                <div data-testid="protected">protected</div>
              </HomeAuthGuard>
            }
          />
          <Route path="/auth" element={<div data-testid="global-auth">auth</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('global-auth')).toBeTruthy();
    });
  });

  it('renders children when auth tokens are present', () => {
    localStorage.setItem('api/refreshToken', 'refresh');

    render(
      <MemoryRouter initialEntries={['/payment/success']}>
        <Routes>
          <Route
            path="/payment/success"
            element={
              <HomeAuthGuard>
                <div data-testid="protected">protected</div>
              </HomeAuthGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('protected')).toBeTruthy();
  });
});
