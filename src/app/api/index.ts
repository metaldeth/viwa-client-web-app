import { AxiosCoreApi } from './axiosCore';
import {
  clearAuthTokens,
  getStoredRefreshToken,
  saveAccessToken,
  saveAuthTokens,
} from './authStorage';
import LoyaltyModule from './modules/loyalty';
import AuthModule from './modules/auth';
import BillingModule from './modules/billing';
import PublicModule from './modules/public';
import SubscriptionPriceNoticeModule from './modules/subscriptionPriceNotice';

const SNACK_API_BASE_URL = import.meta.env.VITE_APP_SNACK_API_URL ?? 'http://localhost:4000';

export class Api {
  private readonly request: AxiosCoreApi;
  public readonly loyalty: LoyaltyModule;
  public readonly auth: AuthModule;
  public readonly billing: BillingModule;
  public readonly publicApi: PublicModule;
  public readonly subscriptionPriceNotice: SubscriptionPriceNoticeModule;

  constructor() {
    this.request = new AxiosCoreApi({
      baseURL: SNACK_API_BASE_URL,
    });

    this.loyalty = new LoyaltyModule(this.request);
    this.auth = new AuthModule(this.request);
    this.billing = new BillingModule(this.request);
    this.publicApi = new PublicModule(this.request);
    this.subscriptionPriceNotice = new SubscriptionPriceNoticeModule(this.request);
  }

  clearTokens(): void {
    this.request.accessToken = null;
    clearAuthTokens();
  }

  saveTokens(accessToken: string, refreshToken: string, clientId?: string): void {
    saveAuthTokens(accessToken, refreshToken, clientId);
    this.request.accessToken = accessToken;
  }

  saveToken(token: string): void {
    saveAccessToken(token);
    this.request.accessToken = token;
  }

  getRefreshToken(): string | null {
    return getStoredRefreshToken();
  }
}

export const api = new Api();
