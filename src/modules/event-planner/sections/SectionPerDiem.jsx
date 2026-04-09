import { toCents, fromCents } from '../../../utils/currency.js';

export default function SectionPerDiem({ event, updateEvent, displayCurrency, exchangeRate }) {
  const pd = event.per_diem;

  const renderGroup = (groupKey, label) => {
    const group = pd[groupKey];
    return (
      <div className="per-diem-group">
        <h4>{label}</h4>
        <div className="field-row field-row--triple">
          <div>
            <label>Headcount</label>
            <input
              type="number"
              min="0"
              value={group.headcount}
              onChange={e => updateEvent(`per_diem.${groupKey}.headcount`, parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label>Days</label>
            <input
              type="number"
              min="0"
              value={group.days}
              onChange={e => updateEvent(`per_diem.${groupKey}.days`, parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label>Daily Rate</label>
            <input
              type="text"
              defaultValue={group.daily_rate_usd_cents ? (group.daily_rate_usd_cents / 100 * exchangeRate).toFixed(2) : ''}
              onBlur={e => updateEvent(`per_diem.${groupKey}.daily_rate_usd_cents`, toCents(e.target.value, exchangeRate))}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="line-subtotal">
          Subtotal: {fromCents(group.headcount * group.days * group.daily_rate_usd_cents, exchangeRate, displayCurrency)}
          <span className="computed-formula">
            {group.headcount} pax × {group.days} days × {fromCents(group.daily_rate_usd_cents, exchangeRate, displayCurrency)}/day
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="section">
      {renderGroup('staff', 'Staff')}
      {renderGroup('support_personnel', 'Support Personnel')}
      <div className="section-total">
        Per Diem Total: {fromCents(event.budget_summary?.per_diem_total_usd_cents || 0, exchangeRate, displayCurrency)}
      </div>
    </div>
  );
}
