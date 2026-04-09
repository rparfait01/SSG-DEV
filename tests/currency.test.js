import { describe, it, expect } from 'vitest';
import { toCents, fromCents, sumCents, formatCurrency, getCurrency } from '../src/utils/currency.js';

describe('toCents', () => {
  it('converts dollar string to integer cents', () => {
    expect(toCents('100.00')).toBe(10000);
    expect(toCents('1,250.50')).toBe(125050);
    expect(toCents(100.5)).toBe(10050);
  });

  it('returns 0 for empty/null/undefined input', () => {
    expect(toCents('')).toBe(0);
    expect(toCents(null)).toBe(0);
    expect(toCents(undefined)).toBe(0);
  });

  it('applies exchange rate correctly', () => {
    // 150,000 JPY at rate 150 = 1,000 USD = 100,000 cents
    expect(toCents('150000', 150)).toBe(100000);
  });

  it('rounds fractional cents', () => {
    expect(toCents('10.555')).toBe(1056);
    expect(toCents('10.554')).toBe(1055);
  });

  it('always returns an integer', () => {
    const result = toCents('99.99');
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('fromCents', () => {
  it('converts cents to USD display', () => {
    expect(fromCents(10000)).toBe('$100.00');
    expect(fromCents(125050)).toBe('$1,250.50');
  });

  it('converts cents to non-USD display with exchange rate', () => {
    // 100,000 cents = $1,000 USD × 150 = ¥150,000
    const result = fromCents(100000, 150, 'JPY');
    expect(result).toBe('¥150,000');
  });

  it('returns zero display for 0/null cents', () => {
    expect(fromCents(0)).toBe('$0.00');
    expect(fromCents(null)).toBe('$0.00');
  });
});

describe('formatCurrency', () => {
  it('formats USD with 2 decimal places', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
  });

  it('formats JPY with 0 decimal places', () => {
    expect(formatCurrency(150000, 'JPY')).toBe('¥150,000');
  });

  it('formats KRW with 0 decimal places', () => {
    expect(formatCurrency(50000, 'KRW')).toBe('₩50,000');
  });

  it('uses $ for unknown currency code', () => {
    const result = formatCurrency(100, 'UNKNOWN');
    expect(result).toContain('$');
  });
});

describe('sumCents', () => {
  it('sums an array of cent values', () => {
    expect(sumCents([100, 200, 300])).toBe(600);
  });

  it('handles empty array', () => {
    expect(sumCents([])).toBe(0);
  });

  it('handles zero values', () => {
    expect(sumCents([0, 0, 500])).toBe(500);
  });

  it('handles non-integer values by truncating', () => {
    expect(sumCents(['100', '200'])).toBe(300);
  });

  it('handles undefined/null entries as 0', () => {
    expect(sumCents([100, null, undefined, 200])).toBe(300);
  });
});

describe('getCurrency', () => {
  it('returns correct currency object for USD', () => {
    const c = getCurrency('USD');
    expect(c.code).toBe('USD');
    expect(c.symbol).toBe('$');
  });

  it('returns USD as fallback for unknown code', () => {
    const c = getCurrency('UNKNOWN');
    expect(c.code).toBe('USD');
  });

  it('returns JPY correctly', () => {
    const c = getCurrency('JPY');
    expect(c.code).toBe('JPY');
    expect(c.symbol).toBe('¥');
  });
});
