import { APP_VERSION } from './appVersion';
import { viwaTelemetryApiUrl } from '../consts';

export type ClientDiagLevel = 'info' | 'warn' | 'error';

export type ClientDiagEntry = {
  ts: string;
  level: ClientDiagLevel;
  scope: string;
  event: string;
  data?: Record<string, unknown>;
};

const SESSION_KEY = 'viwa/clientDiagSession';
const MAX_QUEUE = 80;
const FLUSH_MS = 2000;
const DIAG_PATH = '/public/client-diag-logs';

const REDACT_KEYS = new Set([
  'code',
  'otp',
  'password',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'token',
  'clienttoken',
]);

let queue: ClientDiagEntry[] = [];
let flushTimer: number | null = null;
let installed = false;

export function maskPhoneForDiag(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 8) {
    return '***';
  }
  return `+${digits.slice(0, 4)}***${digits.slice(-4)}`;
}

export function getClientDiagSessionId(): string {
  if (typeof window === 'undefined') {
    return 'ssr';
  }

  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const next = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  window.sessionStorage.setItem(SESSION_KEY, next);
  return next;
}

function redactValue(value: unknown, key?: string): unknown {
  if (key && REDACT_KEYS.has(key.toLowerCase())) {
    return '[redacted]';
  }

  if (typeof value === 'string' && key && /phone/i.test(key)) {
    return maskPhoneForDiag(value);
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => redactValue(item));
  }

  if (value != null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [entryKey, entryValue] of Object.entries(value as Record<string, unknown>).slice(
      0,
      30,
    )) {
      out[entryKey] = redactValue(entryValue, entryKey);
    }
    return out;
  }

  return value;
}

export function clientDiag(
  scope: string,
  event: string,
  data?: Record<string, unknown>,
  level: ClientDiagLevel = 'info',
): void {
  const entry: ClientDiagEntry = {
    ts: new Date().toISOString(),
    level,
    scope,
    event,
    data: data ? (redactValue(data) as Record<string, unknown>) : undefined,
  };

  queue.push(entry);
  if (queue.length > MAX_QUEUE) {
    queue = queue.slice(-MAX_QUEUE);
  }

  if (typeof window !== 'undefined') {
    const consoleFn =
      level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
    consoleFn(`[viwa-diag] ${scope} ${event}`, entry.data ?? {});
  }

  scheduleFlush();
}

function scheduleFlush(): void {
  if (!installed || typeof window === 'undefined' || flushTimer != null) {
    return;
  }

  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flushClientDiag();
  }, FLUSH_MS);
}

export async function flushClientDiag(): Promise<void> {
  if (!installed || queue.length === 0 || typeof window === 'undefined') {
    return;
  }

  const entries = queue.splice(0, 40);
  const url = `${viwaTelemetryApiUrl}${DIAG_PATH}`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: getClientDiagSessionId(),
        appVersion: APP_VERSION,
        entries,
      }),
      keepalive: true,
    });
  } catch {
    queue = [...entries, ...queue].slice(-MAX_QUEUE);
  }
}

export function installClientDiag(): void {
  if (installed || typeof window === 'undefined') {
    return;
  }

  installed = true;
  clientDiag('boot', 'app_start', {
    href: window.location.href,
    path: window.location.pathname,
    userAgent: window.navigator.userAgent,
  });

  window.addEventListener('error', (event) => {
    clientDiag(
      'window',
      'error',
      {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        col: event.colno,
      },
      'error',
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    clientDiag(
      'window',
      'unhandledrejection',
      {
        message: reason instanceof Error ? reason.message : String(reason),
      },
      'error',
    );
  });

  window.addEventListener('pagehide', () => {
    void flushClientDiag();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      void flushClientDiag();
    }
  });
}
