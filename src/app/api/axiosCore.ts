import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { api } from './index';
import { ACCESS_TOKEN_STORAGE_NAME } from '../../consts/env/storage';
import { ClientDataType } from '../../types/enums/clientDataType';

type ApiError = {
  code: string;
  message: string;
  key: string;
};

export type AxiosRequestConfigWithAuth = AxiosRequestConfig & {
  skipAuth?: boolean;
};

export class AxiosCoreApi {
  private readonly _apiConfig: AxiosRequestConfig;
  private _axiosInstance: AxiosInstance;
  private _accessToken: string | null = null;

  constructor(apiConfig?: AxiosRequestConfig) {
    this._apiConfig = apiConfig || {};
    this._axiosInstance = axios.create(apiConfig);

    this._accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME);

    this.extractData = this.extractData.bind(this);

    this._axiosInstance.interceptors.request.use(
      (config) => {
        const cfg = config as AxiosRequestConfigWithAuth;

        if (this._accessToken && !cfg.skipAuth) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${this._accessToken}`;
        }

        return config;
      },

      (error) => {
        console.log('cors, ', error);
        return { ...error, code: 'CORS' };
      },
    );

    this._axiosInstance.interceptors.response.use(
      (data) => data,
      (error): Promise<ApiError> => {
        const status = error.response?.status;

        if (status === 401) {
          api.clearTokens();

          localStorage.removeItem(ACCESS_TOKEN_STORAGE_NAME);
          localStorage.removeItem(ClientDataType.CLIENT_TOKEN);

          this._accessToken = null;
        }

        return Promise.reject({
          ...error,
          code: String(status),
          message: String(
            error.response?.data?.key || error.response?.data?.message || 'Unauthorized',
          ),
        });
      },
    );
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
