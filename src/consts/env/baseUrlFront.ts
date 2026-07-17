/**
 * Адрес, где развёрнут фронт
 */
export const baseUrlFront = import.meta.env.VITE_APP_URL_FRONT;

/**
 * Базовый url Keycloak
 */
export const authKKBaseUrl = import.meta.env.VITE_APP_URL_AUTH;

/**
 * Базовый url модуля организации
 */
export const organizationBaseUrl = `${import.meta.env.VITE_APP_BASE_URL}telemetry-organization`;

/**
 * Базовый url модуля "Управление автоматами"
 */
// export const machineControlBaseUrl = `http://localhost:8310`;
export const machineControlBaseUrl = `${import.meta.env.VITE_APP_BASE_URL}telemetry-machine-control`;

/**
 * Базовый url модуля "Клиенты"
 */
export const loyaltyBaseUrl = `${import.meta.env.VITE_APP_BASE_URL}telemetry-loyalty`;

/** Legacy gateway route id; do not rename without backend. */
export const BILLING_SERVICE_PATH = 'shaker-billing';

/**
 * Базовый url billing API (оплата подписки СБП)
 */
export const billingBaseUrl = `${import.meta.env.VITE_APP_BASE_URL}${BILLING_SERVICE_PATH}`;

/**
 * Базовый url модуля "Клиенты", отдельная ссылка для авторизации
 */
export const authBaseUrl = `${import.meta.env.VITE_APP_BASE_URL}telemetry-loyalty`;

/**
 * Базовый url модуля "База продуктов"
 */
export const productBaseUrl = `${import.meta.env.VITE_APP_BASE_URL}telemetry-product-base`;
// export const productBaseUrl = `http://localhost:8305`;

/**
 * Базовый url модуля "Продажи"
 */
export const salesBaseUrl = `${import.meta.env.VITE_APP_BASE_URL}telemetry-sale`;
// export const salesBaseUrl = `http://localhost:8325`;

/**
 * Базовый url модуля "Уведомления"
 */
export const notificationBaseUrl = `${import.meta.env.VITE_APP_BASE_URL}telemetry-notification`;
// export const notificationBaseUrl = 'http://localhost:8381';

/**
 * Базовый url модуля "Обратная связь"
 */
export const treatmentBaseUrl = `${import.meta.env.VITE_APP_BASE_URL}telemetry-treatment`;
// export const treatmentBaseUrl =  'http://localhost:8080';

/**
 * Базовый url модуля "Vendista"
 */
// export const vendistaBaseUrl = `http://localhost:8380`;
export const vendistaBaseUrl = `${import.meta.env.VITE_APP_BASE_URL}telemetry-vendista-integration`;

const TELEGRAM_SUPPORT_BOT = import.meta.env.VITE_APP_TELEGRAM_SUPPORT_BOT ?? 'MyShaker_bot';
const TELEGRAM_DEV_ALERT_BOT =
  import.meta.env.VITE_APP_TELEGRAM_DEV_ALERT_BOT ?? 'ShakerTelemetryAlert_bot';

/**
 * Шаблон ссылки для приглашения к боту поддержки в Telegram
 */
export const telegramSupportInvite = `https://t.me/${TELEGRAM_SUPPORT_BOT}?start=`;

/**
 * Шаблон ссылки для dev-бота оповещений телеметрии в Telegram
 */
export const telegramDevAlertInvite = `https://t.me/${TELEGRAM_DEV_ALERT_BOT}?start=`;

/**
 * Админ чат (для уведомлений об ошибках в телеметрии)
 */
export const telegramAdminChat = import.meta.env.VITE_APP_ADMIN_CHAT_ID;

/**
 * Токен админ бота
 */
export const telegramAdminBotToken = import.meta.env.VITE_APP_ADMIN_BOT_TOKEN;

/**
 * Секретный ключ шифрования для модуля уведомлений
 */
export const telegramSecretKey = import.meta.env.VITE_APP_SECRET_KEY;

/**
 * Название бота телеграм
 */
export const telegramDefaultBotName = import.meta.env.VITE_APP_DEFAULT_BOT_NAME;

/**
 * Максимальная длина сообщения в телеграм
 */
export const MAX_MESSAGE_LENGTH = 4080;

/**
 * Ключ сервиса geoTree
 */
export const geoTreeKey = import.meta.env.VITE_APP_GEOTREE_KEY;

/**
 * Базовый url модуля "Сервисное меню"
 */
export const serviceMenuBaseUrl = import.meta.env.VITE_APP_SNACK_API_SERVICE_URL;
