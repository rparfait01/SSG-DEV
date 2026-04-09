export const MATERIALS_LIBRARY = {
  name_badges:         'Name badges (standard lanyard + insert)',
  badge_holders:       'Badge holders / lanyards',
  printed_agenda:      'Printed event program / agenda',
  signage_directional: 'Branded signage — directional',
  signage_stage:       'Branded signage — stage / backdrop',
  banners_retractable: 'Pull-up / retractable banners',
  signage_registration:'Welcome / registration table signage',
  table_runners:       'Branded table runners / linens',
  printed_workbooks:   'Printed workbooks / session materials',
  notepads_branded:    'Notepads + pens (branded)',
  speaker_placards:    'Speaker placards / tent cards',
  certificates:        'Certificate / credential printing',
  glc_training_packets:'GLC role-based training packets',
  member_swag:         'Member gift / swag bag',
  photo_releases:      'Photography release / consent forms',
  translated_materials:'Translated materials (per language)'
};

export const SUPPORT_LIBRARY = {
  photographer:           'Event photographer',
  videographer:           'Videographer / livestream crew',
  interpretation_equip:   'Simultaneous interpretation equipment',
  event_mc:               'Event MC / facilitator (external)',
  keynote_speaker:        'Keynote speaker (paid)',
  keynote_travel:         'Keynote speaker travel & lodging',
  panel_moderator:        'Panel moderator',
  registration_staff:     'Registration / check-in staff',
  transport_airport:      'Ground transportation (airport transfers)',
  transport_local:        'Local transportation (shuttle, bus)',
  learn_around:           'Learn Around / offsite excursion coordination',
  spouse_programming:     'Spouse / life partner programming',
  childcare:              'Childcare / family programming',
  cultural_experience:    'Cultural experience / host city immersion',
  it_support:             'IT / connectivity support on-site',
  medical_standby:        'Medical / first aid standby',
  security:               'Security detail',
  volunteer_coordination: 'Volunteer coordination',
  forum_room_setup:       'Member forum / small group room setup',
  glc_facilitation:       'GLC chapter officer track facilitation',
  accelerator_support:    'EO Accelerator track support',
  gsea_coordination:      'GSEA coordination on-site'
};

export const DEFAULT_EVENT = {
  id: null,
  name: '',
  type: 'global',
  status: 'draft',
  start_date: '',
  end_date: '',
  duration_days: 0,
  display_currency: 'USD',
  usd_exchange_rate: 1.0,
  regions_supporting: [],
  translation_required: false,
  languages_required: ['en', 'es', 'pt', 'ja', 'zh'],
  venue: {
    name: '', city: '', country: '',
    rental_cost_usd_cents: 0, deposit_usd_cents: 0,
    deposit_due_date: '', support_costs: []
  },
  lodging: {
    property_name: '', room_type: 'standard',
    rooms_reserved: 0, nights: 0,
    cost_per_room_per_night_usd_cents: 0, total_usd_cents: 0,
    includes_translator_lodging: false
  },
  airfare: { groups: [], total_usd_cents: 0 },
  per_diem: {
    staff: { daily_rate_usd_cents: 0, headcount: 0, days: 0, total_usd_cents: 0 },
    support_personnel: { daily_rate_usd_cents: 0, headcount: 0, days: 0, total_usd_cents: 0 },
    total_usd_cents: 0
  },
  translation: { translators: [], total_usd_cents: 0 },
  materials: { selected_items: [], cost_lines: [], total_usd_cents: 0 },
  support_requirements: { selected_items: [], cost_lines: [], total_usd_cents: 0 },
  budget_summary: {}
};
