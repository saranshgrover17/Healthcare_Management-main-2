import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, CalendarDays, Receipt, BedDouble } from 'lucide-react';
import api from '../api';

const KPI = ({ icon: Icon, label, value, color }) => (
  <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 14, alignItems: 'center' }}>
    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
      <Icon size={18} />
    </div>
    <div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{value ?? '—'}</div>
    </div>
  </div>
);

const fmtDate = (raw) => {
  if (!raw) return '';
  const d = new Date(raw);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const fmtSpecialty = (s) => s?.length > 10 ? s.slice(0, 10) + '…' : s;

export default function Dashboard() {
  const [kpis, setKpis] = useState({});
  const [trend, setTrend] = useState([]);
  const [revenue, setRevenue] = useState([]);

  useEffect(() => {
    api.get('/dashboard/kpis').then(r => setKpis(r.data)).catch(() => {});
    api.get('/dashboard/appointments-trend').then(r => {
      const clean = r.data.reverse().map(row => ({ ...row, label: fmtDate(row.date) }));
      setTrend(clean);
    }).catch(() => {});
    api.get('/dashboard/revenue-by-specialty').then(r => {
      const clean = r.data.map(row => ({ ...row, label: fmtSpecialty(row.specialty) }));
      setRevenue(clean);
    }).catch(() => {});
  }, []);

  const occupancyPct = kpis.total_rooms ? Math.round((kpis.occupied_rooms / kpis.total_rooms) * 100) : 0;

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <KPI icon={Users} label="Total Patients" value={kpis.total_patients} color="#3b82f6" />
        <KPI icon={CalendarDays} label="Today's Appts" value={kpis.todays_appointments} color="#22c55e" />
        <KPI icon={Receipt} label="Pending Bills" value={kpis.pending_bills} color="#f59e0b" />
        <KPI icon={BedDouble} label="Occupied Rooms" value={`${kpis.occupied_rooms ?? 0}/${kpis.total_rooms ?? 0}`} color="#a78bfa" />
      </div>

      {/* Occupancy bar */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', minWidth: 110 }}>Room Occupancy</span>
        <div style={{ flex: 1, height: 8, background: 'var(--color-border)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${occupancyPct}%`, height: '100%', background: occupancyPct > 80 ? '#ef4444' : '#3b82f6', borderRadius: 999, transition: 'width 0.6s ease' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, minWidth: 36, fontVariantNumeric: 'tabular-nums' }}>{occupancyPct}%</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Appointment Trend (7d)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend}>
              <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8892a4' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8892a4' }} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} labelFormatter={(l) => `Date: ${l}`} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#g)" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Revenue by Specialty</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenue}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8892a4' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8892a4' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="total_billed" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
