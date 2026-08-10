import Modal from './Modal';

export default function ConfirmModal({ open, onClose, onConfirm, title, message, danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Confirm'} width={400}>
      <p style={{ fontSize:13, color:'var(--color-text-muted)', marginBottom:24, lineHeight:1.6 }}>{message}</p>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
        <button onClick={onClose} style={{ padding:'8px 18px', background:'transparent', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', color:'var(--color-text-muted)', cursor:'pointer', fontSize:13 }}>Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }} style={{ padding:'8px 18px', background: danger ? 'var(--color-error)' : 'var(--color-primary)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:13 }}>
          {danger ? 'Delete' : 'Confirm'}
        </button>
      </div>
    </Modal>
  );
}
