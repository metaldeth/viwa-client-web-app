import {
  consumeMachineSerialValidated,
  markMachineSerialValidated,
  VIWA_SERIAL_VALIDATED_KEY,
} from './machineSerialValidationCache';
import { installBrowserStorageMocks } from '../test/browserMocks';

describe('machineSerialValidationCache', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('marks and consumes a validated serial once', () => {
    markMachineSerialValidated('VIWA-000004');

    expect(sessionStorage.getItem(VIWA_SERIAL_VALIDATED_KEY)).toBe('VIWA-000004');
    expect(consumeMachineSerialValidated('VIWA-000004')).toBe(true);
    expect(sessionStorage.getItem(VIWA_SERIAL_VALIDATED_KEY)).toBeNull();
    expect(consumeMachineSerialValidated('VIWA-000004')).toBe(false);
  });

  it('does not consume flag for a different serial', () => {
    markMachineSerialValidated('VIWA-000004');

    expect(consumeMachineSerialValidated('VIWA-999999')).toBe(false);
    expect(sessionStorage.getItem(VIWA_SERIAL_VALIDATED_KEY)).toBe('VIWA-000004');
  });
});
