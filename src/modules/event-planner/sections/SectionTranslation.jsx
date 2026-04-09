import { toCents, fromCents } from '../../../utils/currency.js';
import { v4 as uuidv4 } from 'uuid';

const LANGUAGE_LABELS = { en: 'English', es: 'Spanish', pt: 'Portuguese', ja: 'Japanese', zh: 'Chinese' };

export default function SectionTranslation({ event, updateEvent, displayCurrency, exchangeRate }) {
  const translation = event.translation;

  const addTranslator = () => {
    const t = {
      id: uuidv4(),
      name: '',
      language_pair: 'en-es',
      days: 0,
      rate_per_day_usd_cents: 0,
      subtotal_usd_cents: 0,
      travel_required: false,
      lodging_required: false,
      airfare_group_id: null
    };
    updateEvent('translation.translators', [...(translation.translators || []), t]);
  };

  const removeTranslator = (id) => {
    updateEvent('translation.translators', translation.translators.filter(t => t.id !== id));
  };

  const updateTranslator = (id, field, value) => {
    const updated = translation.translators.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        [field]: field === 'rate_per_day_usd_cents'
          ? toCents(value, exchangeRate)
          : field === 'days'
            ? parseInt(value) || 0
            : value
      };
    });
    updateEvent('translation.translators', updated);
  };

  const toggleLanguage = (lang) => {
    const current = event.languages_required || [];
    const updated = current.includes(lang)
      ? current.filter(l => l !== lang)
      : [...current, lang];
    updateEvent('languages_required', updated);
  };

  return (
    <div className="section">
      <div className="field-row field-row--checkbox">
        <label>
          <input
            type="checkbox"
            checked={event.translation_required}
            onChange={e => updateEvent('translation_required', e.target.checked)}
          />
          Translation required for this event
        </label>
      </div>

      {event.translation_required && (
        <>
          <div className="field-row">
            <label>Languages Required</label>
            <div className="language-pills">
              {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                <button
                  key={code}
                  className={`pill ${(event.languages_required || []).includes(code) ? 'active' : ''}`}
                  onClick={() => toggleLanguage(code)}
                  disabled={event.type === 'global'}
                >
                  {label}
                </button>
              ))}
            </div>
            {event.type === 'global' && (
              <span className="field-note">All 5 languages selected for Global events</span>
            )}
          </div>

          <div className="subsection-header">
            <span>Translators</span>
            <button className="btn-add" onClick={addTranslator}>+ Add Translator</button>
          </div>

          {(translation.translators || []).length === 0 && (
            <p className="empty-state">No translators added.</p>
          )}

          {(translation.translators || []).map(t => (
            <div key={t.id} className="translator-row">
              <div className="field-row field-row--split">
                <div>
                  <label>Name</label>
                  <input
                    type="text"
                    value={t.name}
                    onChange={e => updateTranslator(t.id, 'name', e.target.value)}
                    placeholder="Translator name"
                  />
                </div>
                <div>
                  <label>Language Pair</label>
                  <input
                    type="text"
                    value={t.language_pair}
                    onChange={e => updateTranslator(t.id, 'language_pair', e.target.value)}
                    placeholder="e.g. en-ja"
                  />
                </div>
              </div>

              <div className="field-row field-row--split">
                <div>
                  <label>Days</label>
                  <input
                    type="number"
                    min="0"
                    value={t.days}
                    onChange={e => updateTranslator(t.id, 'days', e.target.value)}
                  />
                </div>
                <div>
                  <label>Rate / Day</label>
                  <input
                    type="text"
                    defaultValue={t.rate_per_day_usd_cents ? (t.rate_per_day_usd_cents / 100 * exchangeRate).toFixed(2) : ''}
                    onBlur={e => updateTranslator(t.id, 'rate_per_day_usd_cents', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="field-row field-row--checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={t.travel_required}
                    onChange={e => updateTranslator(t.id, 'travel_required', e.target.checked)}
                  />
                  Travel required
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={t.lodging_required}
                    onChange={e => updateTranslator(t.id, 'lodging_required', e.target.checked)}
                  />
                  Lodging required
                </label>
              </div>

              <div className="line-subtotal">
                Subtotal: {fromCents(t.days * t.rate_per_day_usd_cents, exchangeRate, displayCurrency)}
              </div>

              <button className="btn-remove-group" onClick={() => removeTranslator(t.id)}>Remove</button>
            </div>
          ))}
        </>
      )}

      <div className="section-total">
        Translation Total: {fromCents(event.budget_summary?.translation_total_usd_cents || 0, exchangeRate, displayCurrency)}
      </div>
    </div>
  );
}
