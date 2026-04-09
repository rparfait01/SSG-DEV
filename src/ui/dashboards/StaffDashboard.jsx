import { useState } from 'react';
import { can } from '../../core/auth.js';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard({ session }) {
  const navigate = useNavigate();
  const role = session.role;

  const readinessColor = {
    Grounded:   'var(--status-grounded)',
    Rebuilding: 'var(--status-rebuilding)',
    Scattered:  'var(--status-scattered)'
  };

  return (
    <div className="dashboard dashboard--staff">
      <div className="dashboard__panels">

        {/* Panel 1: Directive */}
        <div className="panel panel--directive">
          <div className="panel__header">
            <h2>Directives</h2>
            <span className="panel__subtitle">From above</span>
          </div>
          <div className="panel__body">
            <p className="empty-state">No active directives.</p>
          </div>
        </div>

        {/* Panel 2: Health & Friction */}
        <div className="panel panel--health-friction">
          <div className="panel__header">
            <h2>Health &amp; Friction</h2>
          </div>
          <div className="panel__body">
            <div className="health-friction-split">
              <div className="health-block">
                <h3>LHI Score</h3>
                <p className="empty-state">Run ORRA-Lite to generate a score.</p>
              </div>
              <div className="friction-block">
                <h3>Recent Friction</h3>
                <p className="empty-state">No friction entries.</p>
                {can(role, 'log_friction') && (
                  <button className="btn-link" onClick={() => navigate('/friction-log')}>
                    Log friction event →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Finance */}
        {can(role, 'view_chapter_finance') && (
          <div className="panel panel--finance">
            <div className="panel__header">
              <h2>Finance</h2>
              {can(role, 'edit_global_finance') && <span className="panel__badge">Full Access</span>}
              {!can(role, 'edit_global_finance') && can(role, 'edit_regional_finance') && <span className="panel__badge">Regional</span>}
            </div>
            <div className="panel__body">
              <div className="finance-actions">
                <button className="btn-primary" onClick={() => navigate('/events/new')}>
                  New Event Budget
                </button>
                <button className="btn-secondary" onClick={() => navigate('/events')}>
                  View All Events
                </button>
              </div>
              <p className="empty-state">No events in scope.</p>
            </div>
          </div>
        )}

        {/* Panel 4: Instruments */}
        <div className="panel panel--instruments">
          <div className="panel__header">
            <h2>Instruments</h2>
          </div>
          <div className="panel__body instrument-actions">
            {can(role, 'deploy_orra') && (
              <button className="instrument-btn" onClick={() => navigate('/orra-lite')}>
                <span className="instrument-name">ORRA</span>
                <span className="instrument-desc">Full organizational readiness assessment</span>
              </button>
            )}
            {can(role, 'deploy_orra_lite') && (
              <button className="instrument-btn" onClick={() => navigate('/orra-lite')}>
                <span className="instrument-name">ORRA-Lite</span>
                <span className="instrument-desc">Rapid 12-item diagnostic</span>
              </button>
            )}
            {can(role, 'deploy_plh') && (
              <button className="instrument-btn" onClick={() => navigate('/plh')}>
                <span className="instrument-name">PLH Assessment</span>
                <span className="instrument-desc">Human foundation conditions</span>
              </button>
            )}
            {can(role, 'deploy_sli') && (
              <button className="instrument-btn instrument-btn--disabled">
                <span className="instrument-name">SLI</span>
                <span className="instrument-desc">Structural Legitimacy Indicator (v0.2.0)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
