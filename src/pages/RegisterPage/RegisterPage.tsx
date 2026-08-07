import { FC, useEffect, useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import SerialCapturePage from '../SerialCapturePage';
import { Loader } from '@asnefedov/uikit/Loader';
import VerticalContainer from '../../components/VerticalContainer';
import {
  parseLandingSearchParams,
  persistLandingContext,
  resolveRegisterSerial,
} from '../../utils/landingEntry';
import { isMachineSerialFormatValid } from '../ValidationPage/machineSerialValidation';

const RegisterPage: FC = () => {
  const [searchParams] = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  const queryParams = useMemo(
    () => parseLandingSearchParams(`?${searchParams.toString()}`),
    [searchParams],
  );

  const serial = resolveRegisterSerial(queryParams.serial);

  useEffect(() => {
    persistLandingContext(queryParams);
    setIsReady(true);
  }, [queryParams]);

  if (!isReady) {
    return (
      <VerticalContainer isAutoWidth align="center">
        <Loader view="primary" />
      </VerticalContainer>
    );
  }

  if (serial && isMachineSerialFormatValid(serial)) {
    return <Navigate to={`/m/${encodeURIComponent(serial)}/auth`} replace />;
  }

  if (queryParams.entry === 'website') {
    return <Navigate to="/auth" replace />;
  }

  return <SerialCapturePage />;
};

export default RegisterPage;
