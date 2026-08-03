import {
  buildSmsAuthRelativePath,
  getCodeEntryTitle,
  getResendReadyLabel,
  getResendWaitingLabel,
  getSendCodeErrorMessage,
  parseOtpChannel,
} from './authSendCode';

describe('authSendCode', () => {
  it('builds sms auth path with channel', () => {
    expect(buildSmsAuthRelativePath(30, '79991234567', 'FLASHCALL')).toBe(
      'sms/30/79991234567/FLASHCALL',
    );
    expect(buildSmsAuthRelativePath(30, '79991234567', 'SMS')).toBe('sms/30/79991234567/SMS');
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
