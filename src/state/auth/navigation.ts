import { clearStoredSerialAfterRegistration, replaceBrowserUrl } from '../../utils/landingEntry';

export const POST_AUTH_HOME_PATH = '/home';

export const completeFirstRegistrationNavigation = (): void => {
  clearStoredSerialAfterRegistration();
  replaceBrowserUrl(POST_AUTH_HOME_PATH);
};

export const completeReturningAuthNavigation = (): void => {
  replaceBrowserUrl(POST_AUTH_HOME_PATH);
};
