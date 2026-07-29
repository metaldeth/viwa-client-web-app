import { FC, memo, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { hasAuthTokens } from '../ValidationPage/helpers';

type HomeAuthGuardProps = {
  children: ReactNode;
};

const HomeAuthGuard: FC<HomeAuthGuardProps> = memo(function HomeAuthGuard({ children }) {
  if (!hasAuthTokens()) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
});

HomeAuthGuard.displayName = 'HomeAuthGuard';

export default HomeAuthGuard;
