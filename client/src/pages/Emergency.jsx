import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import FormField, { input } from '../components/FormField';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api';

const severityColor = { Critical:'#ef4444', High:'#f59e0b', Medium:'#3b82f6', Low:'#22c55e' };
const statusColor = { Waiting:'#f59e0b', Admitted:'#3b82f6', Stabilized:'#22c55e', Discharged:'#8892a4' };
const empty = { patient_name:'', severity:'High', description:'', assigned_room:'', assigned_doctor:'', status:'Waiting' };

function CaseModal({ open, onClose, initial, onSave, title }) {
  const [form, setForm] = useState(empty);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial, assigned_room: initial.assigned_room||'', assigned_doctor: initial.assigned_doctor||'' } : empty);
      setErr('');
      api.get('/doctors').then(r => setDoctors(r.data)).catch(() => {});
      api.get('/rooms').then(r => setRooms(r.data.filter(r => !r.is_occupied || r.room_id === initial?.assigned_room))).catch(() => {});
    }
  }, [open, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErr('');
    try {
      await onSave(form);
      onClose();
    } catch(e) { setErr(e?.response?.data?.error || 'Failed to save.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} width={500}>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <FormField label="Patient Name">
          <input required value={form.patient_name||''} onChange={set('patient_name')} placeholder="Full name (new or existing patient)" style={input} />
        </FormField>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <FormField label="Severity">
            <select value={form.severity} onChange={set('severity')} style={input}>
              {['Critical','High','Medium','Low'].map(s => <option key={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select value={form.status} onChange={set('status')} style={input}>
              {['Waiting','Admitted','Stabilized','Discharged'].map(s => <option key={s}>{s}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Description">
          <textarea value={form.description||''} onChange={set('description')} rows={2} placeholder="Symptoms / reason for visit…" style={{ ...input, resize:'vertical' }} />
        </FormField>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <FormField label="Assign Doctor">
            <select value={form.assigned_doctor||''} onChange={set('assigned_doctor')} style={input}>
              <option value="">— None —</option>
              {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.first_name} {d.last_name}</option>)}
            </select>
          </FormField>
          <FormField label="Assign Room">
            <select value={form.assigned_room||''} onChange={set('assigned_room')} style={input}>
              <option value="">— None —</option>
              {rooms.map(r => <option key={r.room_id} value={r.room_id}>{r.room_number} ({r.ward_type})</option>)}
            </select>
          </FormField>
        </div>
        {err && <p style={{ fontSize:12, color:'var(--color-error)', padding:'6px 10px', background:'rgba(239,68,68,0.1)', borderRadius:'var(--radius-sm)' }}>{err}</p>}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding:'8px 18px', background:'transparent', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', color:'var(--color-text-muted)', cursor:'pointer', fontSize:13 }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding:'8px 18px', background:'#ef4444', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:13 }}>{loading?'Saving…':'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Emergency() {
  const [cases, setCases] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => api.get('/emergency').then(r => setCases(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleAdd = async (form) => {
    await api.post('/emergency', form);
    await load();
  };

  const handleEdit = async (form) => {
    await api.patch(`/emergency/${editTarget.emergency_id}`, form);
    await load();
    setEditTarget(null);
  };

  const handleDelete = async () => {
    await api.delete(`/emergency/${deleteTarget.emergency_id}`);
    await load();
  };

  return (
    <div style={{ padding:28 }}>
      <CaseModal open={showAdd} onClose={() => setShowAdd(false)} initial={null} onSave={handleAdd} title="New Emergency Case" />
      <CaseModal open={!!editTarget} onClose={() => setEditTarget(null)} initial={editTarget} onSave={handleEdit} title="Edit Emergency Case" />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} danger
        title="Delete Case" message={`Delete emergency case for ${deleteTarget?.patient_name}?`} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700 }}>Emergency Cases
          <span style={{ fontSize:13, fontWeight:400, color:'var(--color-text-muted)', marginLeft:8 }}>{cases.length} total</span>
        </h1>
        <button onClick={() => setShowAdd(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#ef4444', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <Plus size={15} /> New Case
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {cases.map(c => (
          <div key={c.emergency_id} style={{ background:'var(--color-surface)', border:`1px solid ${severityColor[c.severity]}40`, borderRadius:'var(--radius-md)', padding:'16px 20px', display:'grid', gridTemplateColumns:'110px 1fr 1fr 1fr 120px 80px', gap:16, alignItems:'center' }}>
            <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background:`${severityColor[c.severity]}20`, color:severityColor[c.severity], textAlign:'center' }}>{c.severity}</span>
            <div>
              <div style={{ fontWeight:600, fontSize:13 }}>{c.patient_name}</div>
              <div style={{ fontSize:11, color:'var(--color-text-muted)', marginTop:2 }}>{c.description}</div>
            </div>
            <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>
              <div>Room: <span style={{ color:'var(--color-text)' }}>{c.room_number || 'Unassigned'}</span></div>
              <div>Dr: <span style={{ color:'var(--color-text)' }}>{c.doctor_name || 'Unassigned'}</span></div>
            </div>
            <div style={{ fontSize:11, color:'var(--color-text-muted)' }}>{c.arrived_at?.slice(0,16).replace('T',' ')}</div>
            <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:500, background:`${statusColor[c.status]||'#8892a4'}20`, color:statusColor[c.status]||'#8892a4', textAlign:'center' }}>{c.status}</span>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => setEditTarget(c)} style={iconBtn}><Pencil size={13} /></button>
              <button onClick={() => setDeleteTarget(c)} style={{ ...iconBtn, color:'var(--color-error)' }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        {cases.length === 0 && (
          <div style={{ padding:60, textAlign:'center', color:'var(--color-text-muted)', background:'var(--color-surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)', fontSize:13 }}>
            No active emergency cases
          </div>
        )}
      </div>
    </div>
  );
}
const iconBtn = { padding:'5px 7px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', cursor:'pointer', color:'var(--color-text-muted)', display:'flex', alignItems:'center' };
