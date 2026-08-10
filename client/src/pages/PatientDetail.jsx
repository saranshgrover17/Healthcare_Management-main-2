import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Modal from '../components/Modal';
import FormField, { input } from '../components/FormField';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api';

const badge = (label, color) => (
  <span style={{ padding:'2px 8px', borderRadius:999, fontSize:11, background:`${color}20`, color }}>{label}</span>
);

function AddEHRModal({ open, onClose, patientId, onAdded }) {
  const [form, setForm] = useState({ diagnosis:'', treatment:'', allergies:'', medical_history:'', record_date: new Date().toISOString().slice(0,10) });
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) { setErr(''); api.get('/doctors').then(r => { setDoctors(r.data); if (r.data[0]) setDoctorId(r.data[0].doctor_id); }).catch(() => {}); }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErr('');
    try {
      const { data } = await api.post('/ehr', { patient_id: patientId, doctor_id: doctorId, ...form });
      const doc = doctors.find(d => d.doctor_id == doctorId);
      onAdded({ ...form, record_id: data.record_id, doctor_name: `${doc?.first_name} ${doc?.last_name}`, specialty: doc?.specialty });
      setForm({ diagnosis:'', treatment:'', allergies:'', medical_history:'', record_date: new Date().toISOString().slice(0,10) });
      onClose();
    } catch(e) { setErr(e?.response?.data?.error || 'Failed to save.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Medical Record" width={500}>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <FormField label="Doctor">
          <select value={doctorId} onChange={e => setDoctorId(e.target.value)} style={input}>
            {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.first_name} {d.last_name} — {d.specialty}</option>)}
          </select>
        </FormField>
        <FormField label="Date"><input required type="date" value={form.record_date} onChange={set('record_date')} style={input} /></FormField>
        <FormField label="Diagnosis"><input required value={form.diagnosis} onChange={set('diagnosis')} placeholder="e.g. Hypertension" style={input} /></FormField>
        <FormField label="Treatment"><input value={form.treatment} onChange={set('treatment')} placeholder="e.g. Amlodipine 5mg" style={input} /></FormField>
        <FormField label="Allergies"><input value={form.allergies} onChange={set('allergies')} placeholder="e.g. Penicillin" style={input} /></FormField>
        <FormField label="Medical History"><textarea value={form.medical_history} onChange={set('medical_history')} rows={2} placeholder="Relevant history…" style={{ ...input, resize:'vertical' }} /></FormField>
        {err && <p style={{ fontSize:12, color:'var(--color-error)', padding:'6px 10px', background:'rgba(239,68,68,0.1)', borderRadius:'var(--radius-sm)' }}>{err}</p>}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
          <button type="submit" disabled={loading} style={saveBtn}>{loading?'Saving…':'Add Record'}</button>
        </div>
      </form>
    </Modal>
  );
}

function AddPrescriptionModal({ open, onClose, patientId, onAdded }) {
  const [medications, setMedications] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ medication_id:'', doctor_id:'', dosage_instructions:'', prescribed_date: new Date().toISOString().slice(0,10), refill_count:0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) {
      setErr('');
      api.get('/doctors').then(r => { setDoctors(r.data); if (r.data[0]) setForm(f => ({ ...f, doctor_id: r.data[0].doctor_id })); }).catch(() => {});
      api.get('/medications').then(r => { setMedications(r.data); if (r.data[0]) setForm(f => ({ ...f, medication_id: r.data[0].medication_id })); }).catch(() => {});
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErr('');
    try {
      const { data } = await api.post('/prescriptions', { patient_id: patientId, ...form });
      const med = medications.find(m => m.medication_id == form.medication_id);
      const doc = doctors.find(d => d.doctor_id == form.doctor_id);
      onAdded({ ...form, prescription_id: data.prescription_id, medication_name: med?.name, doctor_name: `${doc?.first_name} ${doc?.last_name}` });
      onClose();
    } catch(e) { setErr(e?.response?.data?.error || 'Failed to save.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Prescription" width={500}>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <FormField label="Doctor">
          <select value={form.doctor_id} onChange={set('doctor_id')} style={input}>
            {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.first_name} {d.last_name}</option>)}
          </select>
        </FormField>
        <FormField label="Medication">
          <select value={form.medication_id} onChange={set('medication_id')} style={input}>
            {medications.map(m => <option key={m.medication_id} value={m.medication_id}>{m.name} ({m.dosage_form})</option>)}
          </select>
        </FormField>
        <FormField label="Dosage Instructions"><input required value={form.dosage_instructions} onChange={set('dosage_instructions')} placeholder="e.g. 1 tablet twice daily" style={input} /></FormField>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <FormField label="Date"><input required type="date" value={form.prescribed_date} onChange={set('prescribed_date')} style={input} /></FormField>
          <FormField label="Refills"><input type="number" min="0" value={form.refill_count} onChange={set('refill_count')} style={input} /></FormField>
        </div>
        {err && <p style={{ fontSize:12, color:'var(--color-error)', padding:'6px 10px', background:'rgba(239,68,68,0.1)', borderRadius:'var(--radius-sm)' }}>{err}</p>}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
          <button type="submit" disabled={loading} style={saveBtn}>{loading?'Saving…':'Add Prescription'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [ehr, setEhr] = useState([]);
  const [tab, setTab] = useState('overview');
  const [showAddEHR, setShowAddEHR] = useState(false);
  const [showAddRx, setShowAddRx] = useState(false);
  const [deleteEHR, setDeleteEHR] = useState(null);
  const [deleteRx, setDeleteRx] = useState(null);

  useEffect(() => {
    api.get(`/patients/${id}`).then(r => setPatient(r.data)).catch(() => {});
    api.get(`/patients/${id}/timeline`).then(r => setTimeline(r.data)).catch(() => {});
    api.get(`/prescriptions/patient/${id}`).then(r => setPrescriptions(r.data)).catch(() => {});
    api.get(`/ehr/patient/${id}`).then(r => setEhr(r.data)).catch(() => {});
  }, [id]);

  if (!patient) return <div style={{ padding:40, color:'var(--color-text-muted)' }}>Loading…</div>;

  return (
    <div style={{ padding:28 }}>
      <AddEHRModal open={showAddEHR} onClose={() => setShowAddEHR(false)} patientId={id} onAdded={r => setEhr(prev => [r, ...prev])} />
      <AddPrescriptionModal open={showAddRx} onClose={() => setShowAddRx(false)} patientId={id} onAdded={r => setPrescriptions(prev => [r, ...prev])} />
      <ConfirmModal open={!!deleteEHR} onClose={() => setDeleteEHR(null)} danger title="Delete Record"
        message="Delete this medical record permanently?"
        onConfirm={async () => { await api.delete(`/ehr/${deleteEHR.record_id}`).catch(() => {}); setEhr(prev => prev.filter(e => e.record_id !== deleteEHR.record_id)); setDeleteEHR(null); }} />
      <ConfirmModal open={!!deleteRx} onClose={() => setDeleteRx(null)} danger title="Delete Prescription"
        message="Delete this prescription permanently?"
        onConfirm={async () => { await api.delete(`/prescriptions/${deleteRx.prescription_id}`).catch(() => {}); setPrescriptions(prev => prev.filter(p => p.prescription_id !== deleteRx.prescription_id)); setDeleteRx(null); }} />

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={() => navigate('/patients')} style={{ background:'none', border:'none', color:'var(--color-text-muted)', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:13 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700 }}>{patient.first_name} {patient.last_name}</h1>
          <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>Patient #{id} · {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'} · DOB: {patient.dob?.slice(0,10)}</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid var(--color-border)' }}>
        {['overview','records','prescriptions','timeline'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'8px 16px', background:'none', border:'none', borderBottom: tab===t?'2px solid var(--color-primary)':'2px solid transparent', color: tab===t?'var(--color-primary)':'var(--color-text-muted)', fontSize:13, fontWeight: tab===t?600:400, cursor:'pointer', textTransform:'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div style={card}>
            <h2 style={cardTitle}>Contact Info</h2>
            {[['Phone',patient.phone],['Email',patient.email],['Address',patient.address],['Insurance',patient.insurance_id],['Emergency',patient.emergency_contact]].map(([k,v]) => (
              <div key={k} style={{ display:'flex', gap:8, marginBottom:8, fontSize:13 }}>
                <span style={{ color:'var(--color-text-muted)', minWidth:80 }}>{k}</span>
                <span>{v||'—'}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <h2 style={cardTitle}>Quick Stats</h2>
            {[['Medical Records',ehr.length],['Prescriptions',prescriptions.length],['Timeline Events',timeline.length]].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:13 }}>
                <span style={{ color:'var(--color-text-muted)' }}>{k}</span>
                <span style={{ fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'records' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontSize:15, fontWeight:600 }}>Medical Records ({ehr.length})</h2>
            <button onClick={() => setShowAddEHR(true)} style={addBtn}><Plus size={13} /> Add Record</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {ehr.map(e => (
              <div key={e.record_id} style={{ ...card, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:6 }}>
                    <span style={{ fontWeight:600, fontSize:14 }}>{e.diagnosis}</span>
                    <span style={{ fontSize:11, color:'var(--color-text-muted)' }}>{e.record_date?.slice(0,10)}</span>
                  </div>
                  {e.treatment && <div style={{ fontSize:13, color:'var(--color-text-muted)', marginBottom:4 }}>Treatment: {e.treatment}</div>}
                  {e.allergies && <div style={{ fontSize:12, color:'var(--color-text-muted)', marginBottom:4 }}>Allergies: {e.allergies}</div>}
                  {e.medical_history && <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>{e.medical_history}</div>}
                  <div style={{ fontSize:11, color:'var(--color-text-faint)', marginTop:8 }}>Dr. {e.doctor_name} · {e.specialty}</div>
                </div>
                <button onClick={() => setDeleteEHR(e)} style={{ ...iconBtn, color:'var(--color-error)', marginLeft:12 }}><Trash2 size={13} /></button>
              </div>
            ))}
            {ehr.length === 0 && <div style={{ padding:40, textAlign:'center', color:'var(--color-text-muted)', fontSize:13 }}>No medical records yet</div>}
          </div>
        </div>
      )}

      {tab === 'prescriptions' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontSize:15, fontWeight:600 }}>Prescriptions ({prescriptions.length})</h2>
            <button onClick={() => setShowAddRx(true)} style={addBtn}><Plus size={13} /> Add Prescription</button>
          </div>
          <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--color-border)', background:'var(--color-surface-2)' }}>
                  {['Medication','Dosage','Doctor','Date','Refills',''].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prescriptions.map(p => (
                  <tr key={p.prescription_id} style={{ borderBottom:'1px solid var(--color-border)' }}>
                    <td style={{ ...td, fontWeight:500 }}>{p.medication_name}</td>
                    <td style={{ ...td, color:'var(--color-text-muted)' }}>{p.dosage_instructions}</td>
                    <td style={td}>Dr. {p.doctor_name}</td>
                    <td style={td}>{p.prescribed_date?.slice(0,10)}</td>
                    <td style={td}>{p.refill_count}</td>
                    <td style={td}><button onClick={() => setDeleteRx(p)} style={{ ...iconBtn, color:'var(--color-error)' }}><Trash2 size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {prescriptions.length === 0 && <div style={{ padding:40, textAlign:'center', color:'var(--color-text-muted)', fontSize:13 }}>No prescriptions yet</div>}
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div style={{ maxWidth:600 }}>
          {timeline.map((t,i) => {
            const color = { Appointment:'#3b82f6', Diagnosis:'#22c55e', 'Lab Test':'#f59e0b', Bill:'#a78bfa' }[t.event_type] || '#8892a4';
            return (
              <div key={i} style={{ display:'flex', gap:14, marginBottom:16 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:color, flexShrink:0, marginTop:3 }} />
                  {i < timeline.length-1 && <div style={{ width:2, flex:1, background:'var(--color-border)', marginTop:4 }} />}
                </div>
                <div style={{ ...card, flex:1, padding:'12px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    {badge(t.event_type, color)}
                    <span style={{ fontSize:11, color:'var(--color-text-muted)' }}>{t.event_date?.slice(0,10)}</span>
                  </div>
                  <div style={{ fontSize:12, color:'var(--color-text-muted)', marginTop:4 }}>{t.detail}</div>
                </div>
              </div>
            );
          })}
          {timeline.length === 0 && <div style={{ padding:40, textAlign:'center', color:'var(--color-text-muted)', fontSize:13 }}>No events</div>}
        </div>
      )}
    </div>
  );
}

const card = { background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', padding:20 };
const cardTitle = { fontSize:13, fontWeight:600, marginBottom:14 };
const td = { padding:'12px 16px', fontSize:13 };
const iconBtn = { padding:'5px 7px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', cursor:'pointer', color:'var(--color-text-muted)', display:'flex', alignItems:'center' };
const cancelBtn = { padding:'8px 18px', background:'transparent', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', color:'var(--color-text-muted)', cursor:'pointer', fontSize:13 };
const saveBtn = { padding:'8px 18px', background:'var(--color-primary)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:13 };
const addBtn = { display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'var(--color-primary)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' };
