import { isSafeReturnPath } from '../utils/appVersion';
import {
  getMachineAuthPath,
  getMachineSerialFromPath,
  getReturningAuthPath,
} from '../pages/ValidationPage/helpers';

/** Builds a safe cabinet return path for hosted payment redirect. */
export function resolveCheckoutReturnPath(pathname: string): string {
  if (isSafeReturnPath(pathname)) {
    const serial = getMachineSerialFromPath(pathname);
    if (serial && !sanitizeMachineSerial(serial)) {
      return DEFAULT_SAFE_CABINET_RETURN_PATH;
    }

    return pathname;
  }

  const serial = sanitizeMachineSerial(getMachineSerialFromPath(pathname));
  if (serial) {
    return `/m/${serial}/home`;
  }

  return DEFAULT_SAFE_CABINET_RETURN_PATH;
}

export const VIWA_PENDING_PAYMENT_KEY = 'viwa_pending_payment';

export const DEFAULT_SAFE_CABINET_RETURN_PATH = '/home';

const MACHINE_SERIAL_PATTERN = /^[A-Za-z0-9-]+$/;

export type PendingPaymentSession = {
  paymentId: string;
  startedAt: number;
  returnPath: string;
  /** Optional machine context for safe fallback when returnPath is missing or unsafe. */
  machineSerial?: string;
};

export function sanitizeMachineSerial(serial: unknown): string | null {
  if (typeof serial !== 'string' || !MACHINE_SERIAL_PATTERN.test(serial)) {
    return null;
  }

  return serial;
}

export function resolveSafeReturnPath(
  session: Partial<PendingPaymentSession> | null | undefined,
): string {
  if (session?.returnPath && isSafeReturnPath(session.returnPath)) {
    return session.returnPath;
  }

  const serialFromField = sanitizeMachineSerial(session?.machineSerial);
  if (serialFromField) {
    return `/m/${serialFromField}/home`;
  }

  if (typeof session?.returnPath === 'string') {
    const serialFromPath = getMachineSerialFromPath(session.returnPath);
    if (serialFromPath && sanitizeMachineSerial(serialFromPath)) {
      return `/m/${serialFromPath}/home`;
    }
  }

  return DEFAULT_SAFE_CABINET_RETURN_PATH;
}

export function resolvePaymentReturnAuthRedirect(): string {
  const session = readPendingPayment();

  if (session?.returnPath && isSafeReturnPath(session.returnPath)) {
    const machineAuth = getMachineAuthPath(session.returnPath);
    if (machineAuth) {
      return machineAuth;
    }
  }

  const serial = sanitizeMachineSerial(session?.machineSerial);
  if (serial) {
    return `/m/${serial}/auth`;
  }

  return getReturningAuthPath();
}

export function readPendingPayment(): PendingPaymentSession | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }

  const raw = sessionStorage.getItem(VIWA_PENDING_PAYMENT_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PendingPaymentSession>;

    if (
      typeof parsed.paymentId !== 'string' ||
      parsed.paymentId.length === 0 ||
      typeof parsed.startedAt !== 'number' ||
      !Number.isFinite(parsed.startedAt) ||
      typeof parsed.returnPath !== 'string'
    ) {
      return null;
    }

    const machineSerial = sanitizeMachineSerial(parsed.machineSerial) ?? undefined;

    return {
      paymentId: parsed.paymentId,
      startedAt: parsed.startedAt,
      returnPath: parsed.returnPath,
      ...(machineSerial ? { machineSerial } : {}),
    };
  } catch {
    return null;
  }
}

export function writePendingPayment(session: PendingPaymentSession): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  const machineSerial = sanitizeMachineSerial(session.machineSerial) ?? undefined;

  sessionStorage.setItem(
    VIWA_PENDING_PAYMENT_KEY,
    JSON.stringify({
      paymentId: session.paymentId,
      startedAt: session.startedAt,
      returnPath: session.returnPath,
      ...(machineSerial ? { machineSerial } : {}),
    }),
  );
}

export function clearPendingPayment(): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  sessionStorage.removeItem(VIWA_PENDING_PAYMENT_KEY);
}
