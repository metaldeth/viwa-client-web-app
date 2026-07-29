import { isMachineSerialFormatValid } from '../ValidationPage/machineSerialValidation';
import { markMachineSerialValidated } from '../../utils/machineSerialValidationCache';

const fetchMachineBySerial = vi.fn();

describe('SerialCapture validation', () => {
  beforeEach(() => {
    fetchMachineBySerial.mockReset();
  });

  it('CW05-2: accepts valid serial format for public lookup', async () => {
    const serial = 'VIWA-000004';

    expect(isMachineSerialFormatValid(serial)).toBe(true);

    fetchMachineBySerial.mockResolvedValue({
      machineId: '1',
      serialNumber: serial,
      valid: true,
    });

    await expect(fetchMachineBySerial(serial)).resolves.toMatchObject({
      serialNumber: serial,
      valid: true,
    });
  });

  it('rejects invalid serial format before API call', () => {
    expect(isMachineSerialFormatValid('bad serial')).toBe(false);
    expect(isMachineSerialFormatValid('')).toBe(false);
  });

  it('marks serial as pre-validated after successful lookup', async () => {
    const serial = 'VIWA-000004';

    fetchMachineBySerial.mockResolvedValue({
      machineId: '1',
      serialNumber: serial,
      valid: true,
    });

    await fetchMachineBySerial(serial);
    markMachineSerialValidated(serial);

    expect(fetchMachineBySerial).toHaveBeenCalledWith(serial);
  });

  it('maps 404 API error to readable message', async () => {
    fetchMachineBySerial.mockRejectedValue({ code: '404' });

    await expect(fetchMachineBySerial('VIWA-999999')).rejects.toMatchObject({ code: '404' });
  });
});
