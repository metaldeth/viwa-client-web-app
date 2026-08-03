import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import {
  clearAuthTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  saveAuthTokens,
} from './authStorage';
import { ACCESS_TOKEN_STORAGE_NAME } from '../../consts/env/storage';
import { viwaTelemetryApiUrl } from '../../consts';
import { redirectToClientAuth } from '../../pages/ValidationPage/helpers';

type ApiError = {
  code: string;
  message: string;
  key?: string;
  retryAfterSeconds?: number;
  status?: number;
};

export type AxiosRequestConfigWithAuth = AxiosRequestConfig & {
  skipAuth?: boolean;
  _retry?: boolean;
};

type RefreshOutcome =
  | { status: 'success'; accessToken: string }
  | { status: 'no_refresh_token' }
  | { status: 'transient_failure' }
  | { status: 'definitive_failure' };

export function isTransientRefreshError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return true;
  }

  const axiosError = error as AxiosError;
  const status = axiosError.response?.status;

  if (status === undefined) {
    return true;
  }

  if (status === 429 || status >= 500) {
    return true;
  }

  if (axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNABORTED') {
    return true;
  }

  return false;
}

export class AxiosCoreApi {
  private readonly _apiConfig: AxiosRequestConfig;
  private _axiosInstance: AxiosInstance;
  private _accessToken: string | null = null;
  private _refreshPromise: Promise<RefreshOutcome> | null = null;
  private readonly _handleStorageEvent: (event: StorageEvent) => void;

  constructor(apiConfig?: AxiosRequestConfig) {
    this._apiConfig = apiConfig || {};
    this._axiosInstance = axios.create(apiConfig);

    this._accessToken = getStoredAccessToken();

    this._handleStorageEvent = (event: StorageEvent) => {
      if (event.key === ACCESS_TOKEN_STORAGE_NAME) {
        this._accessToken = event.newValue;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this._handleStorageEvent);
    }

    this.extractData = this.extractData.bind(this);

    this._axiosInstance.interceptors.request.use(
      (config) => {
        const cfg = config as InternalAxiosRequestConfig & AxiosRequestConfigWithAuth;

        if (this._accessToken && !cfg.skipAuth) {
          cfg.headers = cfg.headers || {};
          cfg.headers.Authorization = `Bearer ${this._accessToken}`;
        }

        return cfg;
      },

      (error) => {
        console.log('cors, ', error);
        return { ...error, code: 'CORS' };
      },
    );

    this._axiosInstance.interceptors.response.use(
      (data) => data,
      async (error): Promise<ApiError> => {
        const status = error.response?.status;
        const originalConfig = error.config as AxiosRequestConfigWithAuth | undefined;

        if (
          status === 401 &&
          originalConfig &&
          !originalConfig.skipAuth &&
          !originalConfig._retry &&
          !originalConfig.url?.includes('/client/auth/refresh')
        ) {
          originalConfig._retry = true;

          const refreshOutcome = await this.refreshAccessToken();

          if (refreshOutcome.status === 'success') {
            originalConfig.headers = originalConfig.headers || {};
            originalConfig.headers.Authorization = `Bearer ${refreshOutcome.accessToken}`;
            return this._axiosInstance.request(originalConfig);
          }

          if (refreshOutcome.status === 'definitive_failure') {
            this.clearSessionAndRedirect();
          }
        }

        const responseData = error.response?.data as Record<string, unknown> | undefined;
        const bodyCode = responseData?.code;
        const bodyMessage = responseData?.message ?? responseData?.key;

        return Promise.reject({
          ...error,
          code: bodyCode != null ? String(bodyCode) : String(status),
          message: String(bodyMessage ?? 'Unauthorized'),
          retryAfterSeconds:
            typeof responseData?.retryAfterSeconds === 'number'
              ? responseData.retryAfterSeconds
              : undefined,
          status,
        } satisfies ApiError);
      },
    );
  }

  private clearSessionAndRedirect(): void {
    clearAuthTokens();
    this._accessToken = null;
    redirectToClientAuth();
  }

  private async refreshAccessToken(): Promise<RefreshOutcome> {
    if (this._refreshPromise) {
      return this._refreshPromise;
    }

    this._refreshPromise = this.performRefresh(false);

    try {
      return await this._refreshPromise;
    } finally {
      this._refreshPromise = null;
    }
  }

  private async performRefresh(isCrossTabRetry: boolean): Promise<RefreshOutcome> {
    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
      return { status: 'no_refresh_token' };
    }

    const attemptedRefreshToken = refreshToken;

    try {
      const response = await axios.post<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>(
        `${viwaTelemetryApiUrl}/client/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const { accessToken, refreshToken: nextRefreshToken } = response.data;

      saveAuthTokens(accessToken, nextRefreshToken);
      this._accessToken = accessToken;

      return { status: 'success', accessToken };
    } catch (error) {
      if (isTransientRefreshError(error)) {
        return { status: 'transient_failure' };
      }

      const status = axios.isAxiosError(error) ? error.response?.status : undefined;

      if (status === 401 || status === 403) {
        const currentRefreshToken = getStoredRefreshToken();

        if (
          !isCrossTabRetry &&
          currentRefreshToken &&
          currentRefreshToken !== attemptedRefreshToken
        ) {
          return this.performRefresh(true);
        }

        return { status: 'definitive_failure' };
      }

      return { status: 'transient_failure' };
    }
  }

  public get accessToken() {
    return this._accessToken;
  }

  public set accessToken(value: string | null) {
    this._accessToken = value;
  }

  public get<
    Req extends Record<string, unknown> | unknown = unknown,
    Res extends Record<string, unknown> | any[] | void = void,
  >(url: string, params?: Req, config?: AxiosRequestConfigWithAuth): Promise<Res> {
    return this._axiosInstance.get<Res>(url, { ...(config ?? {}), params }).then(this.extractData);
  }

  public post<
    Req extends Record<string, unknown> | unknown = unknown,
    Res extends Record<string, unknown> | string | any[] | void = void,
  >(url: string, data?: Req, config?: AxiosRequestConfigWithAuth): Promise<Res> {
    return this._axiosInstance.post<Res>(url, data, config).then(this.extractData);
  }

  public put<Req extends Record<string, unknown> | unknown = unknown, Res = void>(
    url: string,
    data?: Req,
    config?: AxiosRequestConfigWithAuth,
  ): Promise<Res> {
    return this._axiosInstance.put<Res>(url, data, config).then(this.extractData);
  }

  public patch<
    Req extends Record<string, unknown> | unknown = unknown,
    Res extends Record<string, unknown> | void = void,
  >(url: string, data?: Req, config?: AxiosRequestConfigWithAuth): Promise<Res> {
    return this._axiosInstance.patch<Res>(url, data, config).then(this.extractData);
  }

  public delete<Res extends Record<string, unknown> | void = void>(
    url: string,
    config?: AxiosRequestConfigWithAuth,
  ): Promise<Res> {
    return this._axiosInstance.delete<Res>(url, config).then(this.extractData);
  }

  private extractData<T>(response: AxiosResponse<T>): T {
    return response.data;
  }
}
