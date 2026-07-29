export const VIWA_SERIAL_VALIDATED_KEY = 'viwa_serial_validated';

export const markMachineSerialValidated = (serial: string): void => {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  sessionStorage.setItem(VIWA_SERIAL_VALIDATED_KEY, serial);
};

/**
 * Returns true when SerialCapture (or equivalent) already confirmed the serial via public API.
 * Consumes the flag so refresh/direct entry still runs a live lookup.
 */
export const consumeMachineSerialValidated = (serial: string): boolean => {
  if (typeof sessionStorage === 'undefined') {
    return false;
  }

  const stored = sessionStorage.getItem(VIWA_SERIAL_VALIDATED_KEY);

  if (stored !== serial) {
    return false;
  }

  sessionStorage.removeItem(VIWA_SERIAL_VALIDATED_KEY);
  return true;
};
