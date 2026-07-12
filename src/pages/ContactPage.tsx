import { useContact } from '../lib/useSettings';

const ico: React.CSSProperties = { width: 22, height: 22, fill: 'none', stroke: 'var(--icon)', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

export default function ContactPage() {
  const { data, loading } = useContact();

  if (loading) return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
      <span style={{ fontSize: '.84rem', color: 'var(--text-sec)' }}>Loading...</span>
    </div>
  );

  const email = data?.email || '';
  const phone = data?.phone || '';
  const address = data?.address || '';
  const hours = data?.businessHours;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 16px' }}>

      {/* Header card */}
      <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '32px 24px', marginBottom: 14, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--hover)', border: '2px solid var(--border)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" style={{ ...ico, width: 34, height: 34, strokeWidth: 1, opacity: .2 }}>
            <path d="M12 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V11.5" />
            <path d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9" />
          </svg>
        </div>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Contact Us</h1>
        <p style={{ fontSize: '.84rem', color: 'var(--text-sec)', lineHeight: 1.7, margin: 0, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
          Have a question, feedback, or collaboration idea? We'd love to hear from you. 
          Reach out through any of the channels listed below.
        </p>
      </div>

      {/* Contact details */}
      <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '24px 22px', marginBottom: 14 }}>
        <h3 style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>Get in touch</h3>

        {[
          {
            icon: <svg viewBox="0 0 24 24" style={ico}><path d="M12 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V11.5" /><path d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9" /></svg>,
            title: 'Email',
            value: email,
          },
          {
            icon: <svg viewBox="0 0 24 24" style={ico}><path d="M12 13.43a3.12 3.12 0 100-6.24 3.12 3.12 0 000 6.24z" /><path d="M3.62 8.49c1.97-8.66 14.8-8.65 16.76.01 1.15 5.08-2.01 9.38-4.78 12.04a5.193 5.193 0 01-7.21 0c-2.76-2.66-5.92-6.97-4.77-12.05z" /></svg>,
            title: 'Address',
            value: address,
          },
          {
            icon: <svg viewBox="0 0 24 24" style={ico}><path d="M21.97 18.33c0 .36-.08.73-.25 1.09-.17.36-.39.7-.68 1.02-.49.54-1.03.93-1.64 1.18-.6.25-1.25.38-1.95.38-1.02 0-2.11-.24-3.26-.73s-2.3-1.15-3.44-1.98a28.75 28.75 0 01-3.28-2.8 28.414 28.414 0 01-2.79-3.27c-.82-1.14-1.48-2.28-1.96-3.41C2.24 8.67 2 7.58 2 6.54c0-.68.12-1.33.36-1.93.24-.61.62-1.17 1.15-1.67C4.15 2.31 4.85 2 5.59 2c.28 0 .56.06.81.18.26.12.49.3.67.56l2.32 3.27c.18.25.31.48.4.7.09.21.14.42.14.61 0 .24-.07.48-.21.71-.13.23-.32.47-.56.71l-.76.79c-.11.11-.16.24-.16.4 0 .08.01.15.04.23.03.08.07.14.09.2.18.33.49.76.93 1.28.45.52.93 1.05 1.45 1.58.54.53 1.06 1.02 1.59 1.47.52.44.95.74 1.29.92.05.02.11.05.18.08.08.03.16.04.25.04.17 0 .3-.06.41-.17l.76-.75c.25-.25.49-.44.72-.56.23-.14.46-.21.71-.21.19 0 .39.04.61.13.22.09.45.22.7.39l3.31 2.35c.26.18.44.39.55.64.1.25.16.5.16.78z" /></svg>,
            title: 'Phone',
            value: phone,
          },
        ].filter(item => item.value).map((item, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: i < arr.length - 1 ? 16 : 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: .7 }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--text)' }}>{item.title}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-sec)', marginTop: 1 }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Business hours */}
      {hours && (
        <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '24px 22px' }}>
          <h3 style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 14px' }}>Business hours</h3>
          {[
            { day: 'Monday – Friday', time: hours.mondayFriday },
            { day: 'Saturday', time: hours.saturday },
            { day: 'Sunday', time: hours.sunday },
          ].map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: '.84rem', color: 'var(--text)' }}>{h.day}</span>
              <span style={{ fontSize: '.84rem', color: h.time === 'Closed' ? '#e74c3c' : 'var(--text-sec)' }}>{h.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
