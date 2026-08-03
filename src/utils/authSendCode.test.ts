import {
  buildSmsAuthPath,
  buildSmsAuthRelativePath,
  getCodeEntryTitle,
  getFlashcallFallbackHint,
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
    expect(getCodeEntryTitle('FLASHCALL')).toBe('Ждём звонок');
    expect(getCodeEntryTitle('SMS')).toBe('Введите код из SMS');
    expect(getFlashcallFallbackHint()).toBe('Не пришёл звонок?');
    expect(getResendReadyLabel('FLASHCALL')).toBe('Получить код по SMS');
    expect(getResendReadyLabel('SMS')).toBe('Запросить SMS повторно');
    expect(getResendWaitingLabel(12, 'FLASHCALL')).toBe('SMS станет доступно через 12 сек.');
    expect(getResendWaitingLabel(12, 'SMS')).toBe('Запросить SMS повторно через 12 сек.');
  });

  it('does not imply SMS is active during FLASHCALL waiting state', () => {
    const waiting = getResendWaitingLabel(30, 'FLASHCALL');
    expect(waiting).not.toContain('Отправить SMS');
    expect(waiting).toContain('SMS станет доступно');
  });
});
