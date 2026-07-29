/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useMachineSerialValidation } from './useMachineSerialValidation';
import { markMachineSerialValidated } from '../../utils/machineSerialValidationCache';
import { installBrowserStorageMocks } from '../../test/browserMocks';

const fetchMachineBySerial = vi.fn();

vi.mock('../../app/api', () => ({
  api: {
    publicApi: {
      fetchMachineBySerial: (...args: unknown[]) => fetchMachineBySerial(...args),
    },
  },
}));

const createWrapper = (initialPath: string) =>
  function MachineSerialValidationTestWrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/m/:machineSerial/*" element={children} />
        </Routes>
      </MemoryRouter>
    );
  };

describe('useMachineSerialValidation', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
    fetchMachineBySerial.mockReset();
    fetchMachineBySerial.mockResolvedValue({
      machineId: '1',
      serialNumber: 'VIWA-000004',
      valid: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('skips public API lookup when serial was pre-validated in SerialCapture', async () => {
    markMachineSerialValidated('VIWA-000004');

    const { result } = renderHook(() => useMachineSerialValidation(), {
      wrapper: createWrapper('/m/VIWA-000004/auth'),
    });

    await waitFor(() => {
      expect(result.current.status).toBe('valid');
    });

    expect(fetchMachineBySerial).not.toHaveBeenCalled();
  });

  it('calls public API when no pre-validation flag is present', async () => {
    const { result } = renderHook(() => useMachineSerialValidation(), {
      wrapper: createWrapper('/m/VIWA-000004/auth'),
    });

    await waitFor(() => {
      expect(result.current.status).toBe('valid');
    });

    expect(fetchMachineBySerial).toHaveBeenCalledTimes(1);
    expect(fetchMachineBySerial).toHaveBeenCalledWith('VIWA-000004');
  });
});
