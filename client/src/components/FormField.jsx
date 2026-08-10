export default function FormField({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: 'var(--color-text-muted)' }}>
      {label}
      {children}
    </label>
  );
}
export const input = { padding: '8px 10px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: 13, outline: 'none', width: '100%' };
