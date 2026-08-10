/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaymentFailedPage from './PaymentFailedPage';
import { ACCESS_TOKEN_STORAGE_NAME, REFRESH_TOKEN_STORAGE_NAME } from '../../consts/env/storage';
import { ClientDataType } from '../../types/enums/clientDataType';
import { installBrowserStorageMocks } from '../../test/browserMocks';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../../hooks/useRobokassaPaymentReturn', () => ({
  useRobokassaPaymentReturn: () => ({
    phase: 'error',
    errorMessage:
      'Платёж отклонён или прерван. Авторизация сохранена — вы можете попробовать снова.',
    returnPath: '/home',
    pendingSession: null,
    retry: vi.fn(),
  }),
}));

describe('PaymentFailedPage', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
    localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, 'access-token');
    localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, 'refresh-token');
    localStorage.setItem(ClientDataType.CLIENT_TOKEN, 'client-1');
    window.history.pushState({}, '', '/payment/failed');
  });

  it('renders failed state without query params and keeps auth tokens', () => {
    render(
      <MemoryRouter initialEntries={['/payment/failed']}>
        <PaymentFailedPage />
      </MemoryRouter>,
    );

    expect(window.location.search).toBe('');
    expect(screen.getByText('Оплата не прошла')).toBeTruthy();
    expect(screen.getByText('Вернуться в кабинет')).toBeTruthy();
    expect(localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME)).toBe('access-token');
    expect(localStorage.getItem(REFRESH_TOKEN_STORAGE_NAME)).toBe('refresh-token');
    expect(localStorage.getItem(ClientDataType.CLIENT_TOKEN)).toBe('client-1');
  });
});
