/**
 * @vitest-environment jsdom
 */
import { ACCESS_TOKEN_STORAGE_NAME, REFRESH_TOKEN_STORAGE_NAME } from '../../consts/env/storage';
import { ClientDataType } from '../../types/enums/clientDataType';
import { installBrowserStorageMocks } from '../../test/browserMocks';
import { hasAuthTokens } from './helpers';

describe('hasAuthTokens', () => {
  beforeEach(() => {
    installBrowserStorageMocks();
  });

  it('treats refresh token alone as authenticated without CLIENT_TOKEN', () => {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, 'refresh-only');

    expect(localStorage.getItem(ClientDataType.CLIENT_TOKEN)).toBeNull();
    expect(hasAuthTokens()).toBe(true);
  });

  it('tolerates access-only credentials temporarily', () => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, 'access-only');

    expect(hasAuthTokens()).toBe(true);
  });

  it('returns false when no tokens are stored', () => {
    expect(hasAuthTokens()).toBe(false);
  });
});
