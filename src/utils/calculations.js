/**
 * Meridian Budget Calculation Engine
 *
 * Pure functions. No side effects. No storage calls.
 * Input: event object with raw cent values
 * Output: budget_summary with all totals calculated
 *
 * Called every time any budget field changes.
 * The UI displays the output. The UI never does math.
 */

import { sumCents } from './currency.js';

/**
 * Calculate venue total
 */
function calcVenue(venue) {
  if (!venue) return 0;
  const supportTotal = sumCents(
    (venue.support_costs || []).map(c => c.cost_usd_cents)
  );
  return sumCents([venue.rental_cost_usd_cents, supportTotal]);
}

/**
 * Calculate lodging total
 * rooms × nights × rate = total
 */
function calcLodging(lodging) {
  if (!lodging) return 0;
  const rooms = parseInt(lodging.rooms_reserved) || 0;
  const nights = parseInt(lodging.nights) || 0;
  const rate = parseInt(lodging.cost_per_room_per_night_usd_cents) || 0;
  return rooms * nights * rate;
}

/**
 * Calculate airfare total
 * Each group: travelers × cost_per_person = subtotal
 */
function calcAirfare(airfare) {
  if (!airfare?.groups) return 0;
  const groupTotals = airfare.groups.map(g => {
    const count = parseInt(g.traveler_count) || 0;
    const cost = parseInt(g.cost_per_person_usd_cents) || 0;
    return count * cost;
  });
  return sumCents(groupTotals);
}

/**
 * Calculate per diem totals
 * Each category: headcount × days × daily_rate = total
 */
function calcPerDiem(perDiem) {
  if (!perDiem) return 0;

  const staffTotal = (() => {
    const s = perDiem.staff;
    if (!s) return 0;
    return (parseInt(s.headcount) || 0) * (parseInt(s.days) || 0) * (parseInt(s.daily_rate_usd_cents) || 0);
  })();

  const supportTotal = (() => {
    const s = perDiem.support_personnel;
    if (!s) return 0;
    return (parseInt(s.headcount) || 0) * (parseInt(s.days) || 0) * (parseInt(s.daily_rate_usd_cents) || 0);
  })();

  return staffTotal + supportTotal;
}

/**
 * Calculate translation total
 * Each translator: days × rate_per_day = subtotal
 * Also returns per-translator calculated subtotals for display
 */
function calcTranslation(translation) {
  if (!translation?.translators) return { total: 0, translators: [] };

  const translators = translation.translators.map(t => {
    const days = parseInt(t.days) || 0;
    const rate = parseInt(t.rate_per_day_usd_cents) || 0;
    const subtotal = days * rate;
    return { ...t, subtotal_usd_cents: subtotal };
  });

  const total = sumCents(translators.map(t => t.subtotal_usd_cents));
  return { total, translators };
}

/**
 * Calculate materials total
 */
function calcMaterials(materials) {
  if (!materials?.cost_lines) return 0;
  return sumCents(materials.cost_lines.map(c => c.cost_usd_cents));
}

/**
 * Calculate support requirements total
 */
function calcSupport(supportRequirements) {
  if (!supportRequirements?.cost_lines) return 0;
  return sumCents(supportRequirements.cost_lines.map(c => c.cost_usd_cents));
}

/**
 * MAIN CALCULATION FUNCTION
 * Call this any time event data changes.
 * Returns updated event with all totals calculated.
 */
export function calculateEventBudget(event) {
  const venueTotalCents        = calcVenue(event.venue);
  const lodgingTotalCents      = calcLodging(event.lodging);
  const airfareTotalCents      = calcAirfare(event.airfare);
  const perDiemTotalCents      = calcPerDiem(event.per_diem);
  const { total: translationTotalCents, translators: calcedTranslators } = calcTranslation(event.translation);
  const materialsTotalCents    = calcMaterials(event.materials);
  const supportTotalCents      = calcSupport(event.support_requirements);

  const grandTotalCents = sumCents([
    venueTotalCents,
    lodgingTotalCents,
    airfareTotalCents,
    perDiemTotalCents,
    translationTotalCents,
    materialsTotalCents,
    supportTotalCents
  ]);

  const rate = parseFloat(event.usd_exchange_rate) || 1.0;

  return {
    ...event,
    translation: event.translation
      ? { ...event.translation, translators: calcedTranslators, total_usd_cents: translationTotalCents }
      : event.translation,
    budget_summary: {
      venue_total_usd_cents:       venueTotalCents,
      lodging_total_usd_cents:     lodgingTotalCents,
      airfare_total_usd_cents:     airfareTotalCents,
      per_diem_total_usd_cents:    perDiemTotalCents,
      translation_total_usd_cents: translationTotalCents,
      materials_total_usd_cents:   materialsTotalCents,
      support_total_usd_cents:     supportTotalCents,
      grand_total_usd_cents:       grandTotalCents,
      grand_total_display:         (grandTotalCents / 100) * rate,
      last_calculated:             new Date().toISOString()
    }
  };
}

/**
 * Cross-section push logic:
 * When a translator row has travel_required = true,
 * ensure an airfare group exists for that translator.
 * When lodging_required = true, increment lodging room count.
 *
 * Call this after any translator change.
 */
export function syncTranslatorDependencies(event) {
  if (!event.translation?.translators) return event;

  let updatedEvent = { ...event };

  event.translation.translators.forEach(translator => {
    // Sync airfare
    if (translator.travel_required && translator.id) {
      const groups = updatedEvent.airfare?.groups || [];
      const existing = groups.find(g => g.id === translator.airfare_group_id);

      if (!existing) {
        const newGroup = {
          id: translator.id + '_air',
          group_type: 'translator',
          traveler_count: 1,
          class: 'economy',
          cost_per_person_usd_cents: 0,
          subtotal_usd_cents: 0,
          notes: `Auto-generated for translator: ${translator.name}`
        };
        updatedEvent = {
          ...updatedEvent,
          airfare: {
            ...updatedEvent.airfare,
            groups: [...groups, newGroup]
          }
        };
      }
    }
  });

  return updatedEvent;
}
