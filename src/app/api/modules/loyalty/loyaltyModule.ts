import { AbstractApiModule } from '../../abstractApiModule';
import {
  ClientDTO,
  CreateClientDto,
  CreateClientRes,
  ShortClientResponseDTO,
  WaterHistoryFilters,
  WaterHistoryPageDTO,
} from '../../../../types/serverInterface/clientDTO';
import type { SubscriptionLevelDTO } from '../../../../types/subscriptionLevel';
import { loyaltyBaseUrl } from '../../../../consts';
import { objectToQueryString } from '../../helpers/helpers';

export class LoyaltyModule extends AbstractApiModule {
  /**
   * Получение списка клиентов
   */
  fetchClientsList() {
    return this.request.get<void, ShortClientResponseDTO[]>(`${loyaltyBaseUrl}/client/getClients`);
  }

  /**
   * Получение информации о клиенте
   *
   * @param clientId id клиента
   */
  fetchClientInformation(clientId: string) {
    return this.request.get<void, ClientDTO>(`${loyaltyBaseUrl}/client/getClient/${clientId}`);
  }

  /**
   * Текущий клиент по access token и организации (JWT: телефон в preferred_username / username / phone_number)
   */
  fetchCurrentClientInformation(organizationId: number) {
    return this.request.get<void, ClientDTO>(
      `${loyaltyBaseUrl}/client/me?organizationId=${encodeURIComponent(String(organizationId))}`,
    );
  }

  /**
   * Получение списка истории наливов
   *
   * @param filters фильтры
   */
  fetchWaterHistoryList(filters: WaterHistoryFilters) {
    return this.request.get<void, WaterHistoryPageDTO>(
      `${loyaltyBaseUrl}/waterHistory/getList${objectToQueryString(filters)}`,
    );
  }

  /**
   * Уровни подписки по организации (deprecated GET в Swagger, но используется для мобильной оплаты)
   */
  fetchSubscriptionLevels(organizationId: number) {
    return this.request.get<void, SubscriptionLevelDTO[]>(
      `${loyaltyBaseUrl}/subscribe-history/levels/${organizationId}`,
    );
  }
}
