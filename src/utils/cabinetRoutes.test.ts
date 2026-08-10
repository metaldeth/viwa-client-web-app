import { isViwaCabinetShellRoute } from './cabinetRoutes';

describe('cabinetRoutes', () => {
  it('matches cabinet and auth shell routes without legacy FLOW header', () => {
    expect(isViwaCabinetShellRoute('/home')).toBe(true);
    expect(isViwaCabinetShellRoute('/payment/success')).toBe(true);
    expect(isViwaCabinetShellRoute('/payment/failed')).toBe(true);
    expect(isViwaCabinetShellRoute('/auth')).toBe(true);
    expect(isViwaCabinetShellRoute('/auth/sms/30/79001234567/FLASHCALL')).toBe(true);
    expect(isViwaCabinetShellRoute('/register')).toBe(true);
    expect(isViwaCabinetShellRoute('/m/VIWA-000004/home')).toBe(true);
    expect(isViwaCabinetShellRoute('/m/VIWA-000004/auth')).toBe(true);
  });

  it('keeps legacy FLOW header on non-shell routes', () => {
    expect(isViwaCabinetShellRoute('/errorPage')).toBe(false);
    expect(isViwaCabinetShellRoute('/m/VIWA-000004')).toBe(false);
  });
});
