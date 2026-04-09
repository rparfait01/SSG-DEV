/**
 * Meridian Currency Utilities
 *
 * RULE: All values are stored as integer USD cents.
 *       Conversion to display currency happens HERE, at output only.
 *       Input from users in non-USD currencies is converted TO cents immediately on entry.
 *
 * Why cents? Floating point arithmetic on decimals produces errors.
 * $10.50 + $0.10 = $10.600000000001 in float. 1050 + 10 = 1060 in integer. Always correct.
 */

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',          symbol: '$',    region: 'United States' },
  { code: 'CNY', name: 'Chinese Yuan',        symbol: '¥',    region: 'China' },
  { code: 'JPY', name: 'Japanese Yen',        symbol: '¥',    region: 'Japan' },
  { code: 'KRW', name: 'South Korean Won',    symbol: '₩',    region: 'South Korea' },
  { code: 'EUR', name: 'Euro',                symbol: '€',    region: 'Europe' },
  { code: 'ZAR', name: 'South African Rand',  symbol: 'R',    region: 'South Africa' },
  { code: 'BRL', name: 'Brazilian Real',      symbol: 'R$',   region: 'Brazil' },
  { code: 'MXN', name: 'Mexican Peso',        symbol: '$',    region: 'Mexico' },
  { code: 'CAD', name: 'Canadian Dollar',     symbol: '$',    region: 'Canada' },
  { code: 'SGD', name: 'Singapore Dollar',    symbol: '$',    region: 'Singapore' },
  { code: 'THB', name: 'Thai Baht',           symbol: '฿',    region: 'Thailand' },
  { code: 'PHP', name: 'Philippine Peso',     symbol: '₱',    region: 'Philippines' },
  { code: 'AUD', name: 'Australian Dollar',   symbol: '$',    region: 'Australia' },
  { code: 'NZD', name: 'New Zealand Dollar',  symbol: '$',    region: 'New Zealand' },
  { code: 'PKR', name: 'Pakistani Rupee',     symbol: '₨',    region: 'Pakistan' },
  { code: 'AED', name: 'UAE Dirham',          symbol: 'د.إ',  region: 'UAE' },
  { code: 'QAR', name: 'Qatari Riyal',        symbol: 'ر.ق',  region: 'Qatar' },
  { code: 'TRY', name: 'Turkish Lira',        symbol: '₺',    region: 'Turkey' }
];

/**
 * Convert a user-entered dollar amount (string or number) to USD cents (integer)
 * Input: "1,250.50" or 1250.50 or "¥150,000" (with rate provided)
 * Output: 125050 (integer cents)
 */
export function toCents(amount, exchangeRate = 1.0) {
  if (amount === null || amount === undefined || amount === '') return 0;
  const cleaned = String(amount).replace(/[^0-9.]/g, '');
  const float = parseFloat(cleaned) || 0;
  const usd = float / exchangeRate;
  return Math.round(usd * 100);
}

/**
 * Convert USD cents (integer) to display amount in target currency
 * Input:  125050 cents, rate 150.0 (USD/JPY), 'JPY'
 * Output: "¥187,575"
 */
export function fromCents(cents, exchangeRate = 1.0, currencyCode = 'USD') {
  if (!cents) return formatCurrency(0, currencyCode);
  const usd = cents / 100;
  const displayAmount = usd * exchangeRate;
  return formatCurrency(displayAmount, currencyCode);
}

/**
 * Format a number as currency display string
 */
export function formatCurrency(amount, currencyCode = 'USD') {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  const symbol = currency?.symbol || '$';

  // Currencies with no decimal places
  const noDecimal = ['JPY', 'KRW'];
  const decimals = noDecimal.includes(currencyCode) ? 0 : 2;

  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return `${symbol}${formatted}`;
}

/**
 * Sum an array of cent values safely
 */
export function sumCents(centValues) {
  return centValues.reduce((acc, val) => acc + (parseInt(val) || 0), 0);
}

/**
 * Get currency metadata by code
 */
export function getCurrency(code) {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}
