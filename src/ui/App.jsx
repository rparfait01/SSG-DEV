import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { can } from '../core/auth.js';
import storage from '../core/storage.browser.js';
import seedData from '../data/pilot-seed.js';

import DashboardRouter from './dashboards/DashboardRouter.jsx';
import EventPlanner from '../modules/event-planner/EventPlanner.jsx';
import FrictionLog from '../modules/friction-log/FrictionLog.jsx';
import OrraLite from '../modules/orra-lite/OrraLite.jsx';
import PlhAssessment from '../modules/plh-assessment/PlhAssessment.jsx';
import RhythmBoard from '../modules/rhythm-board/RhythmBoard.jsx';
import OrgHealthDashboard from '../modules/org-health/OrgHealthDashboard.jsx';

import '../ui/styles/tokens.css';

const VALID_ROLES = [
  'global_board', 'executive_director', 'regional_councillor', 'regional_director',
  'senior_director', 'chapter_president', 'chapter_staff', 'hr', 'governance'
];

const ROLE_ORG = {
  global_board:        'eo-global-001',
  executive_director:  'eo-global-001',
  regional_councillor: 'eo-apac-001',
  regional_director:   'eo-apac-001',
  senior_director:     'eo-europe-001',
  chapter_president:   'eo-japan-001',
  chapter_staff:       'eo-japan-001',
  hr:                  'eo-global-001',
  governance:          'eo-global-001'
};

function makeSession(role, org) {
  return {
    id: `local-${role}`,
    role,
    organization_id: org,
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

  // Seed localStorage on first load
  useEffect(() => {
    storage.seedFromJson(seedData).catch(console.error);
  }, []);

  // Auto-login from URL params: ?org=eo-japan-001&role=chapter_president
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const org  = params.get('org');
    const role = params.get('role');
    if (org && role && VALID_ROLES.includes(role)) {
      setSession(makeSession(role, org));
    }
  }, []);

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
    ? NAV_ITEMS.filter(n => n.always || (n.check && n.check(session.role)))
    : [{ path: '/', label: 'Dashboard', always: true }];

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
            {session && (
              <>
                <div style={{ marginTop: 4, fontSize: 11 }}>{session.role}</div>
                <div style={{ marginTop: 4, fontSize: 11, color: '#9CA3AF' }}>{session.organization_id}</div>
                <button
                  style={{ marginTop: 8, fontSize: 11, background: 'none', border: '1px solid #374151', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', color: '#9CA3AF' }}
                  onClick={() => {
                    setSession(null);
                    window.history.replaceState({}, '', window.location.pathname);
                  }}
                >
                  Switch Role
                </button>
              </>
            )}
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardRouter
                  session={session}
                  onRoleSelect={(role) => setSession(makeSession(role, ROLE_ORG[role] || 'eo-global-001'))}
                />
              }
            />
            <Route path="/events"       element={session ? <EventList session={session} /> : <p>Select a role first.</p>} />
            <Route path="/events/new"   element={<EventPlanner storage={storage} />} />
            <Route path="/events/:id"   element={<EventPlanner storage={storage} />} />
            <Route path="/friction-log" element={session ? <FrictionLog storage={storage} session={session} /> : <p>Select a role first.</p>} />
            <Route path="/orra-lite"    element={session ? <OrraLite storage={storage} session={session} /> : <p>Select a role first.</p>} />
            <Route path="/plh"          element={session ? <PlhAssessment storage={storage} session={session} /> : <p>Select a role first.</p>} />
            <Route path="/rhythm"       element={session ? <RhythmBoard storage={storage} session={session} /> : <p>Select a role first.</p>} />
            <Route path="/health"       element={session ? <OrgHealthDashboard storage={storage} session={session} /> : <p>Select a role first.</p>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
