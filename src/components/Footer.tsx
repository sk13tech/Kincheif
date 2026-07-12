import { useSite, useAbout, useSocial } from '../lib/useSettings';

const socialIcons: Record<string, React.ReactNode> = {
  facebook: <svg viewBox="0 0 32 32" style={{ width: 18, height: 18, fill: 'currentColor', display: 'block' }}><path d="M24,3H8A5,5,0,0,0,3,8V24a5,5,0,0,0,5,5H24a5,5,0,0,0,5-5V8A5,5,0,0,0,24,3Zm3,21a3,3,0,0,1-3,3H17V18h4a1,1,0,0,0,0-2H17V14a2,2,0,0,1,2-2h2a1,1,0,0,0,0-2H19a4,4,0,0,0-4,4v2H12a1,1,0,0,0,0,2h3v9H8a3,3,0,0,1-3-3V8A3,3,0,0,1,8,5H24a3,3,0,0,1,3,3Z" /></svg>,
  instagram: <svg viewBox="0 0 32 32" style={{ width: 18, height: 18, fill: 'currentColor', display: 'block' }}><path d="M22,3H10a7,7,0,0,0-7,7V22a7,7,0,0,0,7,7H22a7,7,0,0,0,7-7V10A7,7,0,0,0,22,3Zm5,19a5,5,0,0,1-5,5H10a5,5,0,0,1-5-5V10a5,5,0,0,1,5-5H22a5,5,0,0,1,5,5Z" /><path d="M16,9.5A6.5,6.5,0,1,0,22.5,16,6.51,6.51,0,0,0,16,9.5Zm0,11A4.5,4.5,0,1,1,20.5,16,4.51,4.51,0,0,1,16,20.5Z" /><circle cx="23" cy="9" r="1" /></svg>,
  twitter: <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'currentColor', display: 'block' }}><path d="M14.095479,10.316482L22.286354,1h-1.940718l-7.115352,8.087682L7.551414,1H1l8.589488,12.231093L1,23h1.940717l7.509372-8.542861L16.448587,23H23L14.095479,10.316482z M11.436522,13.338465l-0.871624-1.218704l-6.924311-9.68815h2.981339l5.58978,7.82155l0.867949,1.218704l7.26506,10.166271h-2.981339L11.436522,13.338465z" /></svg>,
  youtube: <svg viewBox="0 0 32 32" style={{ width: 18, height: 18, fill: 'currentColor', display: 'block' }}><path d="M30,12a5.71,5.71,0,0,0-5.31-5.7C18.92,6,13.06,6,7.33,6.28,4.51,6.28,2,9,2,12a43.69,43.69,0,0,0,0,8.72,5.32,5.32,0,0,0,5.28,5.33h0q4.35.24,8.72.24t8.67-.23A5.34,5.34,0,0,0,30,20.8,31.67,31.67,0,0,0,30,12Zm-2,8.63a3.36,3.36,0,0,1-3.39,3.34,166,166,0,0,1-17.28,0A3.36,3.36,0,0,1,4,20.65a42,42,0,0,1,0-8.47A3.78,3.78,0,0,1,7.38,8.28c2.86-.13,5.74-.19,8.62-.19s5.76.06,8.62.19c1.71,0,3.33,1.84,3.33,3.79A30.11,30.11,0,0,1,28,20.61Z" /><path d="M20.79,15.51l-7.14-3.68a1,1,0,1,0-.92,1.78l5.43,2.79-4,2.07V16.4a1,1,0,0,0-2,0v3.72a1,1,0,0,0,1,1,1,1,0,0,0,.46-.11l7.14-3.72a1,1,0,0,0,.54-.89A1,1,0,0,0,20.79,15.51Z" /></svg>,
  telegram: <svg viewBox="0 0 32 32" style={{ width: 18, height: 18, fill: 'currentColor', display: 'block' }}><path d="M28.59,4.29a2.23,2.23,0,0,0-2.27-.36L3.41,13.1a1.83,1.83,0,0,0,0,3.38l1.48.61a1,1,0,1,0,.77-1.84L4.56,14.8l22.51-9a.22.22,0,0,1,.23,0,.24.24,0,0,1,.08.23L23.27,25.21a.4.4,0,0,1-.26.3.39.39,0,0,1-.39-.06l-8-6.24,7.83-7.91a1,1,0,0,0-1.22-1.56L9.75,16.54a1,1,0,1,0,1,1.72l4.83-2.85L13.23,17.8a2,2,0,0,0,.2,3.08l8,6.15a2.4,2.4,0,0,0,1.47.5,2.47,2.47,0,0,0,.83-.15,2.37,2.37,0,0,0,1.52-1.75L29.33,6.47A2.23,2.23,0,0,0,28.59,4.29Z" /></svg>,
  whatsapp: <svg viewBox="0 0 32 32" style={{ width: 18, height: 18, fill: 'currentColor', display: 'block' }}><path d="M16,3A13,13,0,0,0,4.53,22.13L3,27.74a1,1,0,0,0,.27,1A1,1,0,0,0,4,29a.84.84,0,0,0,.27,0l5.91-1.65A13,13,0,1,0,16,3Zm0,24a11,11,0,0,1-5.58-1.52,1,1,0,0,0-.51-.14,1,1,0,0,0-.27,0L6.42,26.56l1.15-4.3a1,1,0,0,0-.1-.76A11,11,0,1,1,16,27Z" /></svg>,
  linkedin: <svg viewBox="0 0 32 32" style={{ width: 18, height: 18, fill: 'currentColor', display: 'block' }}><path d="M26,3H6A3,3,0,0,0,3,6V26a3,3,0,0,0,3,3H26a3,3,0,0,0,3-3V6A3,3,0,0,0,26,3ZM27,26a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V6A1,1,0,0,1,6,5H26a1,1,0,0,1,1,1Z" /><path d="M11,14a1,1,0,0,0-1,1v7a1,1,0,0,0,2,0V15A1,1,0,0,0,11,14Z" /><circle cx="11" cy="11" r="1.5" /><path d="M20,14a4,4,0,0,0-3,1.38V15a1,1,0,0,0-2,0v7a1,1,0,0,0,2,0V19a2,2,0,0,1,4,0v3a1,1,0,0,0,2,0V18A4,4,0,0,0,20,14Z" /></svg>,
  github: <svg viewBox="0 0 32 32" style={{ width: 18, height: 18, fill: 'currentColor', display: 'block' }}><path d="M16,3a13,13,0,0,0-3.46,25.53,1,1,0,1,0,.53-1.92,11,11,0,1,1,7-.4,15.85,15.85,0,0,0-.3-3.92A6.27,6.27,0,0,0,24.68,16a6.42,6.42,0,0,0-1.05-3.87,7.09,7.09,0,0,0-.4-3.36,1,1,0,0,0-1.1-.67,8,8,0,0,0-3.37,1.28A11.35,11.35,0,0,0,16,9a13.09,13.09,0,0,0-3,.43A5.74,5.74,0,0,0,9.62,8.25a1,1,0,0,0-1,.66,7.06,7.06,0,0,0-.37,3.19A7.15,7.15,0,0,0,7.2,16a6.66,6.66,0,0,0,5,6.28,7.43,7.43,0,0,0-.15.79c-1,.06-1.58-.55-2.32-1.48a3.45,3.45,0,0,0-1.94-1.53,1,1,0,0,0-1.15.76A1,1,0,0,0,7.35,22c.16,0,.55.52.77.81a4.74,4.74,0,0,0,3.75,2.25,4.83,4.83,0,0,0,1.3-.18A13,13,0,0,0,16,3Z" /></svg>,
};

interface Props {
  onNavigate: (page: string) => void;
}

const fallbackSocials: Array<[string, { url: string; show: boolean }]> = [
  ['facebook', { url: 'https://facebook.com', show: true }],
  ['instagram', { url: 'https://instagram.com', show: true }],
  ['twitter', { url: 'https://x.com', show: true }],
  ['youtube', { url: 'https://youtube.com', show: true }],
];

export default function Footer({ onNavigate }: Props) {
  const site = useSite();
  const { data: about } = useAbout();
  const social = useSocial();

  const siteName = site?.name || 'Median UI';
  const description = about?.author?.description
    ? about.author.description.substring(0, 140) + '...'
    : 'Your go-to source for modern, responsive web templates and design systems.';

  const visibleSocials = social
    ? Object.entries(social).filter(([key, val]) => key !== 'updatedAt' && val && typeof val === 'object' && 'show' in val && val.show && val.url)
    : [];

  const socialsToRender = visibleSocials.length > 0 ? visibleSocials : fallbackSocials;

  const footLink = (label: string, page: string) => (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onNavigate(page);
        window.scrollTo(0, 0);
      }}
      style={{ color: 'var(--text-sec)', textDecoration: 'none', fontSize: '.72rem' }}
    >
      {label}
    </a>
  );

  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', marginTop: 32 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 18px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'var(--icon)', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}>
                <path d="M7.5 7.67V6.7c0-2.25 1.81-4.46 4.06-4.67a4.5 4.5 0 014.94 4.48v1.38" />
                <path d="M9 22h6c4.02 0 4.74-1.61 4.95-3.57l.75-6C20.97 9.99 20.27 8 16 8H8c-4.27 0-4.97 1.99-4.7 4.43l.75 6C4.26 20.39 4.98 22 9 22z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{siteName}</h3>
          </div>
          <p style={{ fontSize: '.76rem', color: 'var(--text-sec)', lineHeight: 1.65, margin: '0 0 14px', maxWidth: 400 }}>{description}</p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {socialsToRender.map(([key, val]) => (
              <a
                key={key}
                href={val?.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={key}
                title={key}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-sec)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                {socialIcons[key] || null}
              </a>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          {footLink('Terms', 'terms')}
          <span style={{ fontSize: '.68rem', color: 'var(--text-sec)', opacity: .5 }}>·</span>
          {footLink('Privacy', 'privacy')}
          <span style={{ fontSize: '.68rem', color: 'var(--text-sec)', opacity: .5 }}>·</span>
          {footLink('Shipping', 'shipping')}
          <span style={{ fontSize: '.68rem', color: 'var(--text-sec)', opacity: .5 }}>·</span>
          {footLink('Refund', 'refund')}
          <span style={{ fontSize: '.68rem', color: 'var(--text-sec)', opacity: .5 }}>·</span>
          {footLink('Contact', 'contact')}
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: '.7rem', color: 'var(--text-sec)' }}>© {new Date().getFullYear()} <strong style={{ fontWeight: 600, color: 'var(--text)' }}>{siteName}</strong></span>
        </div>
      </div>
    </footer>
  );
}
