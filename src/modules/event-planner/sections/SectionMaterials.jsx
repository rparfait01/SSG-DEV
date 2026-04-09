import { toCents, fromCents } from '../../../utils/currency.js';
import { MATERIALS_LIBRARY } from '../constants.js';
import { v4 as uuidv4 } from 'uuid';

export default function SectionMaterials({ event, updateEvent, displayCurrency, exchangeRate }) {
  const materials = event.materials;

  const toggleItem = (key) => {
    const selected = materials.selected_items || [];
    const costLines = materials.cost_lines || [];

    if (selected.includes(key)) {
      updateEvent('materials.selected_items', selected.filter(k => k !== key));
      updateEvent('materials.cost_lines', costLines.filter(c => c.item_key !== key));
    } else {
      updateEvent('materials.selected_items', [...selected, key]);
      updateEvent('materials.cost_lines', [
        ...costLines,
        { id: uuidv4(), item_key: key, description: MATERIALS_LIBRARY[key], cost_usd_cents: 0 }
      ]);
    }
  };

  const updateCost = (id, value) => {
    const updated = materials.cost_lines.map(c =>
      c.id === id ? { ...c, cost_usd_cents: toCents(value, exchangeRate) } : c
    );
    updateEvent('materials.cost_lines', updated);
  };

  return (
    <div className="section">
      <p className="section-note">Select items, then enter estimated costs.</p>

      <div className="library-grid">
        {Object.entries(MATERIALS_LIBRARY).map(([key, label]) => (
          <button
            key={key}
            className={`library-item ${(materials.selected_items || []).includes(key) ? 'selected' : ''}`}
            onClick={() => toggleItem(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {(materials.cost_lines || []).length > 0 && (
        <div className="cost-lines">
          <h4>Selected Items</h4>
          {materials.cost_lines.map(line => (
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
        Materials Total: {fromCents(event.budget_summary?.materials_total_usd_cents || 0, exchangeRate, displayCurrency)}
      </div>
    </div>
  );
}
