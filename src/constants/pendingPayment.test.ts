import {
  DEFAULT_SAFE_CABINET_RETURN_PATH,
  resolveCheckoutReturnPath,
  resolvePaymentReturnAuthRedirect,
  resolveSafeReturnPath,
  sanitizeMachineSerial,
  VIWA_PENDING_PAYMENT_KEY,
} from './pendingPayment';
import { installBrowserStorageMocks } from '../test/browserMocks';

describe('pendingPayment return path helpers', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
  });

  it('resolveSafeReturnPath accepts safe cabinet paths', () => {
    expect(resolveSafeReturnPath({ returnPath: '/home' })).toBe('/home');
    expect(resolveSafeReturnPath({ returnPath: '/m/VIWA-001/home' })).toBe('/m/VIWA-001/home');
  });

  it('resolveSafeReturnPath rejects protocol-relative paths', () => {
    expect(
      resolveSafeReturnPath({
        returnPath: '//evil.test/phish',
        machineSerial: 'VIWA-001',
      }),
    ).toBe('/m/VIWA-001/home');
  });

  it('resolveSafeReturnPath falls back to default when unsafe and no machine context', () => {
    expect(resolveSafeReturnPath({ returnPath: '//evil.test' })).toBe(
      DEFAULT_SAFE_CABINET_RETURN_PATH,
    );
    expect(resolveSafeReturnPath(null)).toBe(DEFAULT_SAFE_CABINET_RETURN_PATH);
  });

  it('sanitizeMachineSerial rejects path injection', () => {
    expect(sanitizeMachineSerial('VIWA-001')).toBe('VIWA-001');
    expect(sanitizeMachineSerial('../evil')).toBeNull();
    expect(sanitizeMachineSerial('serial/extra')).toBeNull();
  });

  it('resolvePaymentReturnAuthRedirect uses machine auth from safe returnPath', () => {
    sessionStorage.setItem(
      VIWA_PENDING_PAYMENT_KEY,
      JSON.stringify({
        paymentId: 'pay-1',
        startedAt: Date.now(),
        returnPath: '/m/VIWA-001/home',
      }),
    );

    expect(resolvePaymentReturnAuthRedirect()).toBe('/m/VIWA-001/auth');
  });

  it('resolvePaymentReturnAuthRedirect uses machineSerial when returnPath is unsafe', () => {
    sessionStorage.setItem(
      VIWA_PENDING_PAYMENT_KEY,
      JSON.stringify({
        paymentId: 'pay-1',
        startedAt: Date.now(),
        returnPath: '//evil.test',
        machineSerial: 'VIWA-002',
      }),
    );

    expect(resolvePaymentReturnAuthRedirect()).toBe('/m/VIWA-002/auth');
  });

  it('resolvePaymentReturnAuthRedirect falls back to global auth', () => {
    sessionStorage.setItem(
      VIWA_PENDING_PAYMENT_KEY,
      JSON.stringify({
        paymentId: 'pay-1',
        startedAt: Date.now(),
        returnPath: '//evil.test',
      }),
    );

    expect(resolvePaymentReturnAuthRedirect()).toBe('/auth');
  });

  it('resolveCheckoutReturnPath preserves machine home context', () => {
    expect(resolveCheckoutReturnPath('/m/ABC123/home')).toBe('/m/ABC123/home');
    expect(resolveCheckoutReturnPath('//evil')).toBe('/home');
    expect(resolveCheckoutReturnPath('/m/BAD!')).toBe('/home');
  });
});
