import { useEffect, useState } from 'react';
import api from '../api';

const statusColor = {
  Paid: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  Pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  Claimed: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
};

export default function Billing() {
  const [bills, setBills] = useState([]);

  useEffect(() => { api.get('/billing').then(r => setBills(r.data)).catch(() => {}); }, []);

  const handlePay = async (id) => {
    await api.patch(`/billing/${id}/pay`);
    setBills(bills.map(b => b.bill_id === id ? { ...b, payment_status: 'Paid' } : b));
  };

  const total = bills.reduce((s, b) => s + Number(b.amount), 0);
  const pending = bills.filter(b => b.payment_status === 'Pending').reduce((s, b) => s + Number(b.amount), 0);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Billing</h1>
        <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Total billed: <strong style={{ color: 'var(--color-text)' }}>₹{total.toLocaleString()}</strong></span>
          <span style={{ color: 'var(--color-text-muted)' }}>Pending: <strong style={{ color: '#f59e0b' }}>₹{pending.toLocaleString()}</strong></span>
        </div>
      </div>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
              {['Patient', 'Date', 'Amount', 'Status', 'Action'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bills.map(b => {
              const s = statusColor[b.payment_status] || statusColor.Pending;
              return (
                <tr key={b.bill_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={td}>{b.patient_name}</td>
                  <td style={{ ...td, color: 'var(--color-text-muted)' }}>{b.bill_date?.slice(0, 10)}</td>
                  <td style={{ ...td, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>₹{Number(b.amount).toLocaleString()}</td>
                  <td style={td}>
                    <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, background: s.bg, color: s.color }}>{b.payment_status}</span>
                  </td>
                  <td style={td}>
                    {b.payment_status === 'Pending' && (
                      <button onClick={() => handlePay(b.bill_id)} style={{ padding: '4px 12px', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>Mark Paid</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {bills.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>No bills found</div>}
      </div>
    </div>
  );
}
const td = { padding: '12px 16px', fontSize: 13 };
