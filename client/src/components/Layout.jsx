import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CalendarDays, Receipt, Package, Siren, BedDouble, LogOut } from 'lucide-react';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/billing', label: 'Billing', icon: Receipt },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/emergency', label: 'Emergency', icon: Siren },
  { to: '/rooms', label: 'Rooms', icon: BedDouble },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', height: '100dvh', overflow: 'hidden' }}>
      {/* Sidebar — dark navy like FINEbank */}
      <aside style={{
        background: '#1a1d2e',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
      }}>
        <div style={{ padding: '0 8px 28px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#2db89e"/>
              <path d="M16 7v18M7 16h18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="16" cy="16" r="5" fill="none" stroke="white" strokeWidth="2"/>
            </svg>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', letterSpacing: '-0.01em' }}>HMS</div>
              <div style={{ fontSize: 10, color: '#4b5563' }}>Hospital Management</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: 24 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#2db89e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {(user?.name || user?.email || 'A')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>Administrator</div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {nav.map(({ to, label, icon: Icon, exact }) => (
            <NavLink key={to} to={to} end={exact} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 14px', borderRadius: 10,
              textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 600 : 500,
              color: isActive ? '#ffffff' : '#6b7280',
              background: isActive ? '#2db89e' : 'transparent',
              transition: 'all 160ms ease',
            })}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '9px 14px', borderRadius: 10, border: 'none',
          background: 'transparent', color: '#6b7280',
          fontSize: 13, cursor: 'pointer', width: '100%',
        }}>
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Content area — light */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 56, background: '#ffffff',
          borderBottom: '1px solid #e4e7ec',
          display: 'flex', alignItems: 'center',
          padding: '0 28px', justifyContent: 'space-between',
          flexShrink: 0, boxShadow: '0 1px 3px rgba(16,24,40,0.05)'
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
            Welcome back, Admin
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <main style={{ overflow: 'auto', background: 'var(--color-bg)', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
