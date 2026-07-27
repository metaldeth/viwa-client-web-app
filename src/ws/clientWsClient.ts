export type ClientWsEnvelope = {
  type: string;
  messageId: string;
  sentAt: string;
  correlationId?: string;
  payload?: Record<string, unknown>;
};

export type ClientWsListener = (envelope: ClientWsEnvelope) => void;

const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

function createMessageId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function buildClientWsUrl(accessToken: string, apiBaseUrl: string): string {
  const httpUrl = new URL(apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`);
  const protocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = new URL(
    `${protocol}//${httpUrl.host}${httpUrl.pathname.replace(/\/?$/, '')}/client/ws`,
  );
  wsUrl.searchParams.set('access_token', accessToken);
  return wsUrl.toString();
}

export class ClientWsClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<ClientWsListener>();
  private shouldReconnect = true;
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private reconnectDelayMs = INITIAL_RECONNECT_DELAY_MS;
  private connected = false;

  constructor(
    private readonly getAccessToken: () => string | null,
    private readonly apiBaseUrl: string,
  ) {}

  connect(): void {
    this.shouldReconnect = true;
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return;
    }

    this.ws = new WebSocket(buildClientWsUrl(accessToken, this.apiBaseUrl));

    this.ws.onopen = () => {
      this.connected = true;
      this.reconnectDelayMs = INITIAL_RECONNECT_DELAY_MS;
      this.send('subscribe.subscription', {});
    };

    this.ws.onmessage = (event) => {
      try {
        const envelope = JSON.parse(String(event.data)) as ClientWsEnvelope;
        for (const listener of this.listeners) {
          listener(envelope);
        }
      } catch {
        // Ignore malformed frames.
      }
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.ws = null;
      if (this.shouldReconnect) {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, MAX_RECONNECT_DELAY_MS);
          this.connect();
        }, this.reconnectDelayMs);
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer !== undefined) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send('unsubscribe.subscription', {});
    }
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  subscribe(listener: ClientWsListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  send(type: string, payload: Record<string, unknown>): string | null {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      return null;
    }

    const messageId = createMessageId();
    const envelope: ClientWsEnvelope = {
      type,
      messageId,
      sentAt: new Date().toISOString(),
      payload,
    };

    this.ws.send(JSON.stringify(envelope));
    return messageId;
  }
}
