import { useState } from 'react';
import { resolveCode } from '../config/access-codes.js';

export default function AccessGate({ onAccess }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const resolved = resolveCode(code);
    if (resolved) {
      localStorage.setItem('meridian_access_code', code.trim().toUpperCase());
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
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value); setError(''); }}
            placeholder="MERID-XXXX"
            style={{
              width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB',
              borderRadius: 6, fontSize: 15, boxSizing: 'border-box',
              fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase'
            }}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          {error && (
            <div style={{ color: '#DC2626', fontSize: 12, marginTop: 6 }}>{error}</div>
          )}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: 16 }}
            disabled={!code.trim()}
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
