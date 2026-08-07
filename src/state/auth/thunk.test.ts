import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slice';
import { checkCodeAndCreateClientThunk } from './thunk';
import { VIWA_ENTRY_STORAGE_KEY, VIWA_SERIAL_STORAGE_KEY } from '../../utils/landingEntry';
import { installBrowserStorageMocks, installHistoryMock } from '../../test/browserMocks';

const checkCodeMock = vi.fn();

vi.mock('../../app/api', () => ({
  api: {
    auth: {
      checkCodeAndCreateClient: (...args: unknown[]) => checkCodeMock(...args),
    },
    saveTokens: vi.fn(),
  },
}));

describe('checkCodeAndCreateClientThunk', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
    installHistoryMock('/m/VIWA-000004/auth/sms/60/79991234567');
    checkCodeMock.mockReset();
    checkCodeMock.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 3600,
      client: { id: 'client-1' },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('CW05-3: includes registrationHint from viwa_entry=website', async () => {
    sessionStorage.setItem(VIWA_ENTRY_STORAGE_KEY, 'website');

    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(
      checkCodeAndCreateClientThunk({
        phoneNumber: '79991234567',
        code: '1234',
        machineSerial: 'VIWA-000004',
      }),
    );

    expect(checkCodeMock).toHaveBeenCalledWith('79991234567', '1234', {
      machineSerial: 'VIWA-000004',
      registrationHint: 'website',
    });
  });

  it('CW05-4: strips serial from URL after first registration', async () => {
    sessionStorage.setItem(VIWA_ENTRY_STORAGE_KEY, 'website');
    sessionStorage.setItem(VIWA_SERIAL_STORAGE_KEY, 'VIWA-000004');

    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(
      checkCodeAndCreateClientThunk({
        phoneNumber: '79991234567',
        code: '1234',
        machineSerial: 'VIWA-000004',
      }),
    );

    expect(window.location.pathname).toBe('/home');
    expect(sessionStorage.getItem(VIWA_SERIAL_STORAGE_KEY)).toBeNull();
  });

  it('CW05-6: website registration without serial navigates to /home', async () => {
    sessionStorage.setItem(VIWA_ENTRY_STORAGE_KEY, 'website');
    installHistoryMock('/auth/sms/60/79991234567/FLASHCALL');

    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(
      checkCodeAndCreateClientThunk({
        phoneNumber: '79991234567',
        code: '1234',
      }),
    );

    expect(checkCodeMock).toHaveBeenCalledWith('79991234567', '1234', {
      registrationHint: 'website',
    });
    expect(window.location.pathname).toBe('/home');
    expect(sessionStorage.getItem(VIWA_SERIAL_STORAGE_KEY)).toBeNull();
  });

  it('returning auth without website hint still navigates to /home', async () => {
    installHistoryMock('/auth/sms/60/79991234567/FLASHCALL');

    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(
      checkCodeAndCreateClientThunk({
        phoneNumber: '79991234567',
        code: '1234',
      }),
    );

    expect(checkCodeMock).toHaveBeenCalledWith('79991234567', '1234', {
      registrationHint: undefined,
    });
    expect(window.location.pathname).toBe('/home');
  });
});
