interface Props {
  isOpen: boolean;
  checked: boolean;
  error: string;
  onCheckedChange: (value: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
  onNavigate: (page: string) => void;
}

export default function ConsentModal({ isOpen, checked, error, onCheckedChange, onClose, onConfirm, onNavigate }: Props) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 140,
        background: 'rgba(0,0,0,.28)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card-gpu"
        style={{
          width: '100%',
          maxWidth: 380,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 18,
          boxShadow: '0 14px 30px rgba(0,0,0,.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Before you continue</div>
        <div style={{ fontSize: '.76rem', color: 'var(--text-sec)', lineHeight: 1.6, marginBottom: 12 }}>
          Please review and accept our Terms of use and Privacy policy before signing in with Google.
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', marginBottom: 10 }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            style={{ marginTop: 2, width: 14, height: 14, accentColor: 'var(--text)' }}
          />
          <span style={{ fontSize: '.72rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
            I agree to the{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                onNavigate('terms');
              }}
              style={{ color: 'var(--text)', textDecoration: 'underline' }}
            >
              Terms of use
            </a>
            {' '}and{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                onNavigate('privacy');
              }}
              style={{ color: 'var(--text)', textDecoration: 'underline' }}
            >
              Privacy policy
            </a>
          </span>
        </label>

        {error && <div style={{ fontSize: '.7rem', color: '#e74c3c', marginBottom: 10 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', fontSize: '.74rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: '.74rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
