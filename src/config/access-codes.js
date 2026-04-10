/**
 * Beta Access Codes
 * Each code maps to exactly one role + org.
 * Distribute one code per person — codes are case-insensitive.
 * To add users: add entries here and redeploy.
 */

export const ACCESS_CODES = {
  // ── Global ──────────────────────────────────────────────
  'MERID-GB01': { org: 'eo-global-001', role: 'global_board',        label: 'Global Board' },
  'MERID-RP01': { org: 'eo-global-001', role: 'global_board',        label: 'Global Board' },
  'MERID-ED01': { org: 'eo-global-001', role: 'executive_director',  label: 'Executive Director' },
  'MERID-HR01': { org: 'eo-global-001', role: 'hr',                  label: 'HR' },
  'MERID-GV01': { org: 'eo-global-001', role: 'governance',          label: 'Governance' },

  // ── Asia Pacific Regional ────────────────────────────────
  'MERID-RC01': { org: 'eo-apac-001',   role: 'regional_councillor', label: 'Regional Councillor — APAC' },
  'MERID-RD01': { org: 'eo-apac-001',   role: 'regional_director',   label: 'Regional Director — APAC' },

  // ── Europe Regional ──────────────────────────────────────
  'MERID-SD01': { org: 'eo-europe-001', role: 'senior_director',     label: 'Senior Director — Europe' },

  // ── EO Japan Chapter ────────────────────────────────────
  'MERID-CP01': { org: 'eo-japan-001',  role: 'chapter_president',   label: 'Chapter President — Japan' },
  'MERID-CS01': { org: 'eo-japan-001',  role: 'chapter_staff',       label: 'Chapter Staff — Japan' },

  // ── EO Singapore Chapter ────────────────────────────────
  'MERID-CP02': { org: 'eo-singapore-001', role: 'chapter_president', label: 'Chapter President — Singapore' },
};

/**
 * Resolve a code to { org, role, label } or null if invalid.
 */
export function resolveCode(raw) {
  return ACCESS_CODES[raw.trim().toUpperCase()] || null;
}
