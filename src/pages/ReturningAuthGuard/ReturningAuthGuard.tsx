import { FC, memo, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { hasAuthTokens } from '../ValidationPage/helpers';

type ReturningAuthGuardProps = {
  children: ReactNode;
};

const ReturningAuthGuard: FC<ReturningAuthGuardProps> = memo(function ReturningAuthGuard({
  children,
}) {
  if (hasAuthTokens()) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
});

ReturningAuthGuard.displayName = 'ReturningAuthGuard';

export default ReturningAuthGuard;
