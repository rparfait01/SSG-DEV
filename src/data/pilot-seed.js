/**
 * EO Pilot seed data — browser-safe (no fs/path imports)
 * Imported by App.jsx to seed localStorage on first load.
 */

export const organizations = [
  { id: 'eo-global-001', name: "Entrepreneurs' Organization — Global", type: 'global', parent_id: null, region: 'Global', active: true, config: { health_push_enabled: false, languages: ['en','es','pt','ja','zh'], display_currency: 'USD' }, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'eo-apac-001',   name: 'EO Asia Pacific',    type: 'regional', parent_id: 'eo-global-001', region: 'Asia Pacific',   active: true, config: { health_push_enabled: false, languages: ['en','ja','zh'],      display_currency: 'USD' }, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'eo-noam-001',   name: 'EO North America',   type: 'regional', parent_id: 'eo-global-001', region: 'North America',  active: true, config: { health_push_enabled: false, languages: ['en','es'],           display_currency: 'USD' }, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'eo-europe-001', name: 'EO Europe',           type: 'regional', parent_id: 'eo-global-001', region: 'Europe',         active: true, config: { health_push_enabled: false, languages: ['en','es','pt'],      display_currency: 'EUR' }, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'eo-latam-001',  name: 'EO Latin America',   type: 'regional', parent_id: 'eo-global-001', region: 'Latin America',  active: true, config: { health_push_enabled: false, languages: ['en','es','pt'],      display_currency: 'USD' }, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'eo-japan-001',  name: 'EO Japan',            type: 'chapter',  parent_id: 'eo-apac-001',   region: 'Asia Pacific',   active: true, config: { health_push_enabled: false, languages: ['en','ja'],           display_currency: 'JPY' }, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'eo-singapore-001', name: 'EO Singapore',    type: 'chapter',  parent_id: 'eo-apac-001',   region: 'Asia Pacific',   active: true, config: { health_push_enabled: false, languages: ['en','zh'],           display_currency: 'SGD' }, created_at: '2026-04-01T00:00:00.000Z' }
];

export const users = [
  { id: 'user-gb-001',  organization_id: 'eo-global-001', role: 'global_board',        track: 'volunteer', display_name: 'Alexandra Chen',     active: true, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'user-ed-001',  organization_id: 'eo-global-001', role: 'executive_director',  track: 'staff',     display_name: 'Marcus Rivera',      active: true, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'user-rc-001',  organization_id: 'eo-apac-001',   role: 'regional_councillor', track: 'volunteer', display_name: 'Kenji Yamamoto',     active: true, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'user-rd-001',  organization_id: 'eo-apac-001',   role: 'regional_director',   track: 'staff',     display_name: 'Priya Sharma',       active: true, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'user-sd-001',  organization_id: 'eo-europe-001', role: 'senior_director',     track: 'staff',     display_name: 'Isabel Ferreira',    active: true, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'user-cp-001',  organization_id: 'eo-japan-001',  role: 'chapter_president',   track: 'volunteer', display_name: 'Takeshi Nakamura',   active: true, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'user-cs-001',  organization_id: 'eo-japan-001',  role: 'chapter_staff',       track: 'staff',     display_name: 'Yuki Tanaka',        active: true, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'user-hr-001',  organization_id: 'eo-global-001', role: 'hr',                  track: 'staff',     display_name: 'Diana Okonkwo',      active: true, created_at: '2026-04-01T00:00:00.000Z' },
  { id: 'user-gov-001', organization_id: 'eo-global-001', role: 'governance',          track: 'mixed',     display_name: 'Robert MacAllister', active: true, created_at: '2026-04-01T00:00:00.000Z' }
];

export const events = [
  {
    id: 'event-glc-001',
    organization_id: 'eo-global-001',
    created_by: 'user-ed-001',
    name: 'GLC Tokyo 2026',
    type: 'global',
    status: 'draft',
    start_date: '2026-10-14',
    end_date: '2026-10-17',
    duration_days: 4,
    display_currency: 'JPY',
    usd_exchange_rate: 149.5,
    regions_supporting: ['Asia Pacific', 'North America', 'Europe', 'Latin America'],
    translation_required: true,
    languages_required: ['en', 'es', 'pt', 'ja', 'zh'],
    venue: {
      name: 'Tokyo International Forum', city: 'Tokyo', country: 'Japan',
      rental_cost_usd_cents: 12000000, deposit_usd_cents: 2400000, deposit_due_date: '2026-06-01',
      support_costs: [
        { id: 'sc-001', description: 'AV setup and support', cost_usd_cents: 350000 },
        { id: 'sc-002', description: 'Catering coordination fee', cost_usd_cents: 150000 }
      ]
    },
    lodging: { property_name: 'Park Hyatt Tokyo', room_type: 'standard', rooms_reserved: 80, nights: 5, cost_per_room_per_night_usd_cents: 45000, total_usd_cents: 18000000, includes_translator_lodging: true },
    airfare: {
      groups: [
        { id: 'ag-001', group_type: 'staff',  traveler_count: 12, class: 'business', cost_per_person_usd_cents: 350000, subtotal_usd_cents: 4200000, notes: 'Global HQ staff' },
        { id: 'ag-002', group_type: 'board',  traveler_count: 8,  class: 'business', cost_per_person_usd_cents: 350000, subtotal_usd_cents: 2800000, notes: 'Global board members' }
      ],
      total_usd_cents: 7000000
    },
    per_diem: {
      staff:              { daily_rate_usd_cents: 15000, headcount: 12, days: 5, total_usd_cents: 900000 },
      support_personnel:  { daily_rate_usd_cents: 10000, headcount: 8,  days: 5, total_usd_cents: 400000 },
      total_usd_cents: 1300000
    },
    translation: {
      translators: [
        { id: 'tr-001', name: 'Haruto Miyazaki', language_pair: 'en-ja', days: 4, rate_per_day_usd_cents: 80000, subtotal_usd_cents: 320000, travel_required: false, lodging_required: false, airfare_group_id: null },
        { id: 'tr-002', name: 'Wei Zhang',       language_pair: 'en-zh', days: 4, rate_per_day_usd_cents: 80000, subtotal_usd_cents: 320000, travel_required: true,  lodging_required: true,  airfare_group_id: 'tr-002_air' },
        { id: 'tr-003', name: 'Sofia Mendes',    language_pair: 'en-pt', days: 4, rate_per_day_usd_cents: 75000, subtotal_usd_cents: 300000, travel_required: true,  lodging_required: true,  airfare_group_id: 'tr-003_air' }
      ],
      total_usd_cents: 940000
    },
    materials: {
      selected_items: ['name_badges', 'printed_agenda', 'signage_stage', 'member_swag'],
      cost_lines: [
        { id: 'ml-001', item_key: 'name_badges',    description: 'Name badges (standard lanyard + insert)', cost_usd_cents: 250000 },
        { id: 'ml-002', item_key: 'printed_agenda', description: 'Printed event program / agenda',          cost_usd_cents: 180000 },
        { id: 'ml-003', item_key: 'signage_stage',  description: 'Branded signage — stage / backdrop',     cost_usd_cents: 450000 },
        { id: 'ml-004', item_key: 'member_swag',    description: 'Member gift / swag bag',                 cost_usd_cents: 600000 }
      ],
      total_usd_cents: 1480000
    },
    support_requirements: {
      selected_items: ['photographer', 'interpretation_equip', 'transport_airport'],
      cost_lines: [
        { id: 'sr-001', item_key: 'photographer',        description: 'Event photographer',                      cost_usd_cents: 400000 },
        { id: 'sr-002', item_key: 'interpretation_equip', description: 'Simultaneous interpretation equipment',  cost_usd_cents: 800000 },
        { id: 'sr-003', item_key: 'transport_airport',   description: 'Ground transportation (airport transfers)', cost_usd_cents: 300000 }
      ],
      total_usd_cents: 1500000
    },
    budget_summary: { venue_total_usd_cents: 12500000, lodging_total_usd_cents: 18000000, airfare_total_usd_cents: 7000000, per_diem_total_usd_cents: 1300000, translation_total_usd_cents: 940000, materials_total_usd_cents: 1480000, support_total_usd_cents: 1500000, grand_total_usd_cents: 42720000, grand_total_display: 6386640, last_calculated: '2026-04-01T00:00:00.000Z' },
    created_at: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'event-apac-001',
    organization_id: 'eo-apac-001',
    created_by: 'user-rd-001',
    name: 'APAC Regional Summit 2026',
    type: 'regional',
    status: 'draft',
    start_date: '2026-07-08',
    end_date: '2026-07-10',
    duration_days: 3,
    display_currency: 'SGD',
    usd_exchange_rate: 1.34,
    regions_supporting: ['Asia Pacific'],
    translation_required: true,
    languages_required: ['en', 'ja', 'zh'],
    venue: { name: 'Marina Bay Sands Convention Centre', city: 'Singapore', country: 'Singapore', rental_cost_usd_cents: 4000000, deposit_usd_cents: 800000, deposit_due_date: '2026-05-01', support_costs: [] },
    lodging: { property_name: 'Marina Bay Sands Hotel', room_type: 'standard', rooms_reserved: 40, nights: 3, cost_per_room_per_night_usd_cents: 30000, total_usd_cents: 3600000, includes_translator_lodging: false },
    airfare: { groups: [], total_usd_cents: 0 },
    per_diem: { staff: { daily_rate_usd_cents: 12000, headcount: 6, days: 3, total_usd_cents: 216000 }, support_personnel: { daily_rate_usd_cents: 8000, headcount: 4, days: 3, total_usd_cents: 96000 }, total_usd_cents: 312000 },
    translation: { translators: [], total_usd_cents: 0 },
    materials: { selected_items: [], cost_lines: [], total_usd_cents: 0 },
    support_requirements: { selected_items: [], cost_lines: [], total_usd_cents: 0 },
    budget_summary: { venue_total_usd_cents: 4000000, lodging_total_usd_cents: 3600000, airfare_total_usd_cents: 0, per_diem_total_usd_cents: 312000, translation_total_usd_cents: 0, materials_total_usd_cents: 0, support_total_usd_cents: 0, grand_total_usd_cents: 7912000, grand_total_display: 10602080, last_calculated: '2026-04-01T00:00:00.000Z' },
    created_at: '2026-04-01T00:00:00.000Z'
  }
];

export const friction_log = [
  { id: 'fl-001', organization_id: 'eo-global-001', logged_by: 'user-ed-001', log_date: '2026-03-15', category: 'Communication', description: 'GLC planning timeline was shared with regions 3 weeks later than the standard lead time, causing scheduling conflicts for several chapter presidents.', severity: 'Medium', resolved: true,  resolved_at: '2026-03-22T00:00:00.000Z', resolution_notes: 'Timeline process updated; communications now go out 90 days ahead.', created_at: '2026-03-15T00:00:00.000Z' },
  { id: 'fl-002', organization_id: 'eo-apac-001',   logged_by: 'user-rd-001', log_date: '2026-03-20', category: 'Process',        description: 'Approval workflow for regional event budgets requires three sign-offs but one approver has been unresponsive for 2 weeks, creating a bottleneck.', severity: 'High',   resolved: false, resolved_at: null, resolution_notes: '', created_at: '2026-03-20T00:00:00.000Z' },
  { id: 'fl-003', organization_id: 'eo-japan-001',  logged_by: 'user-cs-001', log_date: '2026-03-28', category: 'Resource',       description: 'Chapter operating budget for Q2 has not been confirmed by regional office despite two follow-ups. Cannot plan spring programming.', severity: 'High',   resolved: false, resolved_at: null, resolution_notes: '', created_at: '2026-03-28T00:00:00.000Z' },
  { id: 'fl-004', organization_id: 'eo-global-001', logged_by: 'user-hr-001', log_date: '2026-04-02', category: 'Structural',     description: 'Role boundaries between Senior Director and Regional Director are unclear in the APAC structure, leading to duplicated effort on the summit planning.', severity: 'Medium', resolved: false, resolved_at: null, resolution_notes: '', created_at: '2026-04-02T00:00:00.000Z' },
  { id: 'fl-005', organization_id: 'eo-apac-001',   logged_by: 'user-rd-001', log_date: '2026-04-05', category: 'Authority',      description: 'Regional director authorized a vendor contract within their stated authority, but global finance team required additional approval not specified in the policy.', severity: 'Low', resolved: true, resolved_at: '2026-04-07T00:00:00.000Z', resolution_notes: 'Policy updated to clarify authorization thresholds.', created_at: '2026-04-05T00:00:00.000Z' }
];

export const org_health_signals = [
  { id: 'ohs-global-001', organization_id: 'eo-global-001', signal_date: '2026-03-01', instrument: 'orra-lite', lhi_score: 74, farmer_score: 78, soil_score: 72, seed_score: 65, friction_density: 1.4, legitimacy_index: null, plh_distribution: null, readiness_output: 'Grounded',   org_type: 'global',   org_size_band: 'large',  region_code: 'GLOBAL', respondent_count: 14, pushed_to_ssg: false, pushed_at: null, created_at: '2026-03-01T00:00:00.000Z' },
  { id: 'ohs-apac-001',   organization_id: 'eo-apac-001',   signal_date: '2026-03-01', instrument: 'orra-lite', lhi_score: 61, farmer_score: 65, soil_score: 58, seed_score: 57, friction_density: 2.1, legitimacy_index: null, plh_distribution: null, readiness_output: 'Rebuilding', org_type: 'regional', org_size_band: 'medium', region_code: 'APAC',   respondent_count: 8,  pushed_to_ssg: false, pushed_at: null, created_at: '2026-03-01T00:00:00.000Z' },
  { id: 'ohs-japan-001',  organization_id: 'eo-japan-001',  signal_date: '2026-02-15', instrument: 'orra-lite', lhi_score: 82, farmer_score: 85, soil_score: 80, seed_score: 76, friction_density: 0.8, legitimacy_index: null, plh_distribution: null, readiness_output: 'Grounded',   org_type: 'chapter',  org_size_band: 'small',  region_code: 'APAC',   respondent_count: 5,  pushed_to_ssg: false, pushed_at: null, created_at: '2026-02-15T00:00:00.000Z' }
];

export default { organizations, users, events, friction_log, org_health_signals };
