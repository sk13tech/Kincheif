import { useEffect, useState, useCallback } from 'react';
import { db, firebaseConfigured } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { sanitize } from './sanitize';

export interface Address {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

export const emptyAddress: Address = { name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };

export function useAddress(user: User | null) {
  const [saved, setSaved] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured || !user) { setSaved(null); setLoading(false); return; }
    const unsub = onSnapshot(doc(db, 'users', user.uid), snap => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.address) setSaved(d.address as Address);
      }
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const save = useCallback(async (addr: Address) => {
    if (!firebaseConfigured || !user) return;
    const clean: Address = {
      name: sanitize(addr.name).slice(0, 100),
      phone: addr.phone.replace(/[^0-9+]/g, '').slice(0, 15),
      line1: sanitize(addr.line1).slice(0, 200),
      line2: sanitize(addr.line2).slice(0, 200),
      city: sanitize(addr.city).slice(0, 50),
      state: sanitize(addr.state).slice(0, 50),
      pincode: addr.pincode.replace(/[^0-9]/g, '').slice(0, 6),
    };
    await setDoc(doc(db, 'users', user.uid), { address: clean }, { merge: true });
  }, [user]);

  return { saved, loading, save };
}

export function validateAddress(a: Address): string | null {
  if (!a.name || a.name.trim().length < 2) return 'Enter your full name';
  if (!a.phone || !/^[6-9]\d{9}$/.test(a.phone.replace(/[^0-9]/g, ''))) return 'Enter a valid 10-digit phone number';
  if (!a.line1 || a.line1.trim().length < 5) return 'Enter your address (min 5 chars)';
  if (!a.city || a.city.trim().length < 2) return 'Enter your city';
  if (!a.state || a.state.trim().length < 2) return 'Select your state';
  if (!a.pincode || !/^\d{6}$/.test(a.pincode)) return 'Enter a valid 6-digit pincode';
  return null;
}

export const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
  'Chandigarh','Puducherry','Andaman & Nicobar','Dadra & Nagar Haveli','Lakshadweep',
];
