import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../app/hooks/store';
import { ACCESS_TOKEN_STORAGE_NAME } from '../consts/env/storage';
import { viwaTelemetryApiUrl } from '../consts/env/baseUrlFront';
import { patchClientProfile } from '../state/loyalty/slice';
import type { ClientProfileDTO } from '../types/serverInterface/clientDTO';
import { ClientWsClient, type ClientWsEnvelope } from '../ws/clientWsClient';

function isProfilePayload(value: unknown): value is Partial<ClientProfileDTO> & { id: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string'
  );
}

function extractProfile(
  envelope: ClientWsEnvelope,
): (Partial<ClientProfileDTO> & { id: string }) | null {
  if (envelope.type === 'client.profile.updated' && isProfilePayload(envelope.payload)) {
    return envelope.payload;
  }

  if (envelope.type === 'ack') {
    const profile = envelope.payload?.profile;
    if (isProfilePayload(profile)) {
      return profile;
    }
  }

  return null;
}

export function useClientSubscriptionWs(enabled: boolean): void {
  const dispatch = useAppDispatch();
  const clientRef = useRef<ClientWsClient | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const wsClient = new ClientWsClient(
      () => localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME),
      viwaTelemetryApiUrl,
    );
    clientRef.current = wsClient;

    const unsubscribe = wsClient.subscribe((envelope) => {
      const profile = extractProfile(envelope);
      if (profile) {
        dispatch(patchClientProfile(profile));
      }
    });

    wsClient.connect();

    return () => {
      unsubscribe();
      wsClient.disconnect();
      clientRef.current = null;
    };
  }, [dispatch, enabled]);
}
