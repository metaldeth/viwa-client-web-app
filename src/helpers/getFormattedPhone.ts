/**
 * Функция для форматирования номера телефона
 */
export const getFormatPhone = (phone: string, withoutBrackets?: boolean): string => {
  const cleaned = phone.replace(/\D/g, '');

  const leftBracket = !withoutBrackets ? '(' : '';
  const rightBracket = !withoutBrackets ? ')' : '';

  if (cleaned.startsWith('8') && cleaned.length === 11) {
    return `+7 ${leftBracket}${cleaned.slice(1, 4)}${rightBracket} ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }

  if ((cleaned.startsWith('7') || cleaned.startsWith('+7')) && cleaned.length === 11) {
    const digits = cleaned.startsWith('+7') ? cleaned.slice(1) : cleaned;

    return `+7 ${leftBracket}${digits.slice(1, 4)}${rightBracket} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }

  if (cleaned.length === 10) {
    return `+7 ${leftBracket}${cleaned.slice(0, 3)}${rightBracket} ${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8)}`;
  }

  return phone;
};
