import { toCents, fromCents } from '../../../utils/currency.js';
import { SUPPORT_LIBRARY } from '../constants.js';
import { v4 as uuidv4 } from 'uuid';

export default function SectionSupport({ event, updateEvent, displayCurrency, exchangeRate }) {
  const support = event.support_requirements;

  const toggleItem = (key) => {
    const selected = support.selected_items || [];
    const costLines = support.cost_lines || [];

    if (selected.includes(key)) {
      updateEvent('support_requirements.selected_items', selected.filter(k => k !== key));
      updateEvent('support_requirements.cost_lines', costLines.filter(c => c.item_key !== key));
    } else {
      updateEvent('support_requirements.selected_items', [...selected, key]);
      updateEvent('support_requirements.cost_lines', [
        ...costLines,
        { id: uuidv4(), item_key: key, description: SUPPORT_LIBRARY[key], cost_usd_cents: 0 }
      ]);
    }
  };

  const updateCost = (id, value) => {
    const updated = support.cost_lines.map(c =>
      c.id === id ? { ...c, cost_usd_cents: toCents(value, exchangeRate) } : c
    );
    updateEvent('support_requirements.cost_lines', updated);
  };

  return (
    <div className="section">
      <p className="section-note">Select support services, then enter estimated costs.</p>

      <div className="library-grid">
        {Object.entries(SUPPORT_LIBRARY).map(([key, label]) => (
          <button
            key={key}
            className={`library-item ${(support.selected_items || []).includes(key) ? 'selected' : ''}`}
            onClick={() => toggleItem(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {(support.cost_lines || []).length > 0 && (
        <div className="cost-lines">
          <h4>Selected Services</h4>
          {support.cost_lines.map(line => (
            <div key={line.id} className="cost-line">
              <span className="cost-line-label">{line.description}</span>
              <input
                type="text"
                defaultValue={line.cost_usd_cents ? (line.cost_usd_cents / 100 * exchangeRate).toFixed(2) : ''}
                onBlur={e => updateCost(line.id, e.target.value)}
                placeholder="0.00"
              />
            </div>
          ))}
        </div>
      )}

      <div className="section-total">
        Support Total: {fromCents(event.budget_summary?.support_total_usd_cents || 0, exchangeRate, displayCurrency)}
      </div>
    </div>
  );
}
