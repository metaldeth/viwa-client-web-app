/**
 * @vitest-environment jsdom
 */
import {
  buildClientWsUrl,
  ClientWsClient,
  CLIENT_WS_CLOSE_FORBIDDEN,
  CLIENT_WS_CLOSE_IDLE,
  CLIENT_WS_CLOSE_UNAUTHORIZED,
} from './clientWsClient';
import { ACCESS_TOKEN_STORAGE_NAME } from '../consts/env/storage';
import { installBrowserStorageMocks } from '../test/browserMocks';
import { subscribeAccessTokenChanges } from '../app/api/authStorage';

const API_BASE = 'https://telemetry.example.com/api/v1';

type MockWebSocketInstance = WebSocket & {
  url: string;
  sent: string[];
  simulateOpen: () => void;
  simulateMessage: (data: unknown) => void;
  simulateClose: () => void;
};

const mockWebSocketInstances = vi.hoisted(() => [] as MockWebSocketInstance[]);

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url: string;
  readyState = MockWebSocket.CONNECTING;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    mockWebSocketInstances.push(this as unknown as MockWebSocketInstance);
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.simulateClose(1000);
  }

  simulateOpen(): void {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  simulateMessage(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }

  simulateClose(code = 1000, reason = ''): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code, reason } as CloseEvent);
  }
}

describe('buildClientWsUrl', () => {
  it('builds wss URL with access_token query param', () => {
    const url = buildClientWsUrl('jwt-token', API_BASE);
    expect(url).toBe('wss://telemetry.example.com/api/v1/client/ws?access_token=jwt-token');
  });
});

describe('ClientWsClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installBrowserStorageMocks();
    mockWebSocketInstances.length = 0;
    vi.stubGlobal('WebSocket', MockWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const createClient = (getToken: () => string | null = () => 'token-a') =>
    new ClientWsClient(getToken, API_BASE);

  const latestSocket = () => mockWebSocketInstances.at(-1)!;

  it('sends subscribe.subscription on open', () => {
    const client = createClient();
    client.connect();
    latestSocket().simulateOpen();

    expect(latestSocket().sent).toHaveLength(1);
    const envelope = JSON.parse(latestSocket().sent[0]!);
    expect(envelope.type).toBe('subscribe.subscription');
  });

  it('ignores malformed frames without throwing', () => {
    const client = createClient();
    const listener = vi.fn();
    client.subscribe(listener);
    client.connect();
    latestSocket().simulateOpen();

    latestSocket().onmessage?.({ data: 'not-json' } as MessageEvent);

    expect(listener).not.toHaveBeenCalled();
  });

  it('does not open duplicate sockets for the same token', () => {
    const client = createClient();
    client.connect();
    client.connect();

    expect(mockWebSocketInstances).toHaveLength(1);
  });

  it('reconnects with the latest access token after close', () => {
    let token = 'token-a';
    const client = new ClientWsClient(() => token, API_BASE);
    client.connect();
    latestSocket().simulateOpen();

    token = 'token-b';
    latestSocket().simulateClose();

    vi.advanceTimersByTime(1_000);

    expect(mockWebSocketInstances).toHaveLength(2);
    expect(latestSocket().url).toContain('access_token=token-b');
  });

  it('disconnects and does not reconnect when access token is cleared', () => {
    let token: string | null = 'token-a';
    const client = new ClientWsClient(() => token, API_BASE);
    client.connect();
    latestSocket().simulateOpen();

    token = null;
    client.handleAccessTokenChange(null);

    expect(client.isConnected()).toBe(false);
    latestSocket().simulateClose();
    vi.advanceTimersByTime(30_000);

    expect(mockWebSocketInstances).toHaveLength(1);
  });

  it('connects when access token appears after refresh-only start', () => {
    let token: string | null = null;
    const client = new ClientWsClient(() => token, API_BASE);
    client.connect();
    expect(mockWebSocketInstances).toHaveLength(0);

    token = 'fresh-token';
    client.handleAccessTokenChange(token);

    expect(mockWebSocketInstances).toHaveLength(1);
    expect(latestSocket().url).toContain('access_token=fresh-token');
  });

  it('forces reconnect when same-tab access token is rotated', () => {
    let token = 'token-a';
    const client = new ClientWsClient(() => token, API_BASE);
    client.connect();
    latestSocket().simulateOpen();

    token = 'token-b';
    client.handleAccessTokenChange(token);

    expect(mockWebSocketInstances).toHaveLength(2);
    expect(latestSocket().url).toContain('access_token=token-b');
  });

  it('uses exponential backoff between reconnect attempts', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const client = createClient();
    client.connect();
    latestSocket().simulateOpen();
    latestSocket().simulateClose();

    expect(setTimeoutSpy.mock.calls.at(-1)?.[1]).toBe(1_000);

    vi.advanceTimersByTime(1_000);
    expect(mockWebSocketInstances).toHaveLength(2);
    latestSocket().simulateClose();

    expect(setTimeoutSpy.mock.calls.at(-1)?.[1]).toBe(2_000);

    setTimeoutSpy.mockRestore();
  });

  it('delivers parsed envelopes to listeners', () => {
    const client = createClient();
    const listener = vi.fn();
    client.subscribe(listener);
    client.connect();
    latestSocket().simulateOpen();

    const frame = {
      type: 'client.profile.updated',
      messageId: 'msg-1',
      sentAt: new Date().toISOString(),
      payload: { id: 'client-1', volumeMl: 100 },
    };
    latestSocket().simulateMessage(frame);

    expect(listener).toHaveBeenCalledWith(frame);
  });

  it('does not auto-reconnect on permanent auth close 4401/4403', () => {
    const client = createClient();
    client.connect();
    latestSocket().simulateOpen();

    latestSocket().simulateClose(CLIENT_WS_CLOSE_UNAUTHORIZED);
    vi.advanceTimersByTime(30_000);
    expect(mockWebSocketInstances).toHaveLength(1);

    client.handleAccessTokenChange('token-a');
    expect(mockWebSocketInstances).toHaveLength(2);
  });

  it('does not auto-reconnect on 4403 forbidden close', () => {
    const client = createClient();
    client.connect();
    latestSocket().simulateOpen();
    latestSocket().simulateClose(CLIENT_WS_CLOSE_FORBIDDEN);

    vi.advanceTimersByTime(30_000);
    expect(mockWebSocketInstances).toHaveLength(1);
  });

  it('auto-reconnects after idle close 4008', () => {
    const client = createClient();
    client.connect();
    latestSocket().simulateOpen();
    latestSocket().simulateClose(CLIENT_WS_CLOSE_IDLE);

    vi.advanceTimersByTime(1_000);
    expect(mockWebSocketInstances).toHaveLength(2);
  });

  it('reconnects when same token is re-saved after auth close', () => {
    const client = createClient();
    client.connect();
    latestSocket().simulateOpen();
    latestSocket().simulateClose(CLIENT_WS_CLOSE_UNAUTHORIZED);

    client.handleAccessTokenChange('token-a');

    expect(mockWebSocketInstances).toHaveLength(2);
    expect(latestSocket().url).toContain('access_token=token-a');
  });
});

describe('authStorage cross-tab token changes', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
    mockWebSocketInstances.length = 0;
    vi.stubGlobal('WebSocket', MockWebSocket);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reacts to storage events from other tabs when wired to authStorage', () => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, 'token-a');
    const client = new ClientWsClient(
      () => localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME),
      API_BASE,
    );
    const unsubscribeAuth = subscribeAccessTokenChanges((accessToken) => {
      client.handleAccessTokenChange(accessToken);
    });
    client.connect();
    mockWebSocketInstances.at(-1)!.simulateOpen();

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: ACCESS_TOKEN_STORAGE_NAME,
        newValue: 'token-cross-tab',
      }),
    );

    expect(mockWebSocketInstances).toHaveLength(2);
    expect(mockWebSocketInstances.at(-1)!.url).toContain('access_token=token-cross-tab');

    unsubscribeAuth();
  });
});
