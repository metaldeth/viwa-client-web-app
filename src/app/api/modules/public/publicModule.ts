import { AbstractApiModule } from '../../abstractApiModule';
import { viwaTelemetryApiUrl } from '../../../../consts';
import type { MachineBySerialResponse } from '../../../../types/publicMachine';

export class PublicModule extends AbstractApiModule {
  fetchMachineBySerial(serial: string) {
    return this.request.get<void, MachineBySerialResponse>(
      `${viwaTelemetryApiUrl}/public/machines/by-serial/${encodeURIComponent(serial)}`,
      undefined,
      { skipAuth: true },
    );
  }
}

export default PublicModule;
