import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../app/api';

const MACHINE_SERIAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{1,62}[A-Za-z0-9]$/;

export type MachineValidationState =
  | { status: 'idle' | 'loading' }
  | { status: 'valid'; machineSerial: string }
  | { status: 'invalid'; message: string };

export const isMachineSerialFormatValid = (value: string | undefined): value is string => {
  if (!value) {
    return false;
  }

  return MACHINE_SERIAL_PATTERN.test(value);
};

export const useMachineSerialValidation = (): MachineValidationState => {
  const { machineSerial } = useParams();
  const [state, setState] = useState<MachineValidationState>({ status: 'idle' });

  const formatValid = useMemo(() => isMachineSerialFormatValid(machineSerial), [machineSerial]);

  useEffect(() => {
    if (!machineSerial) {
      setState({ status: 'invalid', message: 'Не указан серийный номер автомата' });
      return;
    }

    if (!formatValid) {
      setState({ status: 'invalid', message: 'Некорректный серийный номер автомата' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    api.publicApi
      .fetchMachineBySerial(machineSerial)
      .then(() => {
        if (!cancelled) {
          setState({ status: 'valid', machineSerial });
        }
      })
      .catch((error: { code?: string; message?: string }) => {
        if (cancelled) {
          return;
        }

        if (error.code === '404') {
          setState({ status: 'invalid', message: 'Автомат с таким серийным номером не найден' });
          return;
        }

        setState({
          status: 'invalid',
          message: error.message || 'Не удалось проверить автомат',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [machineSerial, formatValid]);

  return state;
};
