import { FC, memo } from 'react';
import { matchPath, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ValidationPageProps } from './types';
import { hasAuthTokens, isClientAuthRoute } from './helpers';
import { useMachineSerialValidation } from './useMachineSerialValidation';
import ErrorPage from '../ErrorPage/ErrorPage';
import { Loader } from '@asnefedov/uikit/Loader';
import VerticalContainer from '../../components/VerticalContainer';

const trimTrailingSlashes = (p: string) => p.replace(/\/+$/, '');

const isEntryPoint = (pathname: string, basePathPattern: string) => {
  const path = trimTrailingSlashes(pathname);
  const basePattern = trimTrailingSlashes(basePathPattern).replace(/\/\*$/, '');

  return matchPath({ path: basePattern, end: true }, path) !== null;
};

const ValidationPage: FC<ValidationPageProps> = memo(function ValidationRoute({ validAddress }) {
  const location = useLocation();
  const machineValidation = useMachineSerialValidation();

  const match = matchPath(validAddress, location.pathname) !== null;

  if (!match) {
    return <Navigate to="/errorPage" replace />;
  }

  if (machineValidation.status === 'loading' || machineValidation.status === 'idle') {
    return (
      <VerticalContainer isAutoWidth align="center">
        <Loader view="primary" />
      </VerticalContainer>
    );
  }

  if (machineValidation.status === 'invalid') {
    return <ErrorPage message={machineValidation.message} />;
  }

  const authed = hasAuthTokens();

  if (isEntryPoint(location.pathname, validAddress)) {
    return <Navigate to={authed ? 'home' : 'auth'} replace />;
  }

  if (!authed && !isClientAuthRoute(location.pathname)) {
    return <Navigate to="auth" replace />;
  }

  return <Outlet />;
});

ValidationPage.displayName = 'ValidationPage';

export default ValidationPage;
