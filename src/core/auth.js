/**
 * Meridian Auth Module
 *
 * Local mode:  Simple role selection — no passwords in pilot phase
 * Server mode: JWT + bcrypt, role-based access control
 *
 * Permission matrix mirrors master.schema.json ROLES definition.
 */

import ENV from '../config/env.js';

// Role permission definitions
// Mirrors ENV.ROLES — single source of truth
export const PERMISSIONS = {
  global_board: {
    track: 'volunteer',
    tier: 1,
    can_see_finance: ['global-read'],
    can_deploy_instruments: ['orra-oversight', 'plh-oversight'],
    sees_above: null,
    sees_below: 'regional_councillor'
  },
  executive_director: {
    track: 'staff',
    tier: 1,
    can_see_finance: ['global-full'],
    can_deploy_instruments: ['orra', 'orra-lite', 'plh', 'sli', 'mentorship'],
    sees_above: null,
    sees_below: 'regional_director'
  },
  regional_councillor: {
    track: 'volunteer',
    tier: 2,
    can_see_finance: ['regional-read'],
    can_deploy_instruments: ['orra-lite-trigger'],
    sees_above: 'global_board',
    sees_below: 'chapter_president'
  },
  regional_director: {
    track: 'staff',
    tier: 2,
    can_see_finance: ['regional-full'],
    can_deploy_instruments: ['orra-lite', 'sli', 'mentorship'],
    sees_above: 'executive_director',
    sees_below: 'chapter_staff'
  },
  senior_director: {
    track: 'staff',
    tier: 2,
    can_see_finance: ['regional-full'],
    can_deploy_instruments: ['orra-lite', 'sli', 'mentorship'],
    sees_above: 'executive_director',
    sees_below: 'chapter_staff'
  },
  chapter_president: {
    track: 'volunteer',
    tier: 3,
    can_see_finance: ['chapter-read'],
    can_deploy_instruments: ['mentorship'],
    sees_above: 'regional_councillor',
    sees_below: 'chapter_staff'
  },
  chapter_staff: {
    track: 'staff',
    tier: 3,
    can_see_finance: [],
    can_deploy_instruments: [],
    sees_above: 'regional_director',
    sees_below: null
  },
  hr: {
    track: 'staff',
    tier: 0,
    can_see_finance: [],
    can_deploy_instruments: ['orra-lite', 'plh', 'training'],
    sees_above: 'executive_director',
    sees_below: 'all-staff'
  },
  governance: {
    track: 'mixed',
    tier: 0,
    can_see_finance: [],
    can_deploy_instruments: ['orra-cycle'],
    sees_above: 'global_board',
    sees_below: 'all-levels'
  }
};

/**
 * Check if a role can perform an action
 */
export function can(role, action) {
  const perms = PERMISSIONS[role];
  if (!perms) return false;

  switch (action) {
    case 'view_global_finance':    return perms.can_see_finance.includes('global-full') || perms.can_see_finance.includes('global-read');
    case 'edit_global_finance':    return perms.can_see_finance.includes('global-full');
    case 'view_regional_finance':  return perms.can_see_finance.some(f => f.startsWith('regional') || f.startsWith('global'));
    case 'edit_regional_finance':  return perms.can_see_finance.includes('regional-full') || perms.can_see_finance.includes('global-full');
    case 'view_chapter_finance':   return perms.can_see_finance.length > 0;
    case 'deploy_orra':            return perms.can_deploy_instruments.includes('orra');
    case 'deploy_orra_lite':       return perms.can_deploy_instruments.some(i => i.startsWith('orra'));
    case 'deploy_plh':             return perms.can_deploy_instruments.includes('plh') || perms.can_deploy_instruments.includes('orra-lite-plh');
    case 'deploy_sli':             return perms.can_deploy_instruments.includes('sli');
    case 'create_event':           return perms.tier <= 2;
    case 'approve_event':          return perms.tier <= 1 || (perms.track === 'staff' && perms.tier <= 2);
    case 'view_health_dashboard':  return true;
    case 'view_friction_log':      return true;
    case 'log_friction':           return perms.track === 'staff';
    case 'hr_actions':             return role === 'hr';
    case 'governance_actions':     return role === 'governance';
    default: return false;
  }
}

/**
 * Local mode: create a session object from role selection
 * Server mode: validate JWT and return session
 */
export async function createSession(roleOrToken, organizationId = null) {
  if (ENV.isLocal()) {
    // Local pilot: trust the role selection
    const role = roleOrToken;
    if (!PERMISSIONS[role]) throw new Error(`Unknown role: ${role}`);
    return {
      id: `local-${role}`,
      role,
      organization_id: organizationId || 'eo-pilot-001',
      track: PERMISSIONS[role].track,
      permissions: PERMISSIONS[role],
      local_session: true
    };
  }

  // Server mode: validate JWT
  const jwt = await import('jsonwebtoken');
  try {
    const decoded = jwt.default.verify(roleOrToken, ENV.AUTH.SECRET);
    return { ...decoded, local_session: false };
  } catch {
    throw new Error('Invalid or expired session');
  }
}

/**
 * Dashboard type for a given role
 * Volunteer roles get lighter, directional dashboards
 * Staff roles get operational, execution-dense dashboards
 */
export function getDashboardType(role) {
  return PERMISSIONS[role]?.track === 'volunteer' ? 'volunteer' : 'staff';
}
