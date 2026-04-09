import { useState } from 'react';
import { PERMISSIONS, getDashboardType } from '../../core/auth.js';
import VolunteerDashboard from './VolunteerDashboard.jsx';
import StaffDashboard from './StaffDashboard.jsx';
import HRDashboard from './HRDashboard.jsx';
import GovernanceDashboard from './GovernanceDashboard.jsx';

const ROLE_LABELS = {
  global_board:        'Global Board',
  executive_director:  'Executive Director',
  regional_councillor: 'Regional Councillor',
  regional_director:   'Regional Director',
  senior_director:     'Senior Director',
  chapter_president:   'Chapter President',
  chapter_staff:       'Chapter Staff',
  hr:                  'HR',
  governance:          'Governance'
};

export default function DashboardRouter({ session, onRoleSelect }) {
  const [selectedRole, setSelectedRole] = useState(session?.role || null);

  // Server mode: session is already set from JWT — skip selector
  if (session && !session.local_session) {
    return renderDashboard(session.role, session);
  }

  // Local mode: show role selector if no role chosen yet
  if (!selectedRole) {
    return (
      <div className="role-selector">
        <div className="role-selector__header">
          <h1>Meridian by SSG</h1>
          <p>Select your role to access your dashboard</p>
        </div>

        <div className="role-grid">
          {Object.entries(PERMISSIONS).map(([role, perms]) => (
            <button
              key={role}
              className="role-card"
              onClick={() => {
                setSelectedRole(role);
                if (onRoleSelect) onRoleSelect(role);
              }}
            >
              <div className="role-card__name">{ROLE_LABELS[role]}</div>
              <div className={`role-card__track track--${perms.track}`}>{perms.track}</div>
              <div className="role-card__tier">Tier {perms.tier || 'Lateral'}</div>
            </button>
          ))}
        </div>

        <p className="role-selector__note">
          This is the local pilot mode. Role selection is trusted. No authentication required.
        </p>
      </div>
    );
  }

  const mockSession = {
    id: `local-${selectedRole}`,
    role: selectedRole,
    organization_id: 'eo-pilot-001',
    track: PERMISSIONS[selectedRole].track,
    permissions: PERMISSIONS[selectedRole],
    local_session: true
  };

  return (
    <div>
      <div className="session-bar">
        <span className="session-role">{ROLE_LABELS[selectedRole]}</span>
        <button className="btn-ghost" onClick={() => setSelectedRole(null)}>Switch Role</button>
      </div>
      {renderDashboard(selectedRole, mockSession)}
    </div>
  );
}

function renderDashboard(role, session) {
  if (role === 'hr') return <HRDashboard session={session} />;
  if (role === 'governance') return <GovernanceDashboard session={session} />;
  if (getDashboardType(role) === 'volunteer') return <VolunteerDashboard session={session} />;
  return <StaffDashboard session={session} />;
}
