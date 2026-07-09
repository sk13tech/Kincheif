"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const r = await fetch("/api/auth/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Failed"); setLoading(false); return; }
      localStorage.setItem("adminToken", d.token);
      router.push("/admin");
    } catch { setError("Something went wrong"); setLoading(false); }
  };

  const inp = "w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-[14px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#1a8a6a] transition";

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-[22px] font-black text-white tracking-tight">KinChief</h1>
          <p className="text-[13px] text-[#888] mt-1">Admin Dashboard</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="block text-[12px] font-medium text-[#888] mb-1.5">Username</label><input type="text" value={username} onChange={e => setUsername(e.target.value)} required className={inp} placeholder="admin" /></div>
          <div><label className="block text-[12px] font-medium text-[#888] mb-1.5">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={inp} placeholder="••••••" /></div>
          {error && <p className="text-[13px] text-[#ef4444] bg-[#1a0505] border border-[#3a1010] p-3 rounded-xl">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[#1a8a6a] text-white py-3 rounded-xl text-[14px] font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</> : "Sign In"}
          </button>
        </form>
        <p className="text-center mt-8 text-[11px] text-[#555] bg-[#1a1a1a] border border-[#333] px-4 py-2 rounded-xl">
          Default: <span className="text-[#999] font-mono">admin</span> / <span className="text-[#999] font-mono">admin123</span>
        </p>
        <Link href="/" className="block text-center text-[13px] text-[#666] mt-5 hover:text-white transition">← Back to store</Link>
      </div>
    </div>
  );
}
