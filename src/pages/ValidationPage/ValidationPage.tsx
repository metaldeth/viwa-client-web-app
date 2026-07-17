import { FC, memo } from 'react';
import { matchPath, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useValidatedBaseParams } from './useValidatedBaseParams';
import { ValidationPageProps } from './types';
import { hasAuthTokens } from './helpers';

const trimTrailingSlashes = (p: string) => p.replace(/\/+$/, '');

const isEntryPoint = (pathname: string, basePathPattern: string) => {
  const path = trimTrailingSlashes(pathname);
  const basePattern = trimTrailingSlashes(basePathPattern).replace(/\/\*$/, '');

  return matchPath({ path: basePattern, end: true }, path) !== null;
};

const isHomePath = (pathname: string, basePathPattern: string) => {
  const path = trimTrailingSlashes(pathname);
  const basePattern = trimTrailingSlashes(basePathPattern).replace(/\/\*$/, '');

  return matchPath({ path: `${basePattern}/home`, end: true }, path) !== null;
};

/**
 * Страница валидации
 */
const ValidationPage: FC<ValidationPageProps> = memo(function ValidationRoute({ validAddress }) {
  const location = useLocation();

  const match = matchPath(validAddress, location.pathname) !== null;

  const { isValid } = useValidatedBaseParams(['orgId', 'sportId', 'machineId']);

  if (!match || !isValid) {
    return <Navigate to="/errorPage" replace />;
  }

  const authed = hasAuthTokens();

  if (isEntryPoint(location.pathname, validAddress)) {
    return <Navigate to={authed ? 'home' : 'auth'} replace />;
  }

  if (!authed && isHomePath(location.pathname, validAddress)) {
    return <Navigate to="auth" replace />;
  }

  return <Outlet />;
});

ValidationPage.displayName = 'ValidationPage';

export default ValidationPage;
