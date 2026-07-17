import { useEffect, useState, useCallback } from 'react';
import { auth, googleProvider, db, firebaseConfigured } from './firebase';
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

async function ensureUserDoc(u: User) {
  if (!firebaseConfigured) return;
  const ref = doc(db, 'users', u.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { name: u.displayName || '', email: u.email || '', photoURL: u.photoURL || '', createdAt: Timestamp.now(), lastLogin: Timestamp.now() });
  } else {
    await setDoc(ref, { lastLogin: Timestamp.now() }, { merge: true });
  }
}

export function useGoogleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return;
    }

    setPersistence(auth, browserLocalPersistence).catch(() => {});
    getRedirectResult(auth).then(result => {
      if (result?.user) ensureUserDoc(result.user).catch(() => {});
    }).catch(() => {});

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await ensureUserDoc(u).catch(() => {});
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async () => {
    if (!firebaseConfigured || working) return;
    setWorking(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/unauthorized-domain' || err?.code === 'auth/popup-closed-by-user') {
        try { await signInWithRedirect(auth, googleProvider); } catch { }
      }
    } finally {
      setWorking(false);
    }
  }, [working]);

  const logout = useCallback(async () => {
    if (!firebaseConfigured || working) return;
    setWorking(true);
    try { await signOut(auth); } catch { } finally { setWorking(false); }
  }, [working]);

  return { user, loading, working, login, logout, isLoggedIn: !!user };
}
