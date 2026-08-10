import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import Modal from '../components/Modal';
import FormField, { input } from '../components/FormField';
import api from '../api';

const wardColor = { ICU:'#ef4444', General:'#3b82f6', Emergency:'#f59e0b', Private:'#a78bfa' };

function EditRoomModal({ open, onClose, room, onUpdated }) {
  const [form, setForm] = useState({});
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open && room) {
      setForm({ is_occupied: room.is_occupied, patient_id: room.patient_id||'', ward_type: room.ward_type, floor: room.floor });
      setErr('');
      api.get('/patients').then(r => setPatients(r.data)).catch(() => {});
    }
  }, [open, room]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErr('');
    try {
      await api.patch(`/rooms/${room.room_id}`, { ...form, is_occupied: Number(form.is_occupied), patient_id: form.patient_id||null });
      onUpdated({ ...room, ...form, is_occupied: Number(form.is_occupied) });
      onClose();
    } catch(e) { setErr(e?.response?.data?.error || 'Failed to update.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Edit Room ${room?.room_number}`} width={420}>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <FormField label="Ward Type">
            <select value={form.ward_type||''} onChange={set('ward_type')} style={input}>
              {['ICU','General','Emergency','Private'].map(w => <option key={w}>{w}</option>)}
            </select>
          </FormField>
          <FormField label="Floor">
            <input type="number" min="1" value={form.floor||''} onChange={set('floor')} style={input} />
          </FormField>
          <FormField label="Status">
            <select value={Number(form.is_occupied)} onChange={e => setForm(f => ({ ...f, is_occupied: Number(e.target.value) }))} style={input}>
              <option value={0}>Available</option>
              <option value={1}>Occupied</option>
            </select>
          </FormField>
          <FormField label="Assigned Patient">
            <select value={form.patient_id||''} onChange={set('patient_id')} style={input}>
              <option value="">— None —</option>
              {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name}</option>)}
            </select>
          </FormField>
        </div>
        {err && <p style={{ fontSize:12, color:'var(--color-error)', padding:'6px 10px', background:'rgba(239,68,68,0.1)', borderRadius:'var(--radius-sm)' }}>{err}</p>}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding:'8px 18px', background:'transparent', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', color:'var(--color-text-muted)', cursor:'pointer', fontSize:13 }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding:'8px 18px', background:'var(--color-primary)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:13 }}>{loading?'Saving…':'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => { api.get('/rooms').then(r => setRooms(r.data)).catch(() => {}); }, []);

  const wards = [...new Set(rooms.map(r => r.ward_type))];
  const stats = { total: rooms.length, occupied: rooms.filter(r => r.is_occupied).length };

  return (
    <div style={{ padding:28 }}>
      <EditRoomModal open={!!editTarget} onClose={() => setEditTarget(null)} room={editTarget}
        onUpdated={updated => { setRooms(prev => prev.map(r => r.room_id === updated.room_id ? updated : r)); setEditTarget(null); }} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700 }}>Room Management</h1>
        <div style={{ display:'flex', gap:12, fontSize:13 }}>
          <span style={{ color:'var(--color-text-muted)' }}>Total: <strong>{stats.total}</strong></span>
          <span style={{ color:'#ef4444' }}>Occupied: <strong>{stats.occupied}</strong></span>
          <span style={{ color:'#22c55e' }}>Available: <strong>{stats.total - stats.occupied}</strong></span>
        </div>
      </div>

      {wards.map(ward => (
        <div key={ward} style={{ marginBottom:28 }}>
          <h2 style={{ fontSize:13, fontWeight:600, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:wardColor[ward]||'#8892a4', display:'inline-block' }} />
            {ward}
            <span style={{ fontSize:11, color:'var(--color-text-muted)', fontWeight:400 }}>
              ({rooms.filter(r => r.ward_type === ward && r.is_occupied).length}/{rooms.filter(r => r.ward_type === ward).length} occupied)
            </span>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px, 1fr))', gap:10 }}>
            {rooms.filter(r => r.ward_type === ward).map(r => (
              <div key={r.room_id} style={{ background:'var(--color-surface)', border:`1px solid ${r.is_occupied ? `${wardColor[ward]||'#8892a4'}50` : 'var(--color-border)'}`, borderRadius:'var(--radius-md)', padding:'14px 16px', position:'relative' }}>
                <button onClick={() => setEditTarget(r)} style={{ position:'absolute', top:10, right:10, padding:'3px 5px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', cursor:'pointer', color:'var(--color-text-muted)', display:'flex', alignItems:'center' }}>
                  <Pencil size={11} />
                </button>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <span style={{ fontWeight:700, fontSize:16 }}>{r.room_number}</span>
                  <span style={{ width:7, height:7, borderRadius:'50%', background: r.is_occupied?'#ef4444':'#22c55e', display:'inline-block' }} />
                </div>
                <div style={{ fontSize:11, color:'var(--color-text-muted)' }}>Floor {r.floor}</div>
                <div style={{ fontSize:11, marginTop:6, color: r.is_occupied ? 'var(--color-text)' : 'var(--color-text-faint)', fontWeight: r.is_occupied ? 500 : 400 }}>
                  {r.patient_name || (r.is_occupied ? 'Occupied' : 'Available')}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
