import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import FormField, { input } from '../components/FormField';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api';

const empty = { item_name:'', category:'Medicine', quantity:0, min_threshold:10, unit:'pcs' };
const categories = ['Medicine','Equipment','PPE','Consumable','Surgical'];

function ItemModal({ open, onClose, initial, onSave, title }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) { setForm(initial ? { ...initial } : empty); setErr(''); }
  }, [open, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErr('');
    try {
      await onSave(form);
      onClose();
    } catch(err) {
      setErr(err?.response?.data?.error || 'Failed to save.');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} width={440}>
      <form onSubmit={handleSubmit} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div style={{ gridColumn:'1/-1' }}><FormField label="Item Name"><input required value={form.item_name||''} onChange={set('item_name')} style={input} /></FormField></div>
        <FormField label="Category">
          <select value={form.category||'Medicine'} onChange={set('category')} style={input}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Unit"><input value={form.unit||''} onChange={set('unit')} style={input} /></FormField>
        <FormField label="Quantity"><input required type="number" min="0" value={form.quantity} onChange={set('quantity')} style={input} /></FormField>
        <FormField label="Min Threshold"><input required type="number" min="0" value={form.min_threshold} onChange={set('min_threshold')} style={input} /></FormField>
        {err && <p style={{ gridColumn:'1/-1', fontSize:12, color:'var(--color-error)', padding:'6px 10px', background:'rgba(239,68,68,0.1)', borderRadius:'var(--radius-sm)' }}>{err}</p>}
        <div style={{ gridColumn:'1/-1', display:'flex', gap:10, justifyContent:'flex-end', marginTop:6 }}>
          <button type="button" onClick={onClose} style={{ padding:'8px 18px', background:'transparent', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', color:'var(--color-text-muted)', cursor:'pointer', fontSize:13 }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding:'8px 18px', background:'var(--color-primary)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:13 }}>{loading?'Saving…':'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { api.get('/inventory').then(r => setItems(r.data)).catch(() => {}); }, []);

  const display = tab === 'low' ? items.filter(i => i.quantity < i.min_threshold) : items;

  const handleAdd = async (form) => {
    const { data } = await api.post('/inventory', form);
    setItems(prev => [...prev, { ...form, item_id: data.item_id }]);
  };

  const handleEdit = async (form) => {
    await api.patch(`/inventory/${editTarget.item_id}`, form);
    setItems(prev => prev.map(i => i.item_id === editTarget.item_id ? { ...i, ...form } : i));
    setEditTarget(null);
  };

  const handleDelete = async () => {
    await api.delete(`/inventory/${deleteTarget.item_id}`).catch(() => {});
    setItems(prev => prev.filter(i => i.item_id !== deleteTarget.item_id));
  };

  return (
    <div style={{ padding:28 }}>
      <ItemModal open={showAdd} onClose={() => setShowAdd(false)} initial={null} onSave={handleAdd} title="Add Inventory Item" />
      <ItemModal open={!!editTarget} onClose={() => setEditTarget(null)} initial={editTarget} onSave={handleEdit} title="Edit Item" />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} danger
        title="Delete Item" message={`Delete "${deleteTarget?.item_name}"? This cannot be undone.`} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700 }}>Inventory</h1>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ display:'flex', gap:4, background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', padding:3 }}>
            {['all','low'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding:'5px 14px', borderRadius:'var(--radius-sm)', border:'none', cursor:'pointer', fontSize:12, fontWeight:500, background: tab===t?'var(--color-primary)':'transparent', color: tab===t?'#fff':'var(--color-text-muted)', transition:'var(--transition)' }}>
                {t==='all'?'All Items':'⚠ Low Stock'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'var(--color-primary)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Plus size={15} /> Add Item
          </button>
        </div>
      </div>

      <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--color-border)', background:'var(--color-surface-2)' }}>
              {['Item','Category','Qty','Min Threshold','Unit','Status','Actions'].map(h => (
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {display.map(i => {
              const low = i.quantity < i.min_threshold;
              return (
                <tr key={i.item_id} style={{ borderBottom:'1px solid var(--color-border)' }}>
                  <td style={{ ...td, fontWeight:500 }}>{i.item_name}</td>
                  <td style={{ ...td, color:'var(--color-text-muted)' }}>{i.category}</td>
                  <td style={{ ...td, fontVariantNumeric:'tabular-nums', color: low?'#ef4444':'var(--color-text)', fontWeight: low?700:400 }}>
                    {low && <AlertTriangle size={12} style={{ marginRight:4, verticalAlign:'middle' }} />}{i.quantity}
                  </td>
                  <td style={td}>{i.min_threshold}</td>
                  <td style={{ ...td, color:'var(--color-text-muted)' }}>{i.unit}</td>
                  <td style={td}><span style={{ padding:'2px 8px', borderRadius:999, fontSize:11, background: low?'rgba(239,68,68,0.15)':'rgba(34,197,94,0.15)', color: low?'#ef4444':'#22c55e' }}>{low?'Low Stock':'OK'}</span></td>
                  <td style={td}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => setEditTarget(i)} style={iconBtn}><Pencil size={13} /></button>
                      <button onClick={() => setDeleteTarget(i)} style={{ ...iconBtn, color:'var(--color-error)' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const td = { padding:'12px 16px', fontSize:13 };
const iconBtn = { padding:'5px 7px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', cursor:'pointer', color:'var(--color-text-muted)', display:'flex', alignItems:'center' };
