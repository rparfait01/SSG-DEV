import { toCents, fromCents } from '../../../utils/currency.js';
import { v4 as uuidv4 } from 'uuid';

export default function SectionVenue({ event, updateEvent, displayCurrency, exchangeRate }) {
  const venue = event.venue;

  const addSupportCost = () => {
    const updated = [...(venue.support_costs || []), { id: uuidv4(), description: '', cost_usd_cents: 0 }];
    updateEvent('venue.support_costs', updated);
  };

  const removeSupportCost = (id) => {
    updateEvent('venue.support_costs', venue.support_costs.filter(c => c.id !== id));
  };

  const updateSupportCost = (id, field, value) => {
    const updated = venue.support_costs.map(c =>
      c.id === id
        ? { ...c, [field]: field === 'cost_usd_cents' ? toCents(value, exchangeRate) : value }
        : c
    );
    updateEvent('venue.support_costs', updated);
  };

  return (
    <div className="section">
      <div className="field-row">
        <label>Venue Name</label>
        <input
          type="text"
          value={venue.name}
          onChange={e => updateEvent('venue.name', e.target.value)}
          placeholder="e.g. Tokyo International Forum"
        />
      </div>

      <div className="field-row field-row--split">
        <div>
          <label>City</label>
          <input
            type="text"
            value={venue.city}
            onChange={e => updateEvent('venue.city', e.target.value)}
          />
        </div>
        <div>
          <label>Country</label>
          <input
            type="text"
            value={venue.country}
            onChange={e => updateEvent('venue.country', e.target.value)}
          />
        </div>
      </div>

      <div className="field-row field-row--split">
        <div>
          <label>Rental Cost</label>
          <input
            type="text"
            defaultValue={venue.rental_cost_usd_cents ? (venue.rental_cost_usd_cents / 100 * exchangeRate).toFixed(2) : ''}
            onBlur={e => updateEvent('venue.rental_cost_usd_cents', toCents(e.target.value, exchangeRate))}
            placeholder="0.00"
          />
        </div>
        <div>
          <label>Deposit</label>
          <input
            type="text"
            defaultValue={venue.deposit_usd_cents ? (venue.deposit_usd_cents / 100 * exchangeRate).toFixed(2) : ''}
            onBlur={e => updateEvent('venue.deposit_usd_cents', toCents(e.target.value, exchangeRate))}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="field-row">
        <label>Deposit Due Date</label>
        <input
          type="date"
          value={venue.deposit_due_date}
          onChange={e => updateEvent('venue.deposit_due_date', e.target.value)}
        />
      </div>

      <div className="subsection">
        <div className="subsection-header">
          <span>Additional Venue Costs</span>
          <button className="btn-add" onClick={addSupportCost}>+ Add</button>
        </div>
        {(venue.support_costs || []).map(cost => (
          <div key={cost.id} className="line-item">
            <input
              type="text"
              value={cost.description}
              onChange={e => updateSupportCost(cost.id, 'description', e.target.value)}
              placeholder="Description"
            />
            <input
              type="text"
              defaultValue={cost.cost_usd_cents ? (cost.cost_usd_cents / 100 * exchangeRate).toFixed(2) : ''}
              onBlur={e => updateSupportCost(cost.id, 'cost_usd_cents', e.target.value)}
              placeholder="0.00"
            />
            <button className="btn-remove" onClick={() => removeSupportCost(cost.id)}>×</button>
          </div>
        ))}
      </div>

      <div className="section-total">
        Venue Total: {fromCents(event.budget_summary?.venue_total_usd_cents || 0, exchangeRate, displayCurrency)}
      </div>
    </div>
  );
}
