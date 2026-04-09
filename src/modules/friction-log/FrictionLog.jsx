import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, isAfter } from 'date-fns';

const CATEGORIES = ['Process', 'Communication', 'Authority', 'Resource', 'Interpersonal', 'Structural'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const SEVERITY_COLOR = { Low: '#6B7280', Medium: '#BA7517', High: '#DC6E1A', Critical: '#A32D2D' };

export default function FrictionLog({ storage, session }) {
  const [view, setView] = useState('capture');
  const [entries, setEntries] = useState([]);
  const [period, setPeriod] = useState(30);
  const [form, setForm] = useState({
    log_date: format(new Date(), 'yyyy-MM-dd'),
    category: 'Process',
    description: '',
    severity: 'Medium'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (storage) {
      storage.getAll('friction_log', { organization_id: session.organization_id })
        .then(setEntries)
        .catch(console.error);
    }
  }, [storage, session.organization_id]);

  async function handleSubmit() {
    if (!form.description.trim()) return;
    setSubmitting(true);
    try {
      const entry = {
        ...form,
        organization_id: session.organization_id,
        logged_by: session.id,
        resolved: false
      };
      const saved = await storage.create('friction_log', entry);
      setEntries(prev => [saved, ...prev]);
      setForm({
        log_date: format(new Date(), 'yyyy-MM-dd'),
        category: 'Process',
        description: '',
        severity: 'Medium'
      });
      setView('pattern');
    } finally {
      setSubmitting(false);
    }
  }

  // Pattern view calculations
  const cutoff = subDays(new Date(), period);
  const periodEntries = entries.filter(e => isAfter(new Date(e.log_date), cutoff));

  const categoryData = CATEGORIES.map(cat => ({
    category: cat,
    count: periodEntries.filter(e => e.category === cat).length
  })).filter(d => d.count > 0);

  const severityCounts = SEVERITIES.reduce((acc, sev) => {
    acc[sev] = periodEntries.filter(e => e.severity === sev).length;
    return acc;
  }, {});

  const resolved = periodEntries.filter(e => e.resolved).length;
  const resolutionRate = periodEntries.length > 0
    ? Math.round((resolved / periodEntries.length) * 100)
    : 0;

  return (
    <div className="module friction-log">
      <div className="module__header">
        <h1>Friction Log</h1>
        <div className="tab-bar">
          <button className={`tab ${view === 'capture' ? 'active' : ''}`} onClick={() => setView('capture')}>
            Log Entry
          </button>
          <button className={`tab ${view === 'pattern' ? 'active' : ''}`} onClick={() => setView('pattern')}>
            Pattern View
          </button>
        </div>
      </div>

      {/* CAPTURE VIEW */}
      {view === 'capture' && (
        <div className="friction-form">
          <div className="field-row">
            <label>Date</label>
            <input
              type="date"
              value={form.log_date}
              onChange={e => setForm(prev => ({ ...prev, log_date: e.target.value }))}
            />
          </div>

          <div className="field-row">
            <label>Category</label>
            <div className="pill-selector">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`pill ${form.category === cat ? 'active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, category: cat }))}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="field-row">
            <label>Description <span className="field-limit">({500 - form.description.length} chars remaining)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value.slice(0, 500) }))}
              rows={4}
              placeholder="Describe the friction event…"
            />
          </div>

          <div className="field-row">
            <label>Severity</label>
            <div className="pill-selector">
              {SEVERITIES.map(sev => (
                <button
                  key={sev}
                  className={`pill pill--severity ${form.severity === sev ? 'active' : ''}`}
                  style={form.severity === sev ? { background: SEVERITY_COLOR[sev], color: '#fff' } : {}}
                  onClick={() => setForm(prev => ({ ...prev, severity: sev }))}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={submitting || !form.description.trim()}
          >
            {submitting ? 'Saving…' : 'Log Friction Event'}
          </button>
        </div>
      )}

      {/* PATTERN VIEW */}
      {view === 'pattern' && (
        <div className="friction-patterns">
          <div className="period-selector">
            {[30, 60, 90].map(p => (
              <button
                key={p}
                className={`tab ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                Last {p} days
              </button>
            ))}
          </div>

          <div className="pattern-stats">
            <div className="stat-card">
              <div className="stat-value">{periodEntries.length}</div>
              <div className="stat-label">Friction Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{resolutionRate}%</div>
              <div className="stat-label">Resolution Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--status-scattered)' }}>
                {severityCounts.Critical + severityCounts.High}
              </div>
              <div className="stat-label">High / Critical</div>
            </div>
          </div>

          {categoryData.length > 0 && (
            <div className="chart-block">
              <h3>Friction by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="category" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--ssg-navy-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="severity-distribution">
            <h3>Severity Distribution</h3>
            {SEVERITIES.map(sev => (
              <div key={sev} className="severity-row">
                <span className="severity-label" style={{ color: SEVERITY_COLOR[sev] }}>{sev}</span>
                <div className="severity-bar-track">
                  <div
                    className="severity-bar-fill"
                    style={{
                      width: periodEntries.length > 0 ? `${(severityCounts[sev] / periodEntries.length) * 100}%` : '0%',
                      background: SEVERITY_COLOR[sev]
                    }}
                  />
                </div>
                <span className="severity-count">{severityCounts[sev]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
