/**
 * Meridian Input Validators
 *
 * Validates at system boundaries: user input, API responses.
 * Internal data passed between modules is trusted.
 */

/**
 * Validate that a value is a positive integer (cents)
 */
export function isValidCents(value) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * Validate ISO date string (YYYY-MM-DD)
 */
export function isValidDate(value) {
  if (!value || typeof value !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

/**
 * Validate ISO datetime string
 */
export function isValidDatetime(value) {
  if (!value || typeof value !== 'string') return false;
  return !isNaN(Date.parse(value));
}

/**
 * Validate UUID v4
 */
export function isValidUUID(value) {
  if (!value || typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Validate role name
 */
const VALID_ROLES = [
  'global_board', 'executive_director', 'regional_councillor',
  'regional_director', 'senior_director', 'chapter_president',
  'chapter_staff', 'hr', 'governance'
];

export function isValidRole(role) {
  return VALID_ROLES.includes(role);
}

/**
 * Validate currency code
 */
const VALID_CURRENCIES = [
  'USD', 'CNY', 'JPY', 'KRW', 'EUR', 'ZAR', 'BRL', 'MXN',
  'CAD', 'SGD', 'THB', 'PHP', 'AUD', 'NZD', 'PKR', 'AED', 'QAR', 'TRY'
];

export function isValidCurrency(code) {
  return VALID_CURRENCIES.includes(code);
}

/**
 * Validate event object — checks required fields and types
 * Returns { valid: boolean, errors: string[] }
 */
export function validateEvent(event) {
  const errors = [];

  if (!event.name || typeof event.name !== 'string' || event.name.trim().length === 0) {
    errors.push('Event name is required');
  }

  if (!['global', 'regional', 'chapter'].includes(event.type)) {
    errors.push('Event type must be global, regional, or chapter');
  }

  if (event.start_date && !isValidDate(event.start_date)) {
    errors.push('start_date must be YYYY-MM-DD format');
  }

  if (event.end_date && !isValidDate(event.end_date)) {
    errors.push('end_date must be YYYY-MM-DD format');
  }

  if (event.start_date && event.end_date && event.start_date > event.end_date) {
    errors.push('start_date must be before end_date');
  }

  if (event.display_currency && !isValidCurrency(event.display_currency)) {
    errors.push(`display_currency '${event.display_currency}' is not supported`);
  }

  if (event.usd_exchange_rate !== undefined) {
    const rate = parseFloat(event.usd_exchange_rate);
    if (isNaN(rate) || rate <= 0) {
      errors.push('usd_exchange_rate must be a positive number');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate friction log entry
 */
const FRICTION_CATEGORIES = ['Process', 'Communication', 'Authority', 'Resource', 'Interpersonal', 'Structural'];
const FRICTION_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

export function validateFrictionEntry(entry) {
  const errors = [];

  if (!FRICTION_CATEGORIES.includes(entry.category)) {
    errors.push(`category must be one of: ${FRICTION_CATEGORIES.join(', ')}`);
  }

  if (!FRICTION_SEVERITIES.includes(entry.severity)) {
    errors.push(`severity must be one of: ${FRICTION_SEVERITIES.join(', ')}`);
  }

  if (entry.description && entry.description.length > 500) {
    errors.push('description must be 500 characters or fewer');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize free-text input — trim, limit length
 */
export function sanitizeText(value, maxLength = 500) {
  if (!value || typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}
