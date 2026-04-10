import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { can } from '../core/auth.js';
import storage from '../core/storage.browser.js';
import { resolveCode } from '../config/access-codes.js';
import AccessGate from './AccessGate.jsx';

import DashboardRouter from './dashboards/DashboardRouter.jsx';
import EventPlanner from '../modules/event-planner/EventPlanner.jsx';
import FrictionLog from '../modules/friction-log/FrictionLog.jsx';
import OrraLite from '../modules/orra-lite/OrraLite.jsx';
import PlhAssessment from '../modules/plh-assessment/PlhAssessment.jsx';
import RhythmBoard from '../modules/rhythm-board/RhythmBoard.jsx';
import OrgHealthDashboard from '../modules/org-health/OrgHealthDashboard.jsx';

import '../ui/styles/tokens.css';

function makeSession(resolved) {
  return {
    id: `local-${resolved.role}`,
    role: resolved.role,
    organization_id: resolved.org,
    label: resolved.label,
    dev: resolved.dev || false,
    local_session: true,
    permissions: {}
  };
}

function EventList({ session }) {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    storage.getAll('events', { organization_id: session.organization_id })
      .then(setEvents)
      .catch(console.error);
  }, [session]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1>Events</h1>
        {can(session.role, 'create_event') && (
          <button className="btn-primary" onClick={() => navigate('/events/new')}>New Event</button>
        )}
      </div>
      {events.length === 0 && <p className="empty-state">No events yet. Create one to get started.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.map(ev => (
          <div
            key={ev.id}
            style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '12px 16px', cursor: 'pointer' }}
            onClick={() => navigate(`/events/${ev.id}`)}
          >
            <div style={{ fontWeight: 600 }}>{ev.name}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
              {ev.type} · {ev.status} · {ev.start_date || 'No date'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);

  // Restore session from stored access code
  useEffect(() => {
    const stored = localStorage.getItem('meridian_access_code');
    if (stored) {
      const resolved = resolveCode(stored);
      if (resolved) setSession(makeSession(resolved));
    }
  }, []);

  function handleAccess(resolved) {
    setSession(makeSession(resolved));
  }

  function handleSignOut() {
    localStorage.removeItem('meridian_access_code');
    setSession(null);
  }

  const NAV_ITEMS = [
    { path: '/',             label: 'Dashboard',   always: true },
    { path: '/events',       label: 'Events',       check: (r) => can(r, 'create_event') || can(r, 'view_chapter_finance') },
    { path: '/health',       label: 'Health',       check: (r) => can(r, 'view_health_dashboard') },
    { path: '/friction-log', label: 'Friction Log', check: (r) => can(r, 'view_friction_log') },
    { path: '/orra-lite',    label: 'ORRA-Lite',    check: (r) => can(r, 'deploy_orra_lite') },
    { path: '/plh',          label: 'PLH',          always: true },
    { path: '/rhythm',       label: 'Rhythm',       always: true }
  ];

  const visibleNav = session
    ? (session.dev ? NAV_ITEMS : NAV_ITEMS.filter(n => n.always || (n.check && n.check(session.role))))
    : [{ path: '/', label: 'Dashboard', always: true }];

  if (!session) {
    return <AccessGate onAccess={handleAccess} />;
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="sidebar">
          <div className="sidebar__wordmark">
            Meridian
            <span>by Summit Strategies Group</span>
          </div>
          <div className="sidebar__nav">
            {visibleNav.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="sidebar__footer">
            v0.1.0 · Beta
            <div style={{ marginTop: 4, fontSize: 12 }}>{session.label}</div>
            <button
              style={{
                marginTop: 8, fontSize: 11, background: 'none',
                border: '1px solid #374151', borderRadius: 4,
                padding: '2px 8px', cursor: 'pointer', color: '#9CA3AF'
              }}
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/"             element={<DashboardRouter session={session} onRoleSelect={() => {}} />} />
            <Route path="/events"       element={<EventList session={session} />} />
            <Route path="/events/new"   element={<EventPlanner storage={storage} />} />
            <Route path="/events/:id"   element={<EventPlanner storage={storage} />} />
            <Route path="/friction-log" element={<FrictionLog storage={storage} session={session} />} />
            <Route path="/orra-lite"    element={<OrraLite storage={storage} session={session} />} />
            <Route path="/plh"          element={<PlhAssessment storage={storage} session={session} />} />
            <Route path="/rhythm"       element={<RhythmBoard storage={storage} session={session} />} />
            <Route path="/health"       element={<OrgHealthDashboard storage={storage} session={session} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
