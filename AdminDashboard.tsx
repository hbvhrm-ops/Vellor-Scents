import React from 'react';
import { Perfume, Order } from '../types';

interface AdminDashboardProps {
  perfumes: Perfume[];
  setPerfumes: React.Dispatch<React.SetStateAction<Perfume[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ perfumes, orders }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-[#c5a059]">Studio Dashboard</h2>
      <section>
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700 mb-4">Collection ({perfumes.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perfumes.map(p => (
            <div key={p.id} className="border border-[#c5a059]/20 rounded-sm p-4 bg-[#fcfcfa]/80">
              <div className="aspect-[3/4] overflow-hidden bg-white mb-3">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] font-serif font-bold">{p.name}</p>
              <p className="text-[9px] text-[#c5a059]">PKR {p.price.toLocaleString()} · Stock: {p.stock}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700 mb-4">Orders ({orders.length})</h3>
        <div className="border border-[#c5a059]/20 rounded-sm overflow-hidden bg-[#fcfcfa]/80">
          {orders.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-[#c5a059]/10">
              {orders.map(o => (
                <li key={o.id} className="p-6">
                  <p className="text-[10px] font-bold">{o.customerName ?? '—'} · {o.date ?? '—'}</p>
                  <p className="text-[9px] text-gray-600">{o.whatsappNumber} · {o.address}</p>
                  <p className="text-[9px] text-[#c5a059]">PKR {typeof o.totalAmount === 'number' ? o.totalAmount.toLocaleString() : o.totalAmount} · {o.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
