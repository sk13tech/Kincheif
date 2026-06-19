import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOutUser } from '../lib/firebase';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  hasConsent: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasConsent = !!localStorage.getItem('purehome_consent');

  useEffect(() => {
    const unsub = onAuthChange((u) => { setUser(u); setLoading(false); });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  const login = useCallback(async () => {
    // BLOCK login if consent not given
    if (!localStorage.getItem('purehome_consent')) return;
    const u = await signInWithGoogle();
    if (u) setUser(u);
  }, []);

  const logout = useCallback(async () => { await signOutUser(); setUser(null); }, []);

  return (
    <Ctx.Provider value={{ user, loading, login, logout, hasConsent }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
