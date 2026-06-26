import { useState, useEffect } from 'react';
import { getDashboardStats } from '../firebase';
import { Package, ShoppingCart, IndianRupee, Mail, Clock, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0, totalContacts: 0, totalRevenue: 0, pending: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { getDashboardStats().then(s => { setStats(s); setLoading(false); }); }, []);

  const cards = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600 bg-green-50' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
    { label: 'Pending Orders', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-purple-600 bg-purple-50' },
    { label: 'Messages', value: stats.totalContacts, icon: Mail, color: 'text-sky-600 bg-sky-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1c1a16] mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl border border-[#e8e6e1] bg-white p-5">
            <div className={`h-10 w-10 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-[#1c1a16]">{loading ? '—' : c.value}</p>
            <p className="text-xs text-[#958d7e] mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
