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

/** Invalid or missing client JWT — do not auto-reconnect with the same token (viwa-telemetry client-ws.md). */
export const CLIENT_WS_CLOSE_UNAUTHORIZED = 4401;
/** Wrong token type (dashboard session / machine JWT) — wait for a new client access token. */
export const CLIENT_WS_CLOSE_FORBIDDEN = 4403;
/** Server idle timeout — reconnectable; not an auth failure. */
export const CLIENT_WS_CLOSE_IDLE = 4008;

export function isPermanentAuthWsCloseCode(code: number): boolean {
  return code === CLIENT_WS_CLOSE_UNAUTHORIZED || code === CLIENT_WS_CLOSE_FORBIDDEN;
}

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

/**
 * Client subscription WebSocket transport.
 *
 * Lifecycle: connect with stored access token → `subscribe.subscription` on each open →
 * exponential backoff on transient close. Permanent auth closes (`4401`/`4403`) stop
 * auto-reconnect until `authStorage` delivers a new or re-saved token. Idle close (`4008`)
 * reconnects normally.
 */
export class ClientWsClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<ClientWsListener>();
  private shouldReconnect = true;
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private reconnectDelayMs = INITIAL_RECONNECT_DELAY_MS;
  private connected = false;
  private activeAccessToken: string | null = null;

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

    this.startConnection(accessToken, false);
  }

  /**
   * React to access-token changes from `authStorage` (same tab or cross-tab).
   * Skips when the same token is already OPEN/CONNECTING; re-opens after auth close
   * even when the token string is unchanged (re-save / refresh notification).
   */
  handleAccessTokenChange(accessToken: string | null): void {
    if (!accessToken) {
      this.disconnect();
      return;
    }

    if (
      accessToken === this.activeAccessToken &&
      (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.startConnection(accessToken, true);
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.activeAccessToken = null;
    this.clearReconnectTimer();
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send('unsubscribe.subscription', {});
    }
    this.tearDownSocket();
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

  private startConnection(accessToken: string, resetBackoff: boolean): void {
    this.shouldReconnect = true;
    if (resetBackoff) {
      this.reconnectDelayMs = INITIAL_RECONNECT_DELAY_MS;
    }
    this.clearReconnectTimer();
    this.tearDownSocket();
    this.activeAccessToken = accessToken;
    this.openWebSocket(accessToken);
  }

  private openWebSocket(accessToken: string): void {
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

    this.ws.onclose = (event) => {
      this.connected = false;
      this.ws = null;

      if (!this.shouldReconnect) {
        return;
      }

      if (isPermanentAuthWsCloseCode(event.code)) {
        this.shouldReconnect = false;
        return;
      }

      const latestToken = this.getAccessToken();
      if (!latestToken) {
        this.activeAccessToken = null;
        return;
      }

      this.reconnectTimer = setTimeout(() => {
        this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, MAX_RECONNECT_DELAY_MS);
        this.connect();
      }, this.reconnectDelayMs);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private tearDownSocket(): void {
    if (!this.ws) {
      this.connected = false;
      return;
    }

    const socket = this.ws;
    this.ws = null;
    this.connected = false;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    socket.onerror = null;

    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close();
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== undefined) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }
}
