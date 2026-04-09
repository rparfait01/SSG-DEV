import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

const READINESS_COLOR = {
  Grounded:   'var(--status-grounded)',
  Rebuilding: 'var(--status-rebuilding)',
  Scattered:  'var(--status-scattered)'
};

export default function OrgHealthDashboard({ storage, session }) {
  const [signals, setSignals] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    if (!storage) return;
    storage.getAll('org_health_signals', { organization_id: session.organization_id })
      .then(data => {
        const sorted = [...data].sort((a, b) => a.signal_date.localeCompare(b.signal_date));
        setSignals(sorted);
        setLatest(sorted[sorted.length - 1] || null);
      })
      .catch(console.error);
  }, [storage, session.organization_id]);

  const chartData = signals.map(s => ({
    date: s.signal_date,
    LHI: s.lhi_score,
    Farmer: s.farmer_score,
    Soil: s.soil_score,
    Seed: s.seed_score
  }));

  return (
    <div className="module org-health">
      <div className="module__header">
        <h1>Organizational Health</h1>
        {latest && <span className="last-updated">Last signal: {latest.signal_date}</span>}
      </div>

      {!latest ? (
        <div className="empty-dashboard">
          <p>No health signals on record. Deploy ORRA-Lite to establish a baseline.</p>
        </div>
      ) : (
        <>
          {/* Current state banner */}
          <div className="health-banner" style={{ borderColor: READINESS_COLOR[latest.readiness_output] }}>
            <div className="health-banner__score" style={{ color: READINESS_COLOR[latest.readiness_output] }}>
              {latest.lhi_score}
            </div>
            <div className="health-banner__meta">
              <div
                className="readiness-badge"
                style={{ background: READINESS_COLOR[latest.readiness_output] }}
              >
                {latest.readiness_output}
              </div>
              <div className="health-banner__signal-date">Signal date: {latest.signal_date}</div>
            </div>
          </div>

          {/* Layer breakdown */}
          <div className="layer-breakdown">
            {[
              { key: 'farmer_score', label: 'Farmer (Leadership)', weight: '50%' },
              { key: 'soil_score',   label: 'Soil (Environment)',  weight: '35%' },
              { key: 'seed_score',   label: 'Seed (Individual)',   weight: '15%' }
            ].map(({ key, label, weight }) => (
              <div key={key} className="layer-row">
                <span className="layer-name">{label}</span>
                <div className="layer-bar-track">
                  <div
                    className="layer-bar-fill"
                    style={{ width: `${latest[key] || 0}%`, background: 'var(--ssg-navy-primary)' }}
                  />
                </div>
                <span className="layer-score">{latest[key] || 0}</span>
                <span className="layer-weight">{weight}</span>
              </div>
            ))}
          </div>

          {/* Trend chart */}
          {chartData.length > 1 && (
            <div className="trend-chart">
              <h2>LHI Trend</h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <ReferenceLine y={70} stroke="var(--status-grounded)" strokeDasharray="4 4" label="Grounded" />
                  <ReferenceLine y={45} stroke="var(--status-rebuilding)" strokeDasharray="4 4" label="Rebuilding" />
                  <Line type="monotone" dataKey="LHI" stroke="var(--ssg-navy-primary)" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Friction density (if available) */}
          {latest.friction_density !== undefined && (
            <div className="friction-indicator">
              <span className="friction-label">Friction Density</span>
              <span className="friction-value">{latest.friction_density} events/period</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
