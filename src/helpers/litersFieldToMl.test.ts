import { describe, expect, it } from 'vitest';
import { litersFieldToMl } from './litersFieldToMl';

describe('litersFieldToMl', () => {
  it('возвращает 0 для null и undefined', () => {
    expect(litersFieldToMl(null)).toBe(0);
    expect(litersFieldToMl(undefined)).toBe(0);
  });

  it('переводит литры в миллилитры (number)', () => {
    expect(litersFieldToMl(1)).toBe(1000);
    expect(litersFieldToMl(0.5)).toBe(500);
    expect(litersFieldToMl(0)).toBe(0);
  });

  it('парсит строку с литрами (в т.ч. BigDecimal из JSON)', () => {
    expect(litersFieldToMl('1')).toBe(1000);
    expect(litersFieldToMl('0,5')).toBe(500);
    expect(litersFieldToMl('0.25')).toBe(250);
  });

  it('возвращает 0 для нечисловых и бесконечных значений', () => {
    expect(litersFieldToMl(Number.NaN)).toBe(0);
    expect(litersFieldToMl(Number.POSITIVE_INFINITY)).toBe(0);
    expect(litersFieldToMl('')).toBe(0);
    expect(litersFieldToMl({})).toBe(0);
  });
});
