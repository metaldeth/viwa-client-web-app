import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../app/api';
import { consumeMachineSerialValidated } from '../../utils/machineSerialValidationCache';
import { isMachineSerialFormatValid } from './machineSerialValidation';

export { isMachineSerialFormatValid } from './machineSerialValidation';

export type MachineValidationState =
  | { status: 'idle' | 'loading' }
  | { status: 'valid'; machineSerial: string }
  | { status: 'invalid'; message: string };

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

    if (consumeMachineSerialValidated(machineSerial)) {
      setState({ status: 'valid', machineSerial });
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
