import {
  buildSmsAuthPath,
  buildSmsAuthRelativePath,
  getCodeEntryTitle,
  getResendReadyLabel,
  getResendWaitingLabel,
  getSendCodeErrorMessage,
  parseOtpChannel,
} from './authSendCode';

describe('authSendCode', () => {
  it('builds absolute sms auth path with channel', () => {
    expect(buildSmsAuthPath(30, '79991234567', 'FLASHCALL')).toBe(
      '/auth/sms/30/79991234567/FLASHCALL',
    );
    expect(buildSmsAuthPath(30, '79991234567', 'SMS')).toBe('/auth/sms/30/79991234567/SMS');
  });

  it('builds machine-scoped sms auth path', () => {
    expect(buildSmsAuthPath(30, '79991234567', 'SMS', 'ABC-123')).toBe(
      '/m/ABC-123/auth/sms/30/79991234567/SMS',
    );
    expect(buildSmsAuthPath(30, '79991234567', 'SMS', 'serial/with/slash')).toBe(
      '/m/serial%2Fwith%2Fslash/auth/sms/30/79991234567/SMS',
    );
  });

  it('deprecated relative alias returns absolute path without serial', () => {
    expect(buildSmsAuthRelativePath(30, '79991234567', 'FLASHCALL')).toBe(
      '/auth/sms/30/79991234567/FLASHCALL',
    );
  });

  it('parses otp channel from route param', () => {
    expect(parseOtpChannel('SMS')).toBe('SMS');
    expect(parseOtpChannel('FLASHCALL')).toBe('FLASHCALL');
    expect(parseOtpChannel(undefined)).toBe('FLASHCALL');
  });

  it('maps send-code errors to Russian messages', () => {
    expect(getSendCodeErrorMessage({ code: 'DAILY_LIMIT' })).toContain('5 запросов');
    expect(getSendCodeErrorMessage({ code: 'RATE_LIMIT', retryAfterSeconds: 45 })).toContain(
      '45 сек',
    );
    expect(getSendCodeErrorMessage({ code: 'RATE_LIMIT' })).toContain('Слишком частые');
  });

  it('uses channel-specific copy', () => {
    expect(getCodeEntryTitle('FLASHCALL')).toContain('звонка');
    expect(getCodeEntryTitle('SMS')).toContain('SMS');
    expect(getResendReadyLabel('FLASHCALL')).toBe('Отправить SMS');
    expect(getResendReadyLabel('SMS')).toBe('Запросить SMS повторно');
    expect(getResendWaitingLabel(12, 'FLASHCALL')).toContain('Отправить SMS через 12');
    expect(getResendWaitingLabel(12, 'SMS')).toContain('Запросить SMS повторно через 12');
  });
});
