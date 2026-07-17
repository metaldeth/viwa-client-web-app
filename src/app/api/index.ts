import { AxiosCoreApi } from './axiosCore';
import LoyaltyModule from './modules/loyalty';
import AuthModule from './modules/auth';
import BillingModule from './modules/billing';

const SNACK_API_BASE_URL = import.meta.env.VITE_APP_SNACK_API_URL ?? 'http://localhost:4000';

export class Api {
  private readonly request: AxiosCoreApi;
  public readonly loyalty: LoyaltyModule;
  public readonly auth: AuthModule;
  public readonly billing: BillingModule;

  constructor() {
    this.request = new AxiosCoreApi({
      baseURL: SNACK_API_BASE_URL,
    });

    this.loyalty = new LoyaltyModule(this.request);
    this.auth = new AuthModule(this.request);
    this.billing = new BillingModule(this.request);
  }

  clearTokens(): void {
    this.request.accessToken = null;
  }

  saveToken(token: string): void {
    this.request.accessToken = token;
  }
}

export const api = new Api();
