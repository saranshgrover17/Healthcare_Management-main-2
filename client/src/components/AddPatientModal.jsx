import { useState } from 'react';
import Modal from './Modal';
import FormField, { input } from './FormField';
import api from '../api';

const empty = { first_name:'', last_name:'', dob:'', gender:'M', phone:'', email:'', address:'', insurance_id:'', emergency_contact:'' };

export default function AddPatientModal({ open, onClose, onAdded }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const { data } = await api.post('/patients', form);
      onAdded({ ...form, patient_id: data.patient_id });
      setForm(empty);
      onClose();
    } catch { setErr('Failed to add patient.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Patient" width={560}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <FormField label="First Name"><input required value={form.first_name} onChange={set('first_name')} style={input} /></FormField>
        <FormField label="Last Name"><input required value={form.last_name} onChange={set('last_name')} style={input} /></FormField>
        <FormField label="Date of Birth"><input required type="date" value={form.dob} onChange={set('dob')} style={input} /></FormField>
        <FormField label="Gender">
          <select value={form.gender} onChange={set('gender')} style={input}>
            <option value="M">Male</option><option value="F">Female</option><option value="Other">Other</option>
          </select>
        </FormField>
        <FormField label="Phone"><input required value={form.phone} onChange={set('phone')} style={input} /></FormField>
        <FormField label="Email"><input type="email" value={form.email} onChange={set('email')} style={input} /></FormField>
        <FormField label="Insurance ID"><input value={form.insurance_id} onChange={set('insurance_id')} style={input} /></FormField>
        <FormField label="Emergency Contact"><input value={form.emergency_contact} onChange={set('emergency_contact')} style={input} /></FormField>
        <div style={{ gridColumn: '1/-1' }}>
          <FormField label="Address"><input value={form.address} onChange={set('address')} style={input} /></FormField>
        </div>
        {err && <p style={{ gridColumn: '1/-1', fontSize: 12, color: 'var(--color-error)' }}>{err}</p>}
        <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 18px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '8px 18px', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13, opacity: loading ? 0.7 : 1 }}>{loading ? 'Saving…' : 'Add Patient'}</button>
        </div>
      </form>
    </Modal>
  );
}
