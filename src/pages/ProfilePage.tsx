import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAddress, validateAddress, emptyAddress, Address, INDIAN_STATES } from '../lib/useAddress';
import { sanitize } from '../lib/sanitize';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface Props {
  user: User | null;
}

const inpS: React.CSSProperties = { width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-sec)', color: 'var(--text)', fontSize: '.78rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };

export default function ProfilePage({ user }: Props) {
  const { saved: savedAddr, save: saveAddr, loading: addrLoading } = useAddress(user);

  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [editAddr, setEditAddr] = useState(false);
  const [addr, setAddr] = useState<Address>(emptyAddress);
  const [addrError, setAddrError] = useState('');
  const [addrSaved, setAddrSaved] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);

  // Load saved phone from user doc
  useEffect(() => {
    if (!user) return;
    const unsub = (async () => {
      const { onSnapshot } = await import('firebase/firestore');
      return onSnapshot(doc(db, 'users', user.uid), snap => {
        if (snap.exists()) {
          const d = snap.data();
          if (d.phone) setPhone(d.phone);
          if (d.name) setName(d.name);
        }
      });
    })();
    return () => { unsub.then(u => u()); };
  }, [user]);

  useEffect(() => {
    if (savedAddr) setAddr(savedAddr);
  }, [savedAddr]);

  if (!user) return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
      <span style={{ fontSize: '.84rem', color: 'var(--text-sec)' }}>Please login to view your profile</span>
    </div>
  );

  const handleProfileSave = async () => {
    if (profileSaving) return;
    setProfileSaving(true);
    setProfileSaved(false);
    await setDoc(doc(db, 'users', user.uid), {
      name: sanitize(name).slice(0, 100),
      phone: phone.replace(/[^0-9+]/g, '').slice(0, 15),
    }, { merge: true });
    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleAddrSave = async () => {
    const err = validateAddress(addr);
    if (err) { setAddrError(err); return; }
    setAddrError('');
    setAddrSaving(true);
    setAddrSaved(false);
    await saveAddr(addr);
    setAddrSaving(false);
    setAddrSaved(true);
    setEditAddr(false);
    setTimeout(() => setAddrSaved(false), 2000);
  };

  const handleAddrDelete = async () => {
    await setDoc(doc(db, 'users', user.uid), { address: null }, { merge: true });
    setAddr(emptyAddress);
    setEditAddr(false);
  };

  const setField = (k: keyof Address, v: string) => setAddr(p => ({ ...p, [k]: v }));

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>My Profile</h3>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Profile info */}
      <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '20px 20px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--hover)', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
            ) : (
              <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text-sec)' }}>{(user.displayName || 'U')[0].toUpperCase()}</span>
            )}
          </div>
          <div>
            <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text)' }}>{name || user.displayName}</div>
            <div style={{ fontSize: '.74rem', color: 'var(--text-sec)', marginTop: 1 }}>{user.email}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inpS} maxLength={100} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9+]/g, ''))} placeholder="9876543210" style={inpS} maxLength={15} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Email</label>
            <input value={user.email || ''} disabled style={{ ...inpS, opacity: .5, cursor: 'not-allowed' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <button onClick={handleProfileSave} disabled={profileSaving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: '.78rem', fontWeight: 600, cursor: profileSaving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: profileSaving ? .6 : 1 }}>
            {profileSaving ? 'Saving...' : 'Save'}
          </button>
          {profileSaved && <span style={{ fontSize: '.74rem', color: '#27ae60', fontWeight: 500 }}>Saved ✓</span>}
        </div>
      </div>

      {/* Saved address */}
      <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text)' }}>Saved Address</div>
          {savedAddr && !editAddr && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setAddr(savedAddr); setEditAddr(true); }} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
              <button onClick={handleAddrDelete} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e74c3c', background: 'none', color: '#e74c3c', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
            </div>
          )}
        </div>

        {addrLoading ? (
          <div style={{ fontSize: '.8rem', color: 'var(--text-sec)' }}>Loading...</div>
        ) : !savedAddr && !editAddr ? (
          <div>
            <div style={{ fontSize: '.8rem', color: 'var(--text-sec)', marginBottom: 10 }}>No saved address. Add one for faster checkout.</div>
            <button onClick={() => setEditAddr(true)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add Address</button>
          </div>
        ) : !editAddr && savedAddr ? (
          <div style={{ fontSize: '.78rem', color: 'var(--text-sec)', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{savedAddr.name}</div>
            <div>{savedAddr.phone}</div>
            <div>{savedAddr.line1}{savedAddr.line2 ? ', ' + savedAddr.line2 : ''}</div>
            <div>{savedAddr.city}, {savedAddr.state} — {savedAddr.pincode}</div>
            {addrSaved && <div style={{ fontSize: '.72rem', color: '#27ae60', marginTop: 6, fontWeight: 500 }}>Address saved ✓</div>}
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Full Name *</label>
                <input value={addr.name} onChange={e => setField('name', e.target.value)} placeholder="John Doe" style={inpS} maxLength={100} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Phone *</label>
                <input value={addr.phone} onChange={e => setField('phone', e.target.value.replace(/[^0-9+]/g, ''))} placeholder="9876543210" style={inpS} maxLength={15} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Address Line 1 *</label>
                <input value={addr.line1} onChange={e => setField('line1', e.target.value)} placeholder="House/Flat no, Building, Street" style={inpS} maxLength={200} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Address Line 2</label>
                <input value={addr.line2} onChange={e => setField('line2', e.target.value)} placeholder="Landmark (optional)" style={inpS} maxLength={200} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>City *</label>
                  <input value={addr.city} onChange={e => setField('city', e.target.value)} placeholder="Mumbai" style={inpS} maxLength={50} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Pincode *</label>
                  <input value={addr.pincode} onChange={e => setField('pincode', e.target.value.replace(/[^0-9]/g, ''))} placeholder="400001" style={inpS} maxLength={6} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>State *</label>
                <select value={addr.state} onChange={e => setField('state', e.target.value)} style={{ ...inpS, appearance: 'auto' }}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {addrError && <div style={{ fontSize: '.72rem', color: '#e74c3c', marginBottom: 10 }}>{addrError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleAddrSave} disabled={addrSaving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: '.78rem', fontWeight: 600, cursor: addrSaving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: addrSaving ? .6 : 1 }}>
                {addrSaving ? 'Saving...' : 'Save Address'}
              </button>
              <button onClick={() => { setEditAddr(false); if (savedAddr) setAddr(savedAddr); else setAddr(emptyAddress); setAddrError(''); }} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
