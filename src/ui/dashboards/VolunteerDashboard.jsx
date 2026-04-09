import { useState, useEffect } from 'react';
import { can } from '../../core/auth.js';
import { fromCents } from '../../utils/currency.js';
import { useNavigate } from 'react-router-dom';

export default function VolunteerDashboard({ session }) {
  const [healthSignal, setHealthSignal] = useState(null);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  const role = session.role;

  // Readiness color mapping
  const readinessColor = {
    Grounded:   'var(--status-grounded)',
    Rebuilding: 'var(--status-rebuilding)',
    Scattered:  'var(--status-scattered)'
  };

  return (
    <div className="dashboard dashboard--volunteer">
      <div className="dashboard__panels">

        {/* Panel 1: Direction */}
        <div className="panel panel--direction">
          <div className="panel__header">
            <h2>Direction</h2>
            <span className="panel__subtitle">From {session.permissions.sees_above || 'Board'}</span>
          </div>
          <div className="panel__body">
            <p className="empty-state">No current objectives have been set from above.</p>
          </div>
        </div>

        {/* Panel 2: Health Signal */}
        <div className="panel panel--health">
          <div className="panel__header">
            <h2>Organizational Health</h2>
          </div>
          <div className="panel__body">
            {healthSignal ? (
              <div className="health-snapshot">
                <div
                  className="health-score"
                  style={{ color: readinessColor[healthSignal.readiness_output] }}
                >
                  {healthSignal.lhi_score}
                </div>
                <div
                  className="readiness-badge"
                  style={{ background: readinessColor[healthSignal.readiness_output] }}
                >
                  {healthSignal.readiness_output}
                </div>
                <div className="health-meta">
                  Last assessed: {healthSignal.signal_date}
                </div>
              </div>
            ) : (
              <div className="health-snapshot health-snapshot--empty">
                <p>No health signal on record.</p>
                {can(role, 'deploy_orra_lite') && (
                  <button className="btn-primary" onClick={() => navigate('/orra-lite')}>
                    Run ORRA-Lite
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Finance (if role has access) */}
        {can(role, 'view_chapter_finance') && (
          <div className="panel panel--finance">
            <div className="panel__header">
              <h2>Budget Summary</h2>
              <span className="panel__subtitle">Read only</span>
            </div>
            <div className="panel__body">
              <p className="empty-state">No budget data available for your scope.</p>
            </div>
          </div>
        )}

        {/* Panel 4: Rhythm (upcoming events) */}
        <div className="panel panel--rhythm">
          <div className="panel__header">
            <h2>Upcoming</h2>
          </div>
          <div className="panel__body">
            {events.length === 0 ? (
              <p className="empty-state">No upcoming events in your scope.</p>
            ) : (
              <ul className="event-list">
                {events.map(ev => (
                  <li key={ev.id} className="event-list-item">
                    <span className="event-name">{ev.name}</span>
                    <span className="event-date">{ev.start_date}</span>
                    <span className={`event-type type--${ev.type}`}>{ev.type}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Instrument triggers */}
        {(can(role, 'deploy_orra_lite') || can(role, 'deploy_plh')) && (
          <div className="panel panel--instruments">
            <div className="panel__header">
              <h2>Instruments</h2>
            </div>
            <div className="panel__body instrument-actions">
              {can(role, 'deploy_orra_lite') && (
                <button className="instrument-btn" onClick={() => navigate('/orra-lite')}>
                  <span className="instrument-name">ORRA-Lite</span>
                  <span className="instrument-desc">12-item organizational diagnostic</span>
                </button>
              )}
              {can(role, 'deploy_plh') && (
                <button className="instrument-btn" onClick={() => navigate('/plh')}>
                  <span className="instrument-name">PLH Assessment</span>
                  <span className="instrument-desc">Human foundation conditions</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
