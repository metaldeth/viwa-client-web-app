import { AxiosCoreApi } from './axiosCore';
import LoyaltyModule from './modules/loyalty';
import AuthModule from './modules/auth';
import BillingModule from './modules/billing';
import PublicModule from './modules/public';
import { ACCESS_TOKEN_STORAGE_NAME, REFRESH_TOKEN_STORAGE_NAME } from '../../consts/env/storage';
import { ClientDataType } from '../../types/enums/clientDataType';

const SNACK_API_BASE_URL = import.meta.env.VITE_APP_SNACK_API_URL ?? 'http://localhost:4000';

export class Api {
  private readonly request: AxiosCoreApi;
  public readonly loyalty: LoyaltyModule;
  public readonly auth: AuthModule;
  public readonly billing: BillingModule;
  public readonly publicApi: PublicModule;

  constructor() {
    this.request = new AxiosCoreApi({
      baseURL: SNACK_API_BASE_URL,
    });

    this.loyalty = new LoyaltyModule(this.request);
    this.auth = new AuthModule(this.request);
    this.billing = new BillingModule(this.request);
    this.publicApi = new PublicModule(this.request);
  }

  clearTokens(): void {
    this.request.accessToken = null;
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_NAME);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_NAME);
    localStorage.removeItem(ClientDataType.CLIENT_TOKEN);
  }

  saveTokens(accessToken: string, refreshToken: string, clientId?: string): void {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, accessToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, refreshToken);

    if (clientId) {
      localStorage.setItem(ClientDataType.CLIENT_TOKEN, clientId);
    }

    this.request.accessToken = accessToken;
  }

  saveToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, token);
    this.request.accessToken = token;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_NAME);
  }
}

export const api = new Api();
