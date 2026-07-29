import { AbstractApiModule } from '../../abstractApiModule';
import {
  ClientProfileDTO,
  ShortClientResponseDTO,
  WaterHistoryFilters,
  WaterHistoryPageDTO,
} from '../../../../types/serverInterface/clientDTO';
import type { SubscriptionLevelsResponse } from '../../../../types/subscriptionLevel';
import type {
  UpdateFavoriteTastesRequest,
  UpdateFavoriteTastesResponse,
} from '../../../../types/publicCatalog';
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

  /** Client web: update favorite tastes (max 3 canonical keys) */
  updateFavoriteTastes(body: UpdateFavoriteTastesRequest) {
    return this.request.put<UpdateFavoriteTastesRequest, UpdateFavoriteTastesResponse>(
      `${viwaTelemetryApiUrl}/client/me/favorite-tastes`,
      body,
    );
  }
}

export default LoyaltyModule;
