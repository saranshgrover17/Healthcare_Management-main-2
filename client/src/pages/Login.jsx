import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, role: 'admin' });
      login(data);
      navigate('/');
    } catch { setErr('Invalid credentials.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 40, width: 360 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#3b82f6"/>
            <path d="M14 6v16M6 14h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="4" fill="none" stroke="white" strokeWidth="2"/>
          </svg>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Hospital Management</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Admin Portal</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            Email
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="admin@hms.com"
              style={{ padding: '9px 12px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: 13, outline: 'none' }} />
          </label>
          <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            Password
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••"
              style={{ padding: '9px 12px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: 13, outline: 'none' }} />
          </label>
          {err && <p style={{ fontSize: 12, color: 'var(--color-error)', padding: '6px 10px', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-sm)' }}>{err}</p>}
          <button type="submit" disabled={loading} style={{ padding: '10px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', marginTop: 4, fontSize: 14, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 20, textAlign: 'center' }}>
          Use your admin credentials to access the system
        </p>
      </div>
    </div>
  );
}
