import { AbstractApiModule } from '../../abstractApiModule';
import { viwaTelemetryApiUrl } from '../../../../consts';
import type {
  ClientPriceChangeDecisionBodyWire,
  ClientPriceChangeDecisionResponseWire,
  ClientPriceChangeNoticeWire,
} from '../../../../types/subscriptionPriceNotice';

const BASE_PATH = `${viwaTelemetryApiUrl}/client/price-change`;
const NOTICE_PATH = `${BASE_PATH}/notice`;
const ACCEPT_PATH = `${BASE_PATH}/accept`;
const DECLINE_PATH = `${BASE_PATH}/decline`;

export class SubscriptionPriceNoticeModule extends AbstractApiModule {
  /** Applicable price-change notice for the client's active tier. schedule=null → no panel. */
  fetchNotice() {
    return this.request.get<void, ClientPriceChangeNoticeWire>(NOTICE_PATH);
  }

  accept(body: ClientPriceChangeDecisionBodyWire) {
    return this.request.post<
      ClientPriceChangeDecisionBodyWire,
      ClientPriceChangeDecisionResponseWire
    >(ACCEPT_PATH, body);
  }

  decline(body: ClientPriceChangeDecisionBodyWire) {
    return this.request.post<
      ClientPriceChangeDecisionBodyWire,
      ClientPriceChangeDecisionResponseWire
    >(DECLINE_PATH, body);
  }
}

export { BASE_PATH, NOTICE_PATH, ACCEPT_PATH, DECLINE_PATH };

export default SubscriptionPriceNoticeModule;
