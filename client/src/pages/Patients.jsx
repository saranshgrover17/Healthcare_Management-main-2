import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import AddPatientModal from '../components/AddPatientModal';
import EditPatientModal from '../components/EditPatientModal';
import ConfirmModal from '../components/ConfirmModal';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [q, setQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { api.get('/patients').then(r => setPatients(r.data)).catch(() => {}); }, []);

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.email} ${p.phone}`.toLowerCase().includes(q.toLowerCase())
  );

  const handleAdded = (p) => setPatients(prev => [p, ...prev]);
  const handleUpdated = (updated) => setPatients(prev => prev.map(p => p.patient_id === editTarget.patient_id ? { ...p, ...updated } : p));
  const handleDelete = async () => {
    await api.delete(`/patients/${deleteTarget.patient_id}`).catch(() => {});
    setPatients(prev => prev.filter(p => p.patient_id !== deleteTarget.patient_id));
  };

  return (
    <div style={{ padding:28 }}>
      <AddPatientModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={handleAdded} />
      <EditPatientModal open={!!editTarget} onClose={() => setEditTarget(null)} patient={editTarget} onUpdated={handleUpdated} />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} danger
        title="Delete Patient" message={`Are you sure you want to delete ${deleteTarget?.first_name} ${deleteTarget?.last_name}? This cannot be undone.`} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700 }}>Patients <span style={{ fontSize:13, fontWeight:400, color:'var(--color-text-muted)', marginLeft:6 }}>{patients.length} total</span></h1>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', padding:'7px 12px' }}>
            <Search size={14} color="#8892a4" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search patients…" style={{ background:'none', border:'none', outline:'none', fontSize:13, color:'var(--color-text)', width:200 }} />
          </div>
          <button onClick={() => setShowAdd(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'var(--color-primary)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Plus size={15} /> Add Patient
          </button>
        </div>
      </div>

      <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--color-border)', background:'var(--color-surface-2)' }}>
              {['ID','Name','DOB','Gender','Phone','Email','Actions'].map(h => (
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map(p => (
                <motion.tr key={p.patient_id}
                  initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  style={{ borderBottom:'1px solid var(--color-border)' }}>
                  <td style={td} onClick={() => navigate(`/patients/${p.patient_id}`)}>{p.patient_id}</td>
                  <td style={{ ...td, fontWeight:500, cursor:'pointer' }} onClick={() => navigate(`/patients/${p.patient_id}`)}>{p.first_name} {p.last_name}</td>
                  <td style={td}>{p.dob?.slice(0,10)}</td>
                  <td style={td}><span style={{ padding:'2px 8px', borderRadius:999, fontSize:11, background: p.gender==='M' ? 'rgba(59,130,246,0.15)' : 'rgba(167,139,250,0.15)', color: p.gender==='M' ? '#3b82f6' : '#a78bfa' }}>{p.gender==='M'?'Male':p.gender==='F'?'Female':'Other'}</span></td>
                  <td style={td}>{p.phone}</td>
                  <td style={{ ...td, color:'var(--color-text-muted)' }}>{p.email}</td>
                  <td style={td}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => setEditTarget(p)} style={iconBtn}><Pencil size={13} /></button>
                      <button onClick={() => setDeleteTarget(p)} style={{ ...iconBtn, color:'var(--color-error)' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding:40, textAlign:'center', color:'var(--color-text-muted)', fontSize:13 }}>No patients found</div>}
      </div>
    </div>
  );
}
const td = { padding:'12px 16px', fontSize:13 };
const iconBtn = { padding:'5px 7px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', cursor:'pointer', color:'var(--color-text-muted)', display:'flex', alignItems:'center' };
