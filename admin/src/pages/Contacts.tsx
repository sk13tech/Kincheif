import { useState, useEffect } from 'react';
import { subscribeContacts, deleteContact } from '../firebase';
import { Trash2, Mail } from 'lucide-react';

function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

export default function Contacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  useEffect(() => subscribeContacts(setContacts), []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1c1a16] mb-6">Messages ({contacts.length})</h1>
      <div className="space-y-2">
        {contacts.map(c => (
          <div key={c.id} className="rounded-xl border border-[#e8e6e1] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#1c1a16]">{c.name}</p>
                  <span className="text-xs text-[#958d7e]">{c.createdAt ? fmtDate(c.createdAt) : ''}</span>
                </div>
                <p className="text-xs text-[#2f6fa7] font-mono flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" /> {c.email}</p>
                <p className="text-sm text-[#625a4f] mt-2">{c.message}</p>
              </div>
              <button onClick={() => deleteContact(c.id)} className="h-8 w-8 rounded-lg border border-[#e8e6e1] flex items-center justify-center hover:bg-red-50 flex-shrink-0"><Trash2 className="h-3.5 w-3.5 text-[#c0392b]" /></button>
            </div>
          </div>
        ))}
        {contacts.length === 0 && <p className="text-center py-10 text-sm text-[#958d7e]">No messages yet</p>}
      </div>
    </div>
  );
}
