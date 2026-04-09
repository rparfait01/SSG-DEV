import { describe, it, expect } from 'vitest';
import { calculateEventBudget, syncTranslatorDependencies } from '../src/utils/calculations.js';
import { DEFAULT_EVENT } from '../src/modules/event-planner/constants.js';

function makeEvent(overrides = {}) {
  return { ...DEFAULT_EVENT, ...overrides };
}

describe('calculateEventBudget', () => {
  it('returns correct grand total for venue-only event', () => {
    const event = makeEvent({
      venue: {
        name: 'Test Venue',
        city: 'NYC',
        country: 'US',
        rental_cost_usd_cents: 500000,
        deposit_usd_cents: 0,
        deposit_due_date: '',
        support_costs: []
      }
    });
    const result = calculateEventBudget(event);
    expect(result.budget_summary.venue_total_usd_cents).toBe(500000);
    expect(result.budget_summary.grand_total_usd_cents).toBe(500000);
  });

  it('includes venue support costs in venue total', () => {
    const event = makeEvent({
      venue: {
        name: 'Test',
        city: 'NY',
        country: 'US',
        rental_cost_usd_cents: 100000,
        deposit_usd_cents: 0,
        deposit_due_date: '',
        support_costs: [
          { id: '1', description: 'AV', cost_usd_cents: 50000 }
        ]
      }
    });
    const result = calculateEventBudget(event);
    expect(result.budget_summary.venue_total_usd_cents).toBe(150000);
  });

  it('calculates per diem: headcount × days × rate', () => {
    const event = makeEvent({
      per_diem: {
        staff: { daily_rate_usd_cents: 10000, headcount: 5, days: 3, total_usd_cents: 0 },
        support_personnel: { daily_rate_usd_cents: 0, headcount: 0, days: 0, total_usd_cents: 0 }
      }
    });
    const result = calculateEventBudget(event);
    expect(result.budget_summary.per_diem_total_usd_cents).toBe(150000); // 5 × 3 × 10,000
  });

  it('calculates lodging: rooms × nights × rate', () => {
    const event = makeEvent({
      lodging: {
        property_name: 'Hotel',
        room_type: 'standard',
        rooms_reserved: 10,
        nights: 3,
        cost_per_room_per_night_usd_cents: 20000,
        total_usd_cents: 0,
        includes_translator_lodging: false
      }
    });
    const result = calculateEventBudget(event);
    expect(result.budget_summary.lodging_total_usd_cents).toBe(600000); // 10 × 3 × 20,000
  });

  it('calculates translation: days × rate per translator', () => {
    const event = makeEvent({
      translation: {
        translators: [
          { id: 't1', name: 'A', language_pair: 'en-ja', days: 3, rate_per_day_usd_cents: 50000, travel_required: false, lodging_required: false },
          { id: 't2', name: 'B', language_pair: 'en-zh', days: 2, rate_per_day_usd_cents: 60000, travel_required: false, lodging_required: false }
        ],
        total_usd_cents: 0
      }
    });
    const result = calculateEventBudget(event);
    // 3×50,000 + 2×60,000 = 150,000 + 120,000 = 270,000
    expect(result.budget_summary.translation_total_usd_cents).toBe(270000);
  });

  it('zero values do not cause NaN in totals', () => {
    const event = makeEvent();
    const result = calculateEventBudget(event);
    const summary = result.budget_summary;
    expect(isNaN(summary.grand_total_usd_cents)).toBe(false);
    expect(isNaN(summary.venue_total_usd_cents)).toBe(false);
    expect(isNaN(summary.lodging_total_usd_cents)).toBe(false);
  });

  it('grand total is sum of all section totals', () => {
    const event = makeEvent({
      venue: { name: '', city: '', country: '', rental_cost_usd_cents: 100000, deposit_usd_cents: 0, deposit_due_date: '', support_costs: [] },
      lodging: { property_name: '', room_type: 'standard', rooms_reserved: 2, nights: 1, cost_per_room_per_night_usd_cents: 50000, total_usd_cents: 0, includes_translator_lodging: false }
    });
    const result = calculateEventBudget(event);
    expect(result.budget_summary.grand_total_usd_cents).toBe(200000);
  });

  it('sets last_calculated to a valid ISO date', () => {
    const result = calculateEventBudget(makeEvent());
    expect(() => new Date(result.budget_summary.last_calculated)).not.toThrow();
  });
});

describe('syncTranslatorDependencies', () => {
  it('adds airfare group when translator has travel_required = true', () => {
    const event = makeEvent({
      translation: {
        translators: [
          { id: 'tr-1', name: 'T', language_pair: 'en-ja', days: 1, rate_per_day_usd_cents: 0, travel_required: true, lodging_required: false, airfare_group_id: null }
        ],
        total_usd_cents: 0
      },
      airfare: { groups: [], total_usd_cents: 0 }
    });

    const result = syncTranslatorDependencies(event);
    expect(result.airfare.groups.length).toBe(1);
    expect(result.airfare.groups[0].group_type).toBe('translator');
    expect(result.airfare.groups[0].id).toBe('tr-1_air');
  });

  it('does not add duplicate airfare group if one already exists', () => {
    const event = makeEvent({
      translation: {
        translators: [
          { id: 'tr-1', name: 'T', language_pair: 'en-ja', days: 1, rate_per_day_usd_cents: 0, travel_required: true, lodging_required: false, airfare_group_id: 'tr-1_air' }
        ],
        total_usd_cents: 0
      },
      airfare: {
        groups: [{ id: 'tr-1_air', group_type: 'translator', traveler_count: 1, class: 'economy', cost_per_person_usd_cents: 0, subtotal_usd_cents: 0, notes: '' }],
        total_usd_cents: 0
      }
    });

    const result = syncTranslatorDependencies(event);
    expect(result.airfare.groups.length).toBe(1);
  });

  it('does not add airfare group when travel_required = false', () => {
    const event = makeEvent({
      translation: {
        translators: [
          { id: 'tr-1', name: 'T', language_pair: 'en-ja', days: 1, rate_per_day_usd_cents: 0, travel_required: false, lodging_required: false, airfare_group_id: null }
        ],
        total_usd_cents: 0
      },
      airfare: { groups: [], total_usd_cents: 0 }
    });

    const result = syncTranslatorDependencies(event);
    expect(result.airfare.groups.length).toBe(0);
  });

  it('handles events with no translation', () => {
    const event = makeEvent({ translation: null });
    const result = syncTranslatorDependencies(event);
    expect(result).toBeDefined();
  });
});
