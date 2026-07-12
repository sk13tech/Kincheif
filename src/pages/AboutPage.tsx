import { useAbout, useSite } from '../lib/useSettings';

const ico: React.CSSProperties = { width: 22, height: 22, fill: 'none', stroke: 'var(--icon)', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' };

export default function AboutPage() {
  const { data, loading } = useAbout();
  const site = useSite();
  const siteName = site?.name || 'Median UI';

  if (loading) return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px' }}>
      <span style={{ fontSize: '.84rem', color: 'var(--text-sec)' }}>Loading...</span>
    </div>
  );

  const author = data?.author;
  const offerings = data?.offerings ?? [];
  const team = data?.team ?? [];

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 16px' }}>

      {/* Author */}
      <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '28px 22px', marginBottom: 14, textAlign: 'center' }}>
        <div style={{ width: 76, height: 76, borderRadius: 38, background: 'var(--hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '0 auto 14px' }}>
          {author?.profileImage ? (
            <img src={author.profileImage} alt={author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <svg viewBox="0 0 24 24" style={{ ...ico, width: 32, height: 32, strokeWidth: 1, opacity: .25 }}>
              <path d="M9.16 10.87C9.06 10.86 8.94 10.86 8.83 10.87C6.45 10.79 4.56 8.84 4.56 6.44C4.56 3.99 6.54 2 9 2C11.45 2 13.44 3.99 13.44 6.44C13.43 8.84 11.54 10.79 9.16 10.87Z" />
              <path d="M4.16 14.56C1.74 16.18 1.74 18.82 4.16 20.43C6.91 22.27 11.42 22.27 14.17 20.43C16.59 18.81 16.59 16.17 14.17 14.56C11.43 12.73 6.92 12.73 4.16 14.56Z" />
            </svg>
          )}
        </div>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 3px' }}>{author?.name || siteName}</h1>
        <p style={{ fontSize: '.76rem', color: 'var(--text-sec)', margin: '0 0 14px' }}>{author?.tagline || ''}</p>
        <p style={{ fontSize: '.84rem', color: 'var(--text-sec)', lineHeight: 1.75, margin: 0, textAlign: 'left' }}>
          {author?.description || ''}
        </p>
      </div>

      {/* Offerings */}
      {offerings.length > 0 && (
        <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '22px 22px', marginBottom: 14 }}>
          <h3 style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 14px' }}>What we offer</h3>
          {offerings.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < offerings.length - 1 ? 14 : 0 }}>
              <div style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--icon)', marginTop: 7, flexShrink: 0, opacity: .25 }} />
              <div>
                <div style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-sec)', lineHeight: 1.6 }}>{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team */}
      {team.length > 0 && (
        <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '22px 22px' }}>
          <h3 style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 14px' }}>Our team</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {[...team].sort((a, b) => a.order - b.order).map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-sec)' }}>{m.initials}</span>
                </div>
                <div>
                  <div style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--text)' }}>{m.name}</div>
                  <div style={{ fontSize: '.74rem', color: 'var(--text-sec)', marginTop: 1 }}>{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
