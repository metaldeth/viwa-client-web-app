import { FC } from 'react';

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import styles from './App.module.scss';

import { Theme } from '@asnefedov/uikit/Theme';

import { presetGpnDefault } from '../theme';

import AppHeader from '../components/AppHeader/AppHeader';

import ErrorPage from './ErrorPage/ErrorPage';

import AuthPage from './AuthPage';

import SmsPage from './SmsPage';

import VerticalContainer from '../components/VerticalContainer';

import ValidationPage from './ValidationPage';

import SubscriptionPage from './SubscriptionPage';

import RegisterPage from './RegisterPage';

import ReturningAuthGuard from './ReturningAuthGuard';

import HomeAuthGuard from './HomeAuthGuard';

import { isViwaCabinetShellRoute } from '../utils/cabinetRoutes';

export const App: FC = () => {
  const validAddress = '/m/:machineSerial/*';

  const location = useLocation();

  const hideLegacyHeader = isViwaCabinetShellRoute(location.pathname);

  return (
    <Theme className={styles.theme} preset={presetGpnDefault}>
      <VerticalContainer
        space={0}
        className={`${styles.app} ${hideLegacyHeader ? styles.appCabinetShell : ''}`}
      >
        {!hideLegacyHeader && <AppHeader />}

        <VerticalContainer
          className={`${styles.appContent} ${hideLegacyHeader ? styles.appContentCabinet : ''}`}
        >
          <Routes>
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/auth"
              element={
                <ReturningAuthGuard>
                  <AuthPage />
                </ReturningAuthGuard>
              }
            />

            <Route
              path="/auth/sms/:time/:phone"
              element={
                <ReturningAuthGuard>
                  <SmsPage />
                </ReturningAuthGuard>
              }
            />

            <Route
              path="/home"
              element={
                <HomeAuthGuard>
                  <SubscriptionPage />
                </HomeAuthGuard>
              }
            />

            <Route path={validAddress} element={<ValidationPage validAddress={validAddress} />}>
              <Route
                path="auth"
                element={
                  <ReturningAuthGuard>
                    <AuthPage />
                  </ReturningAuthGuard>
                }
              />

              <Route
                path="auth/sms/:time/:phone"
                element={
                  <ReturningAuthGuard>
                    <SmsPage />
                  </ReturningAuthGuard>
                }
              />

              <Route path="home" element={<SubscriptionPage />} />
            </Route>

            <Route path="/errorPage" element={<ErrorPage />} />

            <Route path="/*" element={<Navigate to="/errorPage" replace />} />
          </Routes>
        </VerticalContainer>
      </VerticalContainer>
    </Theme>
  );
};

export default App;
