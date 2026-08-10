import { useState, useEffect } from 'react';
import Modal from './Modal';
import FormField, { input } from './FormField';
import api from '../api';

const empty = { patient_id:'', doctor_id:'', appointment_date:'', notes:'' };

export default function BookAppointmentModal({ open, onClose, onAdded }) {
  const [form, setForm] = useState(empty);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [avail, setAvail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!open) return;
    api.get('/patients').then(r => setPatients(r.data)).catch(() => {});
    api.get('/doctors').then(r => setDoctors(r.data)).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!form.doctor_id || !form.appointment_date) { setAvail(null); return; }
    api.get('/doctors/check-availability', { params: { doctor_id: form.doctor_id, appt_time: form.appointment_date } })
      .then(r => setAvail(r.data.available)).catch(() => setAvail(null));
  }, [form.doctor_id, form.appointment_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const { data } = await api.post('/appointments', form);
      onAdded && onAdded(data);
      setForm(empty); setAvail(null);
      onClose();
    } catch { setErr('Failed to book appointment.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Book Appointment" width={500}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label="Patient">
          <select required value={form.patient_id} onChange={set('patient_id')} style={input}>
            <option value="">Select patient…</option>
            {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name}</option>)}
          </select>
        </FormField>
        <FormField label="Doctor">
          <select required value={form.doctor_id} onChange={set('doctor_id')} style={input}>
            <option value="">Select doctor…</option>
            {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.first_name} {d.last_name} — {d.specialty}</option>)}
          </select>
        </FormField>
        <FormField label="Date & Time">
          <input required type="datetime-local" value={form.appointment_date} onChange={set('appointment_date')} style={input} />
        </FormField>
        {avail !== null && (
          <div style={{ fontSize: 12, padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: avail ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: avail ? '#22c55e' : '#ef4444' }}>
            {avail ? '✓ Doctor is available at this time' : '✗ Doctor has a conflict at this time'}
          </div>
        )}
        <FormField label="Notes (optional)">
          <input value={form.notes} onChange={set('notes')} placeholder="Reason for visit…" style={input} />
        </FormField>
        {err && <p style={{ fontSize: 12, color: 'var(--color-error)' }}>{err}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 18px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '8px 18px', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13, opacity: loading ? 0.7 : 1 }}>{loading ? 'Booking…' : 'Book Appointment'}</button>
        </div>
      </form>
    </Modal>
  );
}
