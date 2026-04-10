/**
 * Meridian Access Codes — Client Configuration
 *
 * SETUP INSTRUCTIONS FOR EACH NEW CLIENT DEPLOYMENT:
 * 1. Set CODE_PREFIX to match this client (e.g. 'EO-', 'XYZ-')
 * 2. Replace codes below with codes for this client's users.
 * 3. Suffix must be exactly 4 alphanumeric characters (e.g. RP01, ED01).
 * 4. Set org IDs to match this client's organization structure.
 * 5. Commit and push → Vercel auto-deploys.
 *
 * Available roles:
 *   global_board | executive_director | regional_councillor | regional_director
 *   senior_director | chapter_president | chapter_staff | hr | governance
 *
 * dev: true  →  full nav access for review/development purposes
 */

/** Prefix shown on the login screen. Change per client deployment. */
export const CODE_PREFIX = 'MERID-';

export const ACCESS_CODES = {

  // ── Developer ────────────────────────────────────────────
  'MERID-RP01': { org: 'eo-global-001', role: 'executive_director', label: 'Developer',          dev: true },

  // ── Global ───────────────────────────────────────────────
  'MERID-ED01': { org: 'eo-global-001', role: 'executive_director', label: 'Executive Director' },
  'MERID-GB01': { org: 'eo-global-001', role: 'global_board',       label: 'Global Board' },
  'MERID-HR01': { org: 'eo-global-001', role: 'hr',                 label: 'HR' },
  'MERID-GV01': { org: 'eo-global-001', role: 'governance',         label: 'Governance' },

};

/**
 * Resolve a code to { org, role, label, dev? } or null if invalid.
 */
export function resolveCode(raw) {
  return ACCESS_CODES[raw.trim().toUpperCase()] || null;
}
