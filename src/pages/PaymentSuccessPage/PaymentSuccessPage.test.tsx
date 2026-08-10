/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaymentSuccessPage from './PaymentSuccessPage';
import { VIWA_PENDING_PAYMENT_KEY } from '../../constants/pendingPayment';
import { installBrowserStorageMocks } from '../../test/browserMocks';

const navigateMock = vi.fn();
const retryMock = vi.fn();

const hookState = vi.hoisted(() => ({
  phase: 'checking' as 'checking' | 'error' | 'missing_pending',
  errorMessage: null as string | null,
  returnPath: '/home',
  pendingSession: {
    paymentId: 'pay-1',
    startedAt: Date.now(),
    returnPath: '/home',
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../../hooks/useRobokassaPaymentReturn', () => ({
  useRobokassaPaymentReturn: () => ({
    phase: hookState.phase,
    errorMessage: hookState.errorMessage,
    returnPath: hookState.returnPath,
    pendingSession: hookState.pendingSession,
    retry: retryMock,
  }),
}));

describe('PaymentSuccessPage', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
    window.history.pushState({}, '', '/payment/success');
    hookState.phase = 'checking';
    hookState.errorMessage = null;
    retryMock.mockReset();
    navigateMock.mockReset();
  });

  it('renders checking state without query params', () => {
    render(
      <MemoryRouter initialEntries={['/payment/success']}>
        <PaymentSuccessPage />
      </MemoryRouter>,
    );

    expect(window.location.search).toBe('');
    expect(screen.getByText('Проверяем оплату')).toBeTruthy();
    expect(screen.getByText('Проверяем оплату…')).toBeTruthy();
    expect(sessionStorage.getItem(VIWA_PENDING_PAYMENT_KEY)).toBeNull();
  });

  it('shows retry action on error phase', () => {
    hookState.phase = 'error';
    hookState.errorMessage = 'timeout';

    render(
      <MemoryRouter initialEntries={['/payment/success']}>
        <PaymentSuccessPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Проверить снова')).toBeTruthy();
    screen.getByText('Проверить снова').click();
    expect(retryMock).toHaveBeenCalledTimes(1);
  });
});
