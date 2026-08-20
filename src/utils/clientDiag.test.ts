import { maskPhoneForDiag } from './clientDiag';

describe('clientDiag', () => {
  it('masks phone digits for diagnostics', () => {
    expect(maskPhoneForDiag('79045449783')).toBe('+7904***9783');
    expect(maskPhoneForDiag('+79045449783')).toBe('+7904***9783');
  });
});
