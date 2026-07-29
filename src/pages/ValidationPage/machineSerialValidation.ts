export const MACHINE_SERIAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{1,62}[A-Za-z0-9]$/;

export const isMachineSerialFormatValid = (value: string | undefined): value is string => {
  if (!value) {
    return false;
  }

  return MACHINE_SERIAL_PATTERN.test(value);
};
