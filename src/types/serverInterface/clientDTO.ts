/**
 * dto создания клиента
 */
export type CreateClientDto = {
  /**
   * Номер организации клиента
   */
  organizationId: number;
  /**
   * ID SportNet клиента
   */
  sportNetId: string;
  /**
   * Номер автомата клиента
   */
  machineId: number;
};

/**
 * res создания клиента
 */
export type CreateClientRes = {
  /**
   * id клиента
   */
  clientId: string;
  /**
   * Токен
   */
  token: string;
};

/**
 * res получения кода
 */
export type SendCodeResponse = {
  /**
   * Результат
   */
  result: string;
  /**
   * Ошибка
   */
  error: string;
};

/**
 * dto клиента телеметрии (для списка клиентов телеметрии)
 */
export type ShortClientResponseDTO = {
  /**
   * id клиента
   */
  id: string;
  /**
   * Имя клиента
   */
  clientName: string;
  /**
   * ID SportNet клиента
   */
  idSportNet: string;
  /**
   * Номер телефона клиента
   */
  phone: string;
  /**
   * Дата окончания подписки клиента
   */
  subscribeDateEnd: string;
};

/**
 * dto информации клиента телеметрии (для вывода информации о клиенте телеметрии)
 */
export type ClientDTO = {
  /**
   * id клиента
   */
  id: string;
  /**
   * Имя клиента
   */
  name: string;
  /**
   * Номер телефона клиента
   */
  phone: string;
  /**
   * Дата регистрации клиента
   */
  dateRegistration: string;
  /**
   * Номер организации клиента
   */
  organizationId: number;
  /**
   * ID SportNet клиента (в ClientDetailResponse бэкенда может отсутствовать)
   */
  sportNetId?: string;
  /**
   * Номер автомата клиента
   */
  machineId: number;
  /**
   * Дата окончания подписки клиента
   * Если subscriptionEnd null, то подписка пробная
   */
  subscriptionEnd: string | null;
  /**
   * Согласие на персональные данные клиента
   */
  consentPersonalData: boolean;
  /**
   * Согласие на рассылку для клиента
   */
  consentNewsletter: boolean;
  /**
   * Клиент в архиве
   */
  isArchived: boolean;
  /**
   * Остаток на сегодня (литры), как в ClientDetailResponse.volume
   */
  volume?: number;
  /**
   * Остаток (литры), дубликат поля volume в API loyalty
   */
  remainingVolume?: number;
  /**
   * Дневной лимит (литры): уровень подписки или бесплатный литр — ClientDetailResponse.dailyVolumeLimit
   */
  dailyVolumeLimit?: number;
  /**
   * Устаревшее имя лимита; если бэкенд не шлёт — используем dailyVolumeLimit
   */
  maxVolume?: number;
  /**
   * Активна ли подписка клиента
   */
  isActiveSubscribe: boolean;
};

/**
 * dto информации об истории наливов
 */
export type WaterHistoryDTO = {
  /**
   * Идентификатор запроса
   */
  requestUuid: string;
  /**
   * id клиента
   */
  clientId: string;
  /**
   * ID SportNet клиента
   */
  sportNetId: string;
  /**
   * ID автомата клиента
   */
  machineId: number;
  /**
   * Номер организации клиента
   */
  organizationId: number;
  /**
   * Объём
   */
  volume: number;
  /**
   * Остаток
   */
  residue: number;
  /**
   * Дата налива
   */
  dateLoss: string;
  /**
   * Был ли налив бесплатным, или по подписке
   */
  isFree: boolean;
  /**
   * Наименование использованного продукта
   */
  ingredientId: number;
};

/**
 * Ответ GET /waterHistory/getList
 */
export type WaterHistoryPageDTO = {
  content: WaterHistoryDTO[];
  totalElements: number;
};

/**
 * Фильтры истории наливов
 */
export type WaterHistoryFilters = {
  /**
   * ID клиента
   */
  clientId: string | null;
  /**
   * Идентификатор спортсети
   */
  sportNetId: string | null;
  /**
   * Идентификатор машины
   */
  machineId: string | null;
  /**
   * Идентификатор организации
   */
  organizationId: string | null;
  /**
   * Идентификатор ингредиента
   */
  ingredientId: string | null;
  /**
   * Бесплатная вода
   */
  isFree: boolean | null;
  /**
   * Дата начала
   */
  startDate: string | null;
  /**
   * Дата конца
   */
  endDate: string | null;
  /**
   * Смещение
   */
  offset: number | null;
  /**
   * Размер страницы
   */
  limit: number | null;
};
