/**
 * Значение объёма из API telemetry-loyalty: литры (BigDecimal → number | string в JSON).
 * Переводит в миллитры для UI.
 */
export function litersFieldToMl(liters: unknown): number {
  if (liters === null || liters === undefined) {
    return 0;
  }
  if (typeof liters === 'number') {
    return Number.isFinite(liters) ? Math.round(liters * 1000) : 0;
  }
  if (typeof liters === 'string') {
    const n = parseFloat(liters.replace(',', '.'));
    return Number.isFinite(n) ? Math.round(n * 1000) : 0;
  }
  return 0;
}
