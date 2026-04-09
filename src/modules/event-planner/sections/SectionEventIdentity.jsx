import { CURRENCIES } from '../../../utils/currency.js';

export default function SectionEventIdentity({ event, updateEvent }) {
  const handleTypeChange = (type) => {
    updateEvent('type', type);
    if (type === 'global') {
      updateEvent('languages_required', ['en', 'es', 'pt', 'ja', 'zh']);
      updateEvent('translation_required', true);
    }
  };

  const handleDateChange = (field, value) => {
    updateEvent(field, value);
    if (field === 'start_date' || field === 'end_date') {
      const start = field === 'start_date' ? value : event.start_date;
      const end = field === 'end_date' ? value : event.end_date;
      if (start && end) {
        const days = Math.max(0, Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1);
        updateEvent('duration_days', days);
      }
    }
  };

  return (
    <div className="section">
      <div className="field-row">
        <label>Event Name</label>
        <input
          type="text"
          value={event.name}
          onChange={e => updateEvent('name', e.target.value)}
          placeholder="e.g. GLC 2026 Tokyo"
        />
      </div>

      <div className="field-row">
        <label>Event Type</label>
        <div className="toggle-group">
          {['global', 'regional', 'chapter'].map(t => (
            <button
              key={t}
              className={`toggle-btn ${event.type === t ? 'active' : ''}`}
              onClick={() => handleTypeChange(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="field-row">
        <label>Start Date</label>
        <input
          type="date"
          value={event.start_date}
          onChange={e => handleDateChange('start_date', e.target.value)}
        />
      </div>

      <div className="field-row">
        <label>End Date</label>
        <input
          type="date"
          value={event.end_date}
          onChange={e => handleDateChange('end_date', e.target.value)}
        />
      </div>

      {event.duration_days > 0 && (
        <div className="field-row">
          <label>Duration</label>
          <span className="computed-value">{event.duration_days} day{event.duration_days !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="field-row">
        <label>Display Currency</label>
        <select
          value={event.display_currency}
          onChange={e => updateEvent('display_currency', e.target.value)}
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.name} ({c.symbol})
            </option>
          ))}
        </select>
      </div>

      {event.display_currency !== 'USD' && (
        <div className="field-row">
          <label>Exchange Rate (1 USD = ? {event.display_currency})</label>
          <input
            type="number"
            min="0.0001"
            step="0.0001"
            value={event.usd_exchange_rate}
            onChange={e => updateEvent('usd_exchange_rate', parseFloat(e.target.value) || 1.0)}
          />
        </div>
      )}
    </div>
  );
}
