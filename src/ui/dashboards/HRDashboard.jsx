import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HRDashboard({ session }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friction');

  return (
    <div className="dashboard dashboard--hr">
      <div className="dashboard__panels">

        {/* Panel 1: Friction Flags (HR action queue) */}
        <div className="panel panel--friction-queue">
          <div className="panel__header">
            <h2>Active Friction Flags</h2>
            <span className="panel__subtitle">All levels — HR action queue</span>
          </div>
          <div className="panel__body">
            <div className="tab-bar">
              <button
                className={`tab ${activeTab === 'friction' ? 'active' : ''}`}
                onClick={() => setActiveTab('friction')}
              >
                Friction Log
              </button>
              <button
                className={`tab ${activeTab === 'instruments' ? 'active' : ''}`}
                onClick={() => setActiveTab('instruments')}
              >
                Instruments
              </button>
            </div>

            {activeTab === 'friction' && (
              <div>
                <p className="empty-state">No active friction flags requiring HR action.</p>
                <button className="btn-link" onClick={() => navigate('/friction-log')}>
                  View full friction log →
                </button>
              </div>
            )}

            {activeTab === 'instruments' && (
              <div className="instrument-actions">
                <button className="instrument-btn" onClick={() => navigate('/orra-lite')}>
                  <span className="instrument-name">ORRA-Lite</span>
                  <span className="instrument-desc">Deploy organizational diagnostic</span>
                </button>
                <button className="instrument-btn" onClick={() => navigate('/plh')}>
                  <span className="instrument-name">PLH Assessment</span>
                  <span className="instrument-desc">Human foundation conditions survey</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Health Overview (lateral) */}
        <div className="panel panel--health-overview">
          <div className="panel__header">
            <h2>Health Overview</h2>
            <span className="panel__subtitle">All staff — aggregate only</span>
          </div>
          <div className="panel__body">
            <p className="empty-state">No health signals on record. Deploy ORRA-Lite to generate baseline.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
