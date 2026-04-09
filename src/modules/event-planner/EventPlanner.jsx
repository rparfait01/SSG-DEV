import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { calculateEventBudget, syncTranslatorDependencies } from '../../utils/calculations.js';
import { fromCents } from '../../utils/currency.js';
import { DEFAULT_EVENT } from './constants.js';
import SectionEventIdentity from './sections/SectionEventIdentity.jsx';
import SectionVenue from './sections/SectionVenue.jsx';
import SectionLodging from './sections/SectionLodging.jsx';
import SectionAirfare from './sections/SectionAirfare.jsx';
import SectionPerDiem from './sections/SectionPerDiem.jsx';
import SectionTranslation from './sections/SectionTranslation.jsx';
import SectionMaterials from './sections/SectionMaterials.jsx';
import SectionSupport from './sections/SectionSupport.jsx';

// ─── Utility: deep set via dot-path ───────────────────────────────────────────
function deepSet(obj, path, value) {
  const keys = path.split('.');
  if (keys.length === 1) return { ...obj, [path]: value };
  const [head, ...rest] = keys;
  return {
    ...obj,
    [head]: deepSet(obj[head] || {}, rest.join('.'), value)
  };
}

const SECTIONS = [
  { key: 'identity',    label: 'Event Identity' },
  { key: 'venue',       label: 'Venue' },
  { key: 'lodging',     label: 'Lodging' },
  { key: 'airfare',     label: 'Airfare' },
  { key: 'per_diem',    label: 'Per Diem' },
  { key: 'translation', label: 'Translation' },
  { key: 'materials',   label: 'Materials' },
  { key: 'support',     label: 'Support Requirements' }
];

export default function EventPlanner({ storage, initialEvent = null }) {
  const navigate = useNavigate();
  const [event, setEvent] = useState(initialEvent || { ...DEFAULT_EVENT });
  const [openSections, setOpenSections] = useState({ identity: true });
  const [saving, setSaving] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const displayCurrency = event.display_currency || 'USD';
  const exchangeRate = parseFloat(event.usd_exchange_rate) || 1.0;

  function updateEvent(path, value) {
    setEvent(prev => {
      const updated = deepSet(prev, path, value);
      const withCalc = calculateEventBudget(updated);
      const withSync = syncTranslatorDependencies(withCalc);
      return withSync;
    });
  }

  function toggleSection(key) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      if (event.id) {
        await storage.update('events', event.id, event);
      } else {
        const saved = await storage.create('events', event);
        setEvent(saved);
      }
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const summary = event.budget_summary || {};

      // Header
      doc.setFontSize(18);
      doc.setTextColor(27, 42, 74); // SSG Navy
      doc.text('Meridian by SSG', 14, 20);

      doc.setFontSize(14);
      doc.text(event.name || 'Untitled Event', 14, 30);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Type: ${event.type} | Status: ${event.status}`, 14, 38);
      if (event.start_date && event.end_date) {
        doc.text(`Dates: ${event.start_date} — ${event.end_date} (${event.duration_days} days)`, 14, 44);
      }
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 50);

      // Budget summary table
      const rows = [
        ['Venue', fromCents(summary.venue_total_usd_cents, exchangeRate, displayCurrency)],
        ['Lodging', fromCents(summary.lodging_total_usd_cents, exchangeRate, displayCurrency)],
        ['Airfare', fromCents(summary.airfare_total_usd_cents, exchangeRate, displayCurrency)],
        ['Per Diem', fromCents(summary.per_diem_total_usd_cents, exchangeRate, displayCurrency)],
        ['Translation', fromCents(summary.translation_total_usd_cents, exchangeRate, displayCurrency)],
        ['Materials', fromCents(summary.materials_total_usd_cents, exchangeRate, displayCurrency)],
        ['Support', fromCents(summary.support_total_usd_cents, exchangeRate, displayCurrency)]
      ];

      autoTable(doc, {
        startY: 58,
        head: [['Category', `Amount (${displayCurrency})`]],
        body: rows,
        foot: [['GRAND TOTAL', fromCents(summary.grand_total_usd_cents, exchangeRate, displayCurrency)]],
        headStyles: { fillColor: [27, 42, 74] },
        footStyles: { fillColor: [201, 168, 76], textColor: [0, 0, 0], fontStyle: 'bold' }
      });

      doc.save(`meridian-event-budget-${(event.name || 'export').replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExportingPdf(false);
    }
  }

  const sectionProps = { event, updateEvent, displayCurrency, exchangeRate, fromCents };

  return (
    <div className="event-planner">
      <div className="event-planner__header">
        <h1>{event.id ? 'Edit Event' : 'New Event'}</h1>
        <div className="event-planner__actions">
          <button className="btn-secondary" onClick={handleExportPdf} disabled={exportingPdf}>
            {exportingPdf ? 'Exporting…' : 'Export PDF'}
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
        </div>
      </div>

      {saveError && <div className="error-banner">{saveError}</div>}

      {/* Grand Total Banner */}
      {event.budget_summary?.grand_total_usd_cents > 0 && (
        <div className="grand-total-banner">
          <span className="grand-total-label">Grand Total</span>
          <span className="grand-total-value">
            {fromCents(event.budget_summary.grand_total_usd_cents, exchangeRate, displayCurrency)}
          </span>
          {displayCurrency !== 'USD' && (
            <span className="grand-total-usd">
              (USD {fromCents(event.budget_summary.grand_total_usd_cents, 1.0, 'USD')})
            </span>
          )}
        </div>
      )}

      {/* Collapsible Sections */}
      {SECTIONS.map(({ key, label }) => (
        <div key={key} className="collapsible-section">
          <button
            className={`collapsible-header ${openSections[key] ? 'open' : ''}`}
            onClick={() => toggleSection(key)}
          >
            <span>{label}</span>
            <span className="chevron">{openSections[key] ? '▲' : '▼'}</span>
          </button>

          {openSections[key] && (
            <div className="collapsible-body">
              {key === 'identity'    && <SectionEventIdentity {...sectionProps} />}
              {key === 'venue'       && <SectionVenue {...sectionProps} />}
              {key === 'lodging'     && <SectionLodging {...sectionProps} />}
              {key === 'airfare'     && <SectionAirfare {...sectionProps} />}
              {key === 'per_diem'    && <SectionPerDiem {...sectionProps} />}
              {key === 'translation' && <SectionTranslation {...sectionProps} />}
              {key === 'materials'   && <SectionMaterials {...sectionProps} />}
              {key === 'support'     && <SectionSupport {...sectionProps} />}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
