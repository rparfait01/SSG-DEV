import { useState } from 'react';
import { resolveCode, CODE_PREFIX } from '../config/access-codes.js';

export default function AccessGate({ onAccess }) {
  const [suffix, setSuffix] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const full = CODE_PREFIX + suffix.trim().toUpperCase();
    const resolved = resolveCode(full);
    if (resolved) {
      localStorage.setItem('meridian_access_code', full);
      onAccess(resolved);
    } else {
      setError('Invalid access code. Contact your SSG administrator.');
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', background: '#F9FAFB'
    }}>
      <div style={{
        background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
        padding: 40, width: 360, boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#111827', marginBottom: 2 }}>Meridian</div>
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 32 }}>by Summit Strategies Group · Beta</div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#374151' }}>
            Access Code
          </label>
          <div style={{
            display: 'flex', border: '1px solid #D1D5DB', borderRadius: 6, overflow: 'hidden'
          }}>
            <span style={{
              padding: '10px 12px', background: '#F3F4F6', color: '#6B7280',
              fontFamily: 'monospace', fontSize: 15, letterSpacing: '0.08em',
              borderRight: '1px solid #D1D5DB', whiteSpace: 'nowrap', userSelect: 'none'
            }}>
              {CODE_PREFIX}
            </span>
            <input
              type="text"
              value={suffix}
              onChange={e => { setSuffix(e.target.value); setError(''); }}
              placeholder="ED-01"
              style={{
                flex: 1, padding: '10px 12px', border: 'none', outline: 'none',
                fontSize: 15, fontFamily: 'monospace', letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          {error && (
            <div style={{ color: '#DC2626', fontSize: 12, marginTop: 6 }}>{error}</div>
          )}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: 16 }}
            disabled={!suffix.trim()}
          >
            Enter
          </button>
        </form>

        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 28, textAlign: 'center' }}>
          Your access code was provided by SSG.<br />
          Each code is role-locked and cannot be shared.
        </div>
      </div>
    </div>
  );
}
