/**
 * @vitest-environment jsdom
 */
import axios, { AxiosError, AxiosInstance } from 'axios';
import { AxiosCoreApi, isTransientRefreshError } from './axiosCore';
import { ACCESS_TOKEN_STORAGE_NAME, REFRESH_TOKEN_STORAGE_NAME } from '../../consts/env/storage';
import { ClientDataType } from '../../types/enums/clientDataType';
import { installBrowserStorageMocks } from '../../test/browserMocks';

const redirectMock = vi.hoisted(() => vi.fn());

vi.mock('../../pages/ValidationPage/helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../pages/ValidationPage/helpers')>();
  return {
    ...actual,
    redirectToClientAuth: () => redirectMock(),
  };
});

type InterceptorHandlers = {
  responseError?: (error: unknown) => Promise<unknown>;
};

const interceptorHandlers = vi.hoisted((): InterceptorHandlers => ({}));

const mockInstanceRequest = vi.hoisted(() => vi.fn());

const mockAxiosInstance = vi.hoisted(() => {
  const instance = {
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn((_success: unknown, errorHandler: (error: unknown) => Promise<unknown>) => {
          interceptorHandlers.responseError = errorHandler;
        }),
      },
    },
    request: mockInstanceRequest,
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };

  return instance as unknown as AxiosInstance;
});

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();

  return {
    default: {
      ...actual.default,
      create: vi.fn(() => mockAxiosInstance),
      post: vi.fn(),
      isAxiosError: actual.default.isAxiosError,
    },
  };
});

const seedTokens = () => {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, 'stale-access');
  localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, 'refresh-token');
  localStorage.setItem(ClientDataType.CLIENT_TOKEN, 'client-1');
};

const create401Error = (url = '/api/protected') => {
  const error = {
    response: { status: 401, data: { message: 'Unauthorized' } },
    config: { url, skipAuth: false, _retry: false, headers: {} },
    isAxiosError: true,
  };

  return error;
};

describe('isTransientRefreshError', () => {
  it('treats network failures as transient', () => {
    const error = { isAxiosError: true, code: 'ERR_NETWORK' } as AxiosError;
    expect(isTransientRefreshError(error)).toBe(true);
  });

  it('treats 5xx and 429 as transient', () => {
    expect(
      isTransientRefreshError({
        isAxiosError: true,
        response: { status: 503 },
      } as AxiosError),
    ).toBe(true);

    expect(
      isTransientRefreshError({
        isAxiosError: true,
        response: { status: 429 },
      } as AxiosError),
    ).toBe(true);
  });

  it('treats refresh 401 as non-transient', () => {
    expect(
      isTransientRefreshError({
        isAxiosError: true,
        response: { status: 401 },
      } as AxiosError),
    ).toBe(false);
  });
});

describe('AxiosCoreApi auth persistence', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
    redirectMock.mockClear();
    mockInstanceRequest.mockReset();
    vi.mocked(axios.post).mockReset();
    interceptorHandlers.responseError = undefined;
  });

  it('reconstructs in-memory access token from localStorage after reload', () => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, 'persisted-access');
    localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, 'persisted-refresh');

    const api = new AxiosCoreApi({ baseURL: 'http://localhost:4000' });

    expect(api.accessToken).toBe('persisted-access');
  });

  it('updates in-memory access token on cross-tab storage event', () => {
    const api = new AxiosCoreApi({ baseURL: 'http://localhost:4000' });

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: ACCESS_TOKEN_STORAGE_NAME,
        newValue: 'rotated-access',
      }),
    );

    expect(api.accessToken).toBe('rotated-access');
  });

  it('preserves all tokens and skips redirect on transient refresh failure', async () => {
    seedTokens();
    new AxiosCoreApi({ baseURL: 'http://localhost:4000' });

    vi.mocked(axios.post).mockRejectedValueOnce({
      isAxiosError: true,
      code: 'ERR_NETWORK',
    });

    mockInstanceRequest.mockRejectedValueOnce(create401Error());

    await expect(interceptorHandlers.responseError!(create401Error())).rejects.toMatchObject({
      code: '401',
    });

    expect(localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME)).toBe('stale-access');
    expect(localStorage.getItem(REFRESH_TOKEN_STORAGE_NAME)).toBe('refresh-token');
    expect(localStorage.getItem(ClientDataType.CLIENT_TOKEN)).toBe('client-1');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('clears tokens and redirects on definitive refresh 401', async () => {
    seedTokens();
    new AxiosCoreApi({ baseURL: 'http://localhost:4000' });

    vi.mocked(axios.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 401, data: { message: 'invalid refresh' } },
    });

    await expect(interceptorHandlers.responseError!(create401Error())).rejects.toMatchObject({
      code: '401',
    });

    expect(localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_STORAGE_NAME)).toBeNull();
    expect(localStorage.getItem(ClientDataType.CLIENT_TOKEN)).toBeNull();
    expect(redirectMock).toHaveBeenCalledTimes(1);
  });

  it('retries refresh once when another tab rotated the refresh token', async () => {
    seedTokens();
    new AxiosCoreApi({ baseURL: 'http://localhost:4000' });

    vi.mocked(axios.post)
      .mockImplementationOnce(async () => {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, 'rotated-refresh');
        throw {
          isAxiosError: true,
          response: { status: 401, data: { message: 'stale refresh' } },
        };
      })
      .mockResolvedValueOnce({
        data: {
          accessToken: 'fresh-access',
          refreshToken: 'fresh-refresh',
          expiresIn: 3600,
        },
      });

    mockInstanceRequest.mockResolvedValueOnce({ data: 'ok' });

    await interceptorHandlers.responseError!(create401Error());

    expect(vi.mocked(axios.post)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(axios.post).mock.calls[1]?.[1]).toEqual({ refreshToken: 'rotated-refresh' });
    expect(localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME)).toBe('fresh-access');
    expect(localStorage.getItem(REFRESH_TOKEN_STORAGE_NAME)).toBe('fresh-refresh');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('single-flights concurrent 401 refresh attempts in the same tab', async () => {
    seedTokens();
    new AxiosCoreApi({ baseURL: 'http://localhost:4000' });

    let resolveRefresh!: (value: unknown) => void;
    const refreshGate = new Promise((resolve) => {
      resolveRefresh = resolve;
    });

    vi.mocked(axios.post).mockImplementationOnce(async () => {
      await refreshGate;
      return {
        data: {
          accessToken: 'fresh-access',
          refreshToken: 'fresh-refresh',
          expiresIn: 3600,
        },
      };
    });

    mockInstanceRequest.mockResolvedValue({ data: 'ok' });

    const first = interceptorHandlers.responseError!(create401Error('/api/a'));
    const second = interceptorHandlers.responseError!(create401Error('/api/b'));

    resolveRefresh(undefined);

    await Promise.all([first, second]);

    expect(vi.mocked(axios.post)).toHaveBeenCalledTimes(1);
  });
});
