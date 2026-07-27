import { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
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

export const App: FC = () => {
  const validAddress = '/m/:machineSerial/*';

  return (
    <Theme className={styles.theme} preset={presetGpnDefault}>
      <VerticalContainer space={0} className={styles.app}>
        <AppHeader />
        <VerticalContainer className={styles.appContent}>
          <Routes>
            <Route path={validAddress} element={<ValidationPage validAddress={validAddress} />}>
              <Route path="auth" element={<AuthPage />} />
              <Route path="auth/sms/:time/:phone" element={<SmsPage />} />
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
