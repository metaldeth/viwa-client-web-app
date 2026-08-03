export type OtpChannel = 'FLASHCALL' | 'SMS';

export type SendCodeApiError = {
  code?: string;
  message?: string;
  retryAfterSeconds?: number;
  status?: number;
};

export function parseOtpChannel(value: string | undefined): OtpChannel {
  return value === 'SMS' ? 'SMS' : 'FLASHCALL';
}

export function parseSendCodeApiError(error: unknown): SendCodeApiError {
  if (typeof error === 'object' && error !== null) {
    const err = error as SendCodeApiError;
    return {
      code: err.code,
      message: err.message,
      retryAfterSeconds:
        typeof err.retryAfterSeconds === 'number' ? err.retryAfterSeconds : undefined,
      status: err.status,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'Не удалось отправить код' };
}

export function getSendCodeErrorMessage(error: unknown): string {
  const parsed = parseSendCodeApiError(error);

  if (parsed.code === 'DAILY_LIMIT') {
    return 'Превышен лимит: не более 5 запросов кода в сутки. Попробуйте завтра.';
  }

  if (parsed.code === 'RATE_LIMIT') {
    const seconds = parsed.retryAfterSeconds;
    if (seconds != null && seconds > 0) {
      return `Слишком частые запросы. Повторите через ${seconds} сек.`;
    }
    return 'Слишком частые запросы. Подождите немного и попробуйте снова.';
  }

  if (parsed.message && parsed.message !== 'Unauthorized') {
    return parsed.message;
  }

  return 'Не удалось отправить код';
}

export function buildSmsAuthPath(
  cooldownSeconds: number,
  phone: string,
  channel: OtpChannel,
  machineSerial?: string,
): string {
  const segment = `sms/${cooldownSeconds}/${phone}/${channel}`;
  return machineSerial
    ? `/m/${encodeURIComponent(machineSerial)}/auth/${segment}`
    : `/auth/${segment}`;
}

/** @deprecated Use {@link buildSmsAuthPath} with absolute paths */
export function buildSmsAuthRelativePath(
  cooldownSeconds: number,
  phone: string,
  channel: OtpChannel,
): string {
  return buildSmsAuthPath(cooldownSeconds, phone, channel);
}

export function getCodeEntryTitle(channel: OtpChannel): string {
  if (channel === 'SMS') {
    return 'Введите код из SMS';
  }

  return 'Введите 4 последние цифры входящего звонка';
}

export function getResendReadyLabel(currentChannel: OtpChannel): string {
  if (currentChannel === 'FLASHCALL') {
    return 'Отправить SMS';
  }

  return 'Запросить SMS повторно';
}

export function getResendWaitingLabel(seconds: number, currentChannel: OtpChannel): string {
  if (currentChannel === 'FLASHCALL') {
    return `Отправить SMS через ${seconds} секунд`;
  }

  return `Запросить SMS повторно через ${seconds} секунд`;
}
