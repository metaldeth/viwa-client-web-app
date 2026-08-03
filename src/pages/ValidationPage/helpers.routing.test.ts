import {
  getReturningAuthPath,
  getMachineEntryRedirectPath,
  isClientAuthRoute,
  isReturningAuthRoute,
} from './helpers';
import { POST_AUTH_HOME_PATH } from '../../state/auth/navigation';

describe('returning auth routing', () => {
  it('CW05-5: /auth routes do not require machineSerial', () => {
    expect(isReturningAuthRoute('/auth')).toBe(true);
    expect(isReturningAuthRoute('/auth/sms/30/79991234567/FLASHCALL')).toBe(true);
    expect(isClientAuthRoute('/auth')).toBe(true);
    expect(isClientAuthRoute('/auth/sms/30/79991234567/SMS')).toBe(true);
    expect(getReturningAuthPath()).toBe('/auth');
  });

  it('serial auth routes remain gated under /m/:machineSerial/auth', () => {
    expect(isClientAuthRoute('/m/VIWA-000004/auth')).toBe(true);
    expect(isClientAuthRoute('/m/VIWA-000004/auth/sms/30/79991234567/SMS')).toBe(true);
    expect(isReturningAuthRoute('/m/VIWA-000004/auth')).toBe(false);
  });

  it('authed machine entry redirects to canonical /home', () => {
    expect(getMachineEntryRedirectPath(true)).toBe(POST_AUTH_HOME_PATH);
    expect(getMachineEntryRedirectPath(false)).toBe('auth');
  });
});
