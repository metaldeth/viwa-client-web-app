import { AbstractApiModule } from '../../abstractApiModule';
import { viwaTelemetryApiUrl } from '../../../../consts';
import type { MachineBySerialResponse } from '../../../../types/publicMachine';
import type {
  PublicSubscriptionLevelsResponse,
  PublicTastesResponse,
} from '../../../../types/publicCatalog';

export class PublicModule extends AbstractApiModule {
  fetchMachineBySerial(serial: string) {
    return this.request.get<void, MachineBySerialResponse>(
      `${viwaTelemetryApiUrl}/public/machines/by-serial/${encodeURIComponent(serial)}`,
      undefined,
      { skipAuth: true },
    );
  }

  /** Canonical 14 tastes for favorite picker */
  fetchPublicTastes() {
    return this.request.get<void, PublicTastesResponse>(
      `${viwaTelemetryApiUrl}/public/tastes`,
      undefined,
      { skipAuth: true },
    );
  }

  /** Marketing 12 L / 18 L tiers (public catalog) */
  fetchPublicSubscriptionLevels() {
    return this.request.get<void, PublicSubscriptionLevelsResponse>(
      `${viwaTelemetryApiUrl}/public/subscription-levels`,
      undefined,
      { skipAuth: true },
    );
  }
}

export default PublicModule;
