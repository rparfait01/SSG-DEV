import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GovernanceDashboard({ session }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard dashboard--governance">
      <div className="dashboard__panels">

        {/* Panel 1: ORRA Cycle Authority */}
        <div className="panel panel--orra-cycle">
          <div className="panel__header">
            <h2>ORRA Cycle</h2>
            <span className="panel__subtitle">Governance trigger authority</span>
          </div>
          <div className="panel__body">
            <div className="instrument-actions">
              <button className="instrument-btn">
                <span className="instrument-name">Trigger ORRA Cycle</span>
                <span className="instrument-desc">Initiate organization-wide readiness assessment</span>
              </button>
            </div>
            <div className="cycle-history">
              <h3>Cycle History</h3>
              <p className="empty-state">No ORRA cycles on record.</p>
            </div>
          </div>
        </div>

        {/* Panel 2: Compliance & Dispute Flags */}
        <div className="panel panel--compliance">
          <div className="panel__header">
            <h2>Compliance &amp; Dispute Flags</h2>
            <span className="panel__subtitle">Read access — all levels</span>
          </div>
          <div className="panel__body">
            <p className="empty-state">No active compliance or dispute flags.</p>
          </div>
        </div>

        {/* Panel 3: Health Signals (read access — all levels) */}
        <div className="panel panel--health-read">
          <div className="panel__header">
            <h2>Organizational Health</h2>
            <span className="panel__subtitle">Read only — all levels</span>
          </div>
          <div className="panel__body">
            <p className="empty-state">No health signals on record.</p>
            <button className="btn-link" onClick={() => navigate('/health')}>
              View health dashboard →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
