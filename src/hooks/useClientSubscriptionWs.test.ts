/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import {
  clearAuthTokens,
  saveAccessToken,
  subscribeAccessTokenChanges,
} from '../app/api/authStorage';
import { ACCESS_TOKEN_STORAGE_NAME } from '../consts/env/storage';
import { installBrowserStorageMocks } from '../test/browserMocks';
import {
  extractProfile,
  isProfilePayload,
  useClientSubscriptionWs,
} from './useClientSubscriptionWs';
import type { ClientWsEnvelope } from '../ws/clientWsClient';

const dispatchMock = vi.fn();

vi.mock('../app/hooks/store', () => ({
  useAppDispatch: () => dispatchMock,
}));

const mockWebSocketInstances = vi.hoisted(() => [] as MockWebSocket[]);

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url: string;
  readyState = MockWebSocket.CONNECTING;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    mockWebSocketInstances.push(this);
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  simulateOpen(): void {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  simulateMessage(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }
}

describe('extractProfile', () => {
  it('extracts profile from client.profile.updated', () => {
    const envelope: ClientWsEnvelope = {
      type: 'client.profile.updated',
      messageId: '1',
      sentAt: '2026-01-01T00:00:00.000Z',
      payload: { id: 'client-1', active: true, volumeMl: 500 },
    };

    expect(extractProfile(envelope)).toEqual({
      id: 'client-1',
      active: true,
      volumeMl: 500,
    });
  });

  it('extracts profile from ack.payload.profile snapshot', () => {
    const envelope: ClientWsEnvelope = {
      type: 'ack',
      messageId: '2',
      sentAt: '2026-01-01T00:00:00.000Z',
      payload: {
        profile: { id: 'client-1', tierName: '12 литров', active: false },
      },
    };

    expect(extractProfile(envelope)).toEqual({
      id: 'client-1',
      tierName: '12 литров',
      active: false,
    });
  });

  it('returns null for unrelated or malformed payloads', () => {
    expect(
      extractProfile({
        type: 'ack',
        messageId: '3',
        sentAt: '2026-01-01T00:00:00.000Z',
        payload: { profile: { volumeMl: 1 } },
      }),
    ).toBeNull();
    expect(isProfilePayload({ volumeMl: 1 })).toBe(false);
  });
});

describe('useClientSubscriptionWs', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
    mockWebSocketInstances.length = 0;
    dispatchMock.mockReset();
    vi.stubGlobal('WebSocket', MockWebSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const latestSocket = () => mockWebSocketInstances.at(-1)!;

  it('dispatches patchClientProfile for profile.updated and ack snapshot', () => {
    saveAccessToken('token-a');

    const { unmount } = renderHook(() => useClientSubscriptionWs(true));
    latestSocket().simulateOpen();

    latestSocket().simulateMessage({
      type: 'client.profile.updated',
      messageId: 'u1',
      sentAt: '2026-01-01T00:00:00.000Z',
      payload: { id: 'client-1', monthlyUsedMl: 100 },
    });

    latestSocket().simulateMessage({
      type: 'ack',
      messageId: 'a1',
      sentAt: '2026-01-01T00:00:00.000Z',
      payload: { profile: { id: 'client-1', active: true } },
    });

    expect(dispatchMock).toHaveBeenCalledTimes(2);
    expect(dispatchMock.mock.calls[0]?.[0]).toMatchObject({
      type: 'loyalty/patchClientProfile',
      payload: { id: 'client-1', monthlyUsedMl: 100 },
    });
    expect(dispatchMock.mock.calls[1]?.[0]).toMatchObject({
      type: 'loyalty/patchClientProfile',
      payload: { id: 'client-1', active: true },
    });

    unmount();
  });

  it('reconnects when same-tab access token is saved via authStorage', () => {
    const { unmount } = renderHook(() => useClientSubscriptionWs(true));
    expect(mockWebSocketInstances).toHaveLength(0);

    act(() => {
      saveAccessToken('token-a');
    });

    expect(mockWebSocketInstances).toHaveLength(1);
    latestSocket().simulateOpen();

    act(() => {
      saveAccessToken('token-b');
    });

    expect(mockWebSocketInstances).toHaveLength(2);
    expect(latestSocket().url).toContain('access_token=token-b');

    unmount();
  });

  it('disconnects when auth tokens are cleared', () => {
    saveAccessToken('token-a');
    const { unmount } = renderHook(() => useClientSubscriptionWs(true));
    latestSocket().simulateOpen();

    act(() => {
      clearAuthTokens();
    });

    expect(latestSocket().readyState).toBe(MockWebSocket.CLOSED);

    unmount();
  });

  it('does not connect when disabled', () => {
    renderHook(() => useClientSubscriptionWs(false));
    saveAccessToken('token-a');
    expect(mockWebSocketInstances).toHaveLength(0);
  });

  it('notifies subscribeAccessTokenChanges listeners on save and clear', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAccessTokenChanges(listener);

    saveAccessToken('token-a');
    clearAuthTokens();

    expect(listener).toHaveBeenNthCalledWith(1, 'token-a');
    expect(listener).toHaveBeenNthCalledWith(2, null);

    unsubscribe();
  });

  it('reads access token from canonical storage key', () => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, 'stored-token');

    renderHook(() => useClientSubscriptionWs(true));

    expect(latestSocket().url).toContain('access_token=stored-token');
  });
});
