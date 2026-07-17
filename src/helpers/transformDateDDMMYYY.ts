/**
 * Преобразует строку даты в заданный формат "ДД.ММ.ГГГГ".
 */
export const formatDateDDMMYYYY = (isoDate: string | null | undefined): string | null => {
  if (!isoDate) return null;

  const date = new Date(isoDate);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // месяцы с 0
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};
