import { AbstractApiModule } from '../../abstractApiModule';
import {
  ClientProfileDTO,
  ShortClientResponseDTO,
  WaterHistoryFilters,
  WaterHistoryPageDTO,
} from '../../../../types/serverInterface/clientDTO';
import type { SubscriptionLevelsResponse } from '../../../../types/subscriptionLevel';
import { loyaltyBaseUrl, viwaTelemetryApiUrl } from '../../../../consts';
import { objectToQueryString } from '../../helpers/helpers';

export class LoyaltyModule extends AbstractApiModule {
  /** Legacy dashboard */
  fetchClientsList() {
    return this.request.get<void, ShortClientResponseDTO[]>(`${loyaltyBaseUrl}/client/getClients`);
  }

  /** Client web: current profile */
  fetchCurrentClientProfile() {
    return this.request.get<void, ClientProfileDTO>(`${viwaTelemetryApiUrl}/client/me`);
  }

  /** Legacy dashboard */
  fetchWaterHistoryList(filters: WaterHistoryFilters) {
    return this.request.get<void, WaterHistoryPageDTO>(
      `${loyaltyBaseUrl}/waterHistory/getList${objectToQueryString(filters)}`,
    );
  }

  /** Client web: subscription tiers */
  fetchSubscriptionLevels() {
    return this.request.get<void, SubscriptionLevelsResponse>(
      `${viwaTelemetryApiUrl}/client/subscription-levels`,
    );
  }
}

export default LoyaltyModule;
