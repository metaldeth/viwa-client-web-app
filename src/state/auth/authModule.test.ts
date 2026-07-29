import { AuthModule } from '../../app/api/modules/auth/authModule';
import type { AxiosCoreApi } from '../../app/api/axiosCore';

describe('AuthModule registrationHint', () => {
  const post = vi.fn().mockResolvedValue({
    accessToken: 'access',
    refreshToken: 'refresh',
    expiresIn: 3600,
    client: { id: 'client-1' },
  });

  const request = { post } as unknown as AxiosCoreApi;
  const authModule = new AuthModule(request);

  beforeEach(() => {
    post.mockClear();
  });

  it('CW05-3: sends registrationHint=website when provided', async () => {
    await authModule.checkCodeAndCreateClient('79991234567', '1234', {
      machineSerial: 'VIWA-000004',
      registrationHint: 'website',
    });

    expect(post).toHaveBeenCalledWith(
      expect.stringContaining('/client/auth/check-code'),
      expect.objectContaining({
        phone: '+79991234567',
        code: '1234',
        machineSerial: 'VIWA-000004',
        registrationHint: 'website',
      }),
      expect.any(Object),
    );

    const body = post.mock.calls[0][1] as Record<string, unknown>;
    expect(body).not.toHaveProperty('registrationSource');
  });

  it('omits registrationHint when not provided', async () => {
    await authModule.checkCodeAndCreateClient('79991234567', '1234', {
      machineSerial: 'VIWA-000004',
    });

    const body = post.mock.calls[0][1] as Record<string, unknown>;
    expect(body).not.toHaveProperty('registrationHint');
    expect(body).not.toHaveProperty('registrationSource');
  });
});
