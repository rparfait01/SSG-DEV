import { toCents, fromCents } from '../../../utils/currency.js';

export default function SectionLodging({ event, updateEvent, displayCurrency, exchangeRate }) {
  const lodging = event.lodging;

  return (
    <div className="section">
      <div className="field-row">
        <label>Property Name</label>
        <input
          type="text"
          value={lodging.property_name}
          onChange={e => updateEvent('lodging.property_name', e.target.value)}
          placeholder="e.g. Park Hyatt Tokyo"
        />
      </div>

      <div className="field-row">
        <label>Room Type</label>
        <select
          value={lodging.room_type}
          onChange={e => updateEvent('lodging.room_type', e.target.value)}
        >
          <option value="standard">Standard</option>
          <option value="suite">Suite</option>
          <option value="single">Single</option>
        </select>
      </div>

      <div className="field-row field-row--triple">
        <div>
          <label>Rooms Reserved</label>
          <input
            type="number"
            min="0"
            value={lodging.rooms_reserved}
            onChange={e => updateEvent('lodging.rooms_reserved', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <label>Nights</label>
          <input
            type="number"
            min="0"
            value={lodging.nights}
            onChange={e => updateEvent('lodging.nights', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <label>Cost / Room / Night</label>
          <input
            type="text"
            defaultValue={lodging.cost_per_room_per_night_usd_cents ? (lodging.cost_per_room_per_night_usd_cents / 100 * exchangeRate).toFixed(2) : ''}
            onBlur={e => updateEvent('lodging.cost_per_room_per_night_usd_cents', toCents(e.target.value, exchangeRate))}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="field-row field-row--checkbox">
        <label>
          <input
            type="checkbox"
            checked={lodging.includes_translator_lodging}
            onChange={e => updateEvent('lodging.includes_translator_lodging', e.target.checked)}
          />
          Includes translator lodging
        </label>
      </div>

      <div className="section-total">
        Lodging Total: {fromCents(event.budget_summary?.lodging_total_usd_cents || 0, exchangeRate, displayCurrency)}
        <span className="computed-formula">
          {lodging.rooms_reserved} rooms × {lodging.nights} nights × {fromCents(lodging.cost_per_room_per_night_usd_cents, exchangeRate, displayCurrency)}/night
        </span>
      </div>
    </div>
  );
}
