import { FC, memo, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { resolvePaymentReturnAuthRedirect } from '../../constants/pendingPayment';
import { getReturningAuthPath, hasAuthTokens } from '../ValidationPage/helpers';

type HomeAuthGuardProps = {
  children: ReactNode;
};

const HomeAuthGuard: FC<HomeAuthGuardProps> = memo(function HomeAuthGuard({ children }) {
  const location = useLocation();

  if (!hasAuthTokens()) {
    const redirectTo = location.pathname.startsWith('/payment/')
      ? resolvePaymentReturnAuthRedirect()
      : getReturningAuthPath();

    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
});

HomeAuthGuard.displayName = 'HomeAuthGuard';

export default HomeAuthGuard;
