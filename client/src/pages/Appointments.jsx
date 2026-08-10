import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import FormField, { input } from '../components/FormField';
import ConfirmModal from '../components/ConfirmModal';
import BookAppointmentModal from '../components/BookAppointmentModal';
import api from '../api';

const statusColor = { Scheduled:'#3b82f6', Completed:'#22c55e', Cancelled:'#ef4444', 'No-Show':'#f59e0b' };

function EditAppointmentModal({ open, onClose, appt, onUpdated }) {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open && appt) {
      setStatus(appt.status || 'Scheduled');
      setNotes(appt.notes || '');
      setDate(appt.appointment_date?.slice(0,16) || '');
      setErr('');
    }
  }, [open, appt]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErr('');
    try {
      await api.patch(`/appointments/${appt.appointment_id}`, { status, notes, appointment_date: date });
      onUpdated({ ...appt, status, notes, appointment_date: date });
      onClose();
    } catch(e) { setErr(e?.response?.data?.error || 'Failed to update.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Appointment" width={440}>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <FormField label="Date & Time">
          <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} style={input} />
        </FormField>
        <FormField label="Status">
          <select value={status} onChange={e => setStatus(e.target.value)} style={input}>
            {['Scheduled','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Notes">
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes…" style={input} />
        </FormField>
        {err && <p style={{ fontSize:12, color:'var(--color-error)' }}>{err}</p>}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding:'8px 18px', background:'transparent', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', color:'var(--color-text-muted)', cursor:'pointer', fontSize:13 }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding:'8px 18px', background:'var(--color-primary)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:13 }}>{loading?'Saving…':'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Appointments() {
  const [appts, setAppts] = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => { api.get('/appointments').then(r => setAppts(r.data)).catch(() => {}); }, []);

  const statuses = ['All','Scheduled','Completed','Cancelled'];
  const filtered = filter === 'All' ? appts : appts.filter(a => a.status === filter);

  const handleUpdated = (updated) => setAppts(prev => prev.map(a => a.appointment_id === updated.appointment_id ? updated : a));
  const handleDelete = async () => {
    await api.delete(`/appointments/${deleteTarget.appointment_id}`).catch(() => {});
    setAppts(prev => prev.filter(a => a.appointment_id !== deleteTarget.appointment_id));
  };

  return (
    <div style={{ padding:28 }}>
      <BookAppointmentModal open={showBook} onClose={() => setShowBook(false)} onAdded={() => api.get('/appointments').then(r => setAppts(r.data))} />
      <EditAppointmentModal open={!!editTarget} onClose={() => setEditTarget(null)} appt={editTarget} onUpdated={handleUpdated} />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} danger
        title="Cancel Appointment" message={`Delete appointment for ${deleteTarget?.patient_name}? This cannot be undone.`} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:700 }}>Appointments <span style={{ fontSize:13, fontWeight:400, color:'var(--color-text-muted)', marginLeft:6 }}>{appts.length} total</span></h1>
        <button onClick={() => setShowBook(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'var(--color-primary)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <Plus size={15} /> Book Appointment
        </button>
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:16 }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding:'5px 12px', borderRadius:'var(--radius-sm)', border:'none', cursor:'pointer', fontSize:12, fontWeight:500, background: filter===s?'var(--color-primary)':'var(--color-surface)', color: filter===s?'#fff':'var(--color-text-muted)', transition:'all 160ms ease' }}>
            {s} {s!=='All' && <span style={{ opacity:0.7 }}>({appts.filter(a => a.status===s).length})</span>}
          </button>
        ))}
      </div>

      <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--color-border)', background:'var(--color-surface-2)' }}>
              {['Patient','Doctor','Specialty','Date & Time','Status','Notes','Actions'].map(h => (
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map(a => (
                <motion.tr key={a.appointment_id}
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  style={{ borderBottom:'1px solid var(--color-border)' }}>
                  <td style={td}>{a.patient_name}</td>
                  <td style={td}>Dr. {a.doctor_name}</td>
                  <td style={{ ...td, color:'var(--color-text-muted)' }}>{a.specialty}</td>
                  <td style={td}>{a.appointment_date?.slice(0,16).replace('T',' ')}</td>
                  <td style={td}><span style={{ padding:'2px 8px', borderRadius:999, fontSize:11, background:`${statusColor[a.status]||'#8892a4'}20`, color:statusColor[a.status]||'#8892a4' }}>{a.status}</span></td>
                  <td style={{ ...td, color:'var(--color-text-muted)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.notes||'—'}</td>
                  <td style={td}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => setEditTarget(a)} style={iconBtn}><Pencil size={13} /></button>
                      <button onClick={() => setDeleteTarget(a)} style={{ ...iconBtn, color:'var(--color-error)' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding:40, textAlign:'center', color:'var(--color-text-muted)', fontSize:13 }}>No appointments found</div>}
      </div>
    </div>
  );
}
const td = { padding:'12px 16px', fontSize:13 };
const iconBtn = { padding:'5px 7px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', cursor:'pointer', color:'var(--color-text-muted)', display:'flex', alignItems:'center' };
