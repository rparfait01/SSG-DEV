/**
 * Meridian SSG Health Push
 *
 * Reads org_health_signals where pushed_to_ssg = false
 * Applies anonymization
 * POSTs to SSG_PUSH_ENDPOINT
 * Marks records as pushed
 *
 * Only runs if:
 *   1. ENV.SSG_PUSH.ENABLED = true
 *   2. ENV.SSG_PUSH.ENDPOINT is set
 *   3. Organization has health_push_enabled = true in config
 *   4. Organization has >= MIN_ORG_SIZE_FOR_PUSH active users
 *
 * See DATA_GOVERNANCE.md for what is and is not transmitted.
 */

import storage from './storage.js';
import ENV from '../config/env.js';

export async function pushHealthSignals(organizationId) {
  if (!ENV.SSG_PUSH.ENABLED || !ENV.SSG_PUSH.ENDPOINT) return { skipped: true, reason: 'Push not configured' };

  const org = await storage.getById('organizations', organizationId);
  if (!org?.config?.health_push_enabled) return { skipped: true, reason: 'Push disabled for this org' };

  const users = await storage.getAll('users', { organization_id: organizationId, active: true });
  if (users.length < ENV.SSG_PUSH.MIN_ORG_SIZE_FOR_PUSH) {
    return { skipped: true, reason: `Org size ${users.length} below minimum ${ENV.SSG_PUSH.MIN_ORG_SIZE_FOR_PUSH}` };
  }

  const unpushed = (await storage.getAll('org_health_signals', { organization_id: organizationId }))
    .filter(s => !s.pushed_to_ssg);

  if (unpushed.length === 0) return { pushed: 0, reason: 'No new signals' };

  // Anonymize before sending — strip all identifiers
  const anonymized = unpushed.map(signal => ({
    signal_date: signal.signal_date,
    lhi_score: signal.lhi_score,
    friction_density: signal.friction_density,
    legitimacy_index: signal.legitimacy_index,
    plh_distribution: signal.plh_distribution,
    readiness_output: signal.readiness_output,
    org_type: signal.org_type,
    org_size_band: signal.org_size_band,
    region_code: signal.region_code
    // organization_id deliberately excluded
  }));

  try {
    const response = await fetch(ENV.SSG_PUSH.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signals: anonymized, schema_version: '1.0' })
    });

    if (response.ok) {
      // Mark as pushed
      for (const signal of unpushed) {
        await storage.update('org_health_signals', signal.id, {
          pushed_to_ssg: true,
          pushed_at: new Date().toISOString()
        });
      }
      return { pushed: unpushed.length };
    }
    return { error: `Push failed: ${response.status}` };
  } catch (err) {
    return { error: err.message };
  }
}
