import { AbstractApiModule } from '../../abstractApiModule';
import { authBaseUrl } from '../../../../consts';
import { CreateClientDto, CreateClientRes } from '../../../../types/serverInterface/clientDTO';

export class AuthModule extends AbstractApiModule {
  /**
   * Отправка номера телефона для получения кода авторизации (код авторизации приходит по звонку с сервиса)
   * А запрос возвращает количество секунд между запросами
   *
   * @param phoneNumber номер телефона
   */
  sendCodeToPhone(phoneNumber: string) {
    return this.request.post<void, string>(
      `${authBaseUrl}/authorization/send-code?phoneNumber=${phoneNumber}`,
      undefined,
      { skipAuth: true },
    );
  }

  /**
   * Отправка номера телефона, кода подтверждения и данных информации клиента для получения токена клиента
   *
   * @param phoneNumber номер телефона
   * @param code код
   * @param data dto информации клиента
   */
  checkCodeAndCreateClient(phoneNumber: string, code: string, data: CreateClientDto) {
    return this.request.post<CreateClientDto, CreateClientRes>(
      `${authBaseUrl}/authorization/check-code?phoneNumber=${phoneNumber}&code=${code}`,
      data,
      { skipAuth: true },
    );
  }
}
