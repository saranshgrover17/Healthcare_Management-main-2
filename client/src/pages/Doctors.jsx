import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import FormField, { input } from '../components/FormField';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api';

const empty = { first_name:'', last_name:'', specialty:'Cardiology', phone:'', email:'', is_available:1 };
const specialties = ['Cardiology','Orthopedics','Neurology','Dermatology','General','Pediatrics','Oncology','Radiology','Psychiatry','ENT'];
const specialtyColor = { Cardiology:'#ef4444', Orthopedics:'#f59e0b', Neurology:'#a78bfa', Dermatology:'#ec4899', General:'#3b82f6', Pediatrics:'#22c55e', Oncology:'#f97316', Radiology:'#06b6d4', Psychiatry:'#8b5cf6', ENT:'#14b8a6' };

function DoctorModal({ open, onClose, initial, onSave, title }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) { setForm(initial ? { ...initial } : empty); setErr(''); }
  }, [open, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      await onSave(form);
      onClose();
    } catch(err) {
      setErr(err?.response?.data?.error || 'Failed to save. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} width={520}>
      <form onSubmit={handleSubmit} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <FormField label="First Name"><input required value={form.first_name||''} onChange={set('first_name')} style={input} /></FormField>
        <FormField label="Last Name"><input required value={form.last_name||''} onChange={set('last_name')} style={input} /></FormField>
        <FormField label="Specialty">
          <select value={form.specialty||'Cardiology'} onChange={set('specialty')} style={input}>
            {specialties.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Available">
          <select value={Number(form.is_available)} onChange={e => setForm(f => ({ ...f, is_available: Number(e.target.value) }))} style={input}>
            <option value={1}>Yes</option><option value={0}>No</option>
          </select>
        </FormField>
        <FormField label="Phone"><input value={form.phone||''} onChange={set('phone')} style={input} /></FormField>
        <FormField label="Email"><input type="email" value={form.email||''} onChange={set('email')} style={input} /></FormField>
        {err && <p style={{ gridColumn:'1/-1', fontSize:12, color:'var(--color-error)', padding:'6px 10px', background:'rgba(239,68,68,0.1)', borderRadius:'var(--radius-sm)' }}>{err}</p>}
        <div style={{ gridColumn:'1/-1', display:'flex', gap:10, justifyContent:'flex-end', marginTop:6 }}>
          <button type="button" onClick={onClose} style={{ padding:'8px 18px', background:'transparent', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', color:'var(--color-text-muted)', cursor:'pointer', fontSize:13 }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding:'8px 18px', background:'var(--color-primary)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:13, opacity:loading?0.7:1 }}>{loading?'Saving…':'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { api.get('/doctors').then(r => setDoctors(r.data)).catch(() => {}); }, []);

  const handleAdd = async (form) => {
    const { data } = await api.post('/doctors', form);
    setDoctors(prev => [{ ...form, doctor_id: data.doctor_id }, ...prev]);
  };

  const handleEdit = async (form) => {
    await api.patch(`/doctors/${editTarget.doctor_id}`, form);
    setDoctors(prev => prev.map(d => d.doctor_id === editTarget.doctor_id ? { ...d, ...form } : d));
    setEditTarget(null);
  };

  const handleDelete = async () => {
    await api.delete(`/doctors/${deleteTarget.doctor_id}`).catch(() => {});
    setDoctors(prev => prev.filter(d => d.doctor_id !== deleteTarget.doctor_id));
  };

  return (
    <div style={{ padding:28 }}>
      <DoctorModal open={showAdd} onClose={() => setShowAdd(false)} initial={null} onSave={handleAdd} title="Add Doctor" />
      <DoctorModal open={!!editTarget} onClose={() => setEditTarget(null)} initial={editTarget} onSave={handleEdit} title="Edit Doctor" />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} danger
        title="Remove Doctor" message={`Remove Dr. ${deleteTarget?.first_name} ${deleteTarget?.last_name}? This cannot be undone.`} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700 }}>Doctors <span style={{ fontSize:13, fontWeight:400, color:'var(--color-text-muted)', marginLeft:6 }}>{doctors.length} total</span></h1>
        <button onClick={() => setShowAdd(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'var(--color-primary)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <Plus size={15} /> Add Doctor
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
        <AnimatePresence>
          {doctors.map(d => (
            <motion.div key={d.doctor_id}
              initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.97 }}
              style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', padding:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:`${specialtyColor[d.specialty]||'#3b82f6'}20`, display:'flex', alignItems:'center', justifyContent:'center', color: specialtyColor[d.specialty]||'#3b82f6' }}>
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>Dr. {d.first_name} {d.last_name}</div>
                    <div style={{ fontSize:11, color: specialtyColor[d.specialty]||'#3b82f6', marginTop:2 }}>{d.specialty}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:4 }}>
                  <button onClick={() => setEditTarget(d)} style={iconBtn}><Pencil size={12} /></button>
                  <button onClick={() => setDeleteTarget(d)} style={{ ...iconBtn, color:'var(--color-error)' }}><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:4 }}>
                {d.phone && <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>📞 {d.phone}</div>}
                {d.email && <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>✉ {d.email}</div>}
              </div>
              <div style={{ marginTop:12 }}>
                <span style={{ padding:'2px 8px', borderRadius:999, fontSize:11, background: d.is_available ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: d.is_available ? '#22c55e' : '#ef4444' }}>
                  {d.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
const iconBtn = { padding:'4px 6px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', cursor:'pointer', color:'var(--color-text-muted)', display:'flex', alignItems:'center' };
