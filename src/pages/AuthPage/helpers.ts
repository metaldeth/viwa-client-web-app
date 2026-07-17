import { PhoneValidation } from './types';

/**
 * Функция производит валидацию номера телефона
 */
export const checkPhoneValidation = (phoneNumber: string): PhoneValidation => {
  if (phoneNumber[1] !== '9') {
    return { isValid: false, message: 'Номер должен начинаться с +79' };
  }

  if (phoneNumber.length !== 11) {
    return { isValid: false, message: 'Длинна номера не соответствует' };
  }

  return { isValid: true, message: '' };
};
