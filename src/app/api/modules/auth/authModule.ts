import { AbstractApiModule } from '../../abstractApiModule';
import { viwaTelemetryApiUrl } from '../../../../consts';
import {
  CheckCodeRequest,
  CheckCodeResponse,
  RegistrationHint,
  SendCodeResult,
} from '../../../../types/serverInterface/clientDTO';
import { normalizePhoneE164 } from '../../../../helpers/normalizePhoneE164';

export class AuthModule extends AbstractApiModule {
  sendCodeToPhone(phoneNumber: string) {
    const phone = normalizePhoneE164(phoneNumber);

    return this.request.post<{ phone: string }, SendCodeResult>(
      `${viwaTelemetryApiUrl}/client/auth/send-code`,
      { phone },
      { skipAuth: true },
    );
  }

  checkCodeAndCreateClient(
    phoneNumber: string,
    code: string,
    options?: { machineSerial?: string; registrationHint?: RegistrationHint },
  ) {
    const body: CheckCodeRequest = {
      phone: normalizePhoneE164(phoneNumber),
      code,
    };

    if (options?.machineSerial) {
      body.machineSerial = options.machineSerial;
    }

    if (options?.registrationHint) {
      body.registrationHint = options.registrationHint;
    }

    return this.request.post<CheckCodeRequest, CheckCodeResponse>(
      `${viwaTelemetryApiUrl}/client/auth/check-code`,
      body,
      { skipAuth: true },
    );
  }

  refreshToken(refreshToken: string) {
    return this.request.post<{ refreshToken: string }, Omit<CheckCodeResponse, 'client'>>(
      `${viwaTelemetryApiUrl}/client/auth/refresh`,
      { refreshToken },
      { skipAuth: true },
    );
  }

  logout(refreshToken?: string) {
    return this.request.post<{ refreshToken?: string }, { ok: boolean }>(
      `${viwaTelemetryApiUrl}/client/auth/logout`,
      refreshToken ? { refreshToken } : {},
    );
  }
}

export default AuthModule;
