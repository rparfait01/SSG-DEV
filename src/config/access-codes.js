/**
 * Meridian Access Codes — Client Configuration
 *
 * SETUP INSTRUCTIONS FOR EACH NEW CLIENT DEPLOYMENT:
 *
 * 1. Replace the codes below with codes for this client's users.
 * 2. Set org IDs to match this client's organization structure.
 * 3. Only include roles that apply to this client.
 * 4. Distribute one code per person — codes are case-insensitive.
 * 5. Commit and push → Vercel auto-deploys.
 *
 * Code format recommendation: {CLIENT}-{ROLE}-{##}
 * Example for client "EO": EO-ED-01, EO-RD-01, EO-CP-01
 *
 * Available roles:
 *   global_board | executive_director | regional_councillor | regional_director
 *   senior_director | chapter_president | chapter_staff | hr | governance
 *
 * Org ID format: anything unique per org level, e.g. "client-global", "client-region-apac"
 */

/** Prefix shown to users on the login screen. Change per client deployment. */
export const CODE_PREFIX = 'MERID-';

export const ACCESS_CODES = {
  // ── Global ──────────────────────────────────────────────
  'MERID-GB01': { org: 'eo-global-001', role: 'global_board',        label: 'Global Board' },
  'MERID-RP01': { org: 'eo-global-001', role: 'executive_director',  label: 'Executive Director' },
  'MERID-ED01': { org: 'eo-global-001', role: 'executive_director',  label: 'Executive Director' },
  'MERID-HR01': { org: 'eo-global-001', role: 'hr',                  label: 'HR' },
  'MERID-GV01': { org: 'eo-global-001', role: 'governance',          label: 'Governance' },

  // ── Tier 1: Global / Executive ───────────────────────────
  'CLIENT-ED-01': { org: 'client-global',      role: 'executive_director',  label: 'Executive Director' },
  'CLIENT-GB-01': { org: 'client-global',      role: 'global_board',        label: 'Global Board' },
  'CLIENT-HR-01': { org: 'client-global',      role: 'hr',                  label: 'HR' },
  'CLIENT-GV-01': { org: 'client-global',      role: 'governance',          label: 'Governance' },

  // ── Tier 2: Regional ─────────────────────────────────────
  'CLIENT-RD-01': { org: 'client-region-01',   role: 'regional_director',   label: 'Regional Director' },
  'CLIENT-RC-01': { org: 'client-region-01',   role: 'regional_councillor', label: 'Regional Councillor' },
  'CLIENT-SD-01': { org: 'client-region-02',   role: 'senior_director',     label: 'Senior Director' },

  // ── Tier 3: Chapter / Local ──────────────────────────────
  'CLIENT-CP-01': { org: 'client-chapter-01',  role: 'chapter_president',   label: 'Chapter President' },
  'CLIENT-CS-01': { org: 'client-chapter-01',  role: 'chapter_staff',       label: 'Chapter Staff' },
  'CLIENT-CP-02': { org: 'client-chapter-02',  role: 'chapter_president',   label: 'Chapter President' },

};

/**
 * Resolve a code to { org, role, label } or null if invalid.
 */
export function resolveCode(raw) {
  return ACCESS_CODES[raw.trim().toUpperCase()] || null;
}
