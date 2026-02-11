
import React, { useState } from 'react';
import { Perfume, Order } from '../types';

interface AdminDashboardProps {
  perfumes: Perfume[];
  setPerfumes: React.Dispatch<React.SetStateAction<Perfume[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ perfumes, setPerfumes, orders, setOrders }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [editingProduct, setEditingProduct] = useState<Perfume | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // Form State for Products
  const [formData, setFormData] = useState<Partial<Perfume>>({
    name: '',
    category: 'Oriental',
    price: 0,
    stock: 0,
    imageUrl: '',
    description: '',
    topNotes: [],
    middleNotes: [],
    baseNotes: [],
    brand: 'Vellor Scents'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Oriental',
      price: 0,
      stock: 0,
      imageUrl: '',
      description: '',
      topNotes: [],
      middleNotes: [],
      baseNotes: [],
      brand: 'Vellor Scents'
    });
    setEditingProduct(null);
  };

  const handleEdit = (p: Perfume) => {
    setEditingProduct(p);
    setFormData(p);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you wish to retire this creation from the collection?')) {
      setPerfumes(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'verified' | 'rejected') => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setPerfumes(prev => prev.map(p => p.id === editingProduct.id ? (formData as Perfume) : p));
    } else {
      const newProduct: Perfume = {
        ...formData,
        id: Date.now().toString(),
      } as Perfume;
      setPerfumes(prev => [newProduct, ...prev]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-[#dcd0ad] pb-10 gap-6">
        <div>
          <span className="text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.4em] mb-4 block">Maison Archives</span>
          <h1 className="text-5xl font-serif font-bold text-gray-900 tracking-tight">Studio Management</h1>
        </div>
        
        <div className="flex items-center bg-white/50 backdrop-blur-sm p-1 rounded-sm border border-[#dcd0ad] shadow-sm">
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-8 py-4 text-[9px] font-bold uppercase tracking-[0.2em] transition-all rounded-sm ${activeTab === 'products' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:text-black'}`}
          >
            Collection
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-8 py-4 text-[9px] font-bold uppercase tracking-[0.2em] transition-all rounded-sm ${activeTab === 'orders' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:text-black'}`}
          >
            Orders Review ({orders.filter(o => o.status === 'pending').length})
          </button>
        </div>

        {activeTab === 'products' && (
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-[#c5a059] text-white px-10 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl"
          >
            Add New Masterpiece
          </button>
        )}
      </div>

      {activeTab === 'products' ? (
        <div className="bg-white/40 backdrop-blur-md rounded-sm border border-[#dcd0ad] overflow-hidden shadow-sm animate-in fade-in duration-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#dcd0ad]">
              <thead className="bg-[#dfd5b7]/30">
                <tr>
                  <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Product Details</th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Category</th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Price</th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Inventory</th>
                  <th className="px-8 py-6 text-right text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {perfumes.map((perfume) => (
                  <tr key={perfume.id} className="hover:bg-white/60 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-12 bg-gray-50 overflow-hidden rounded-sm border border-gray-100">
                          <img className="h-full w-full object-cover" src={perfume.imageUrl} alt={perfume.name} />
                        </div>
                        <div className="ml-6">
                          <div className="text-sm font-bold text-gray-900 font-serif tracking-wide">{perfume.name}</div>
                          <div className="text-[9px] text-[#c5a059] uppercase font-bold tracking-widest">{perfume.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-[11px] font-medium text-gray-500 uppercase tracking-widest">{perfume.category}</td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-900">PKR {perfume.price.toFixed(2)}</td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full ${
                        perfume.stock > 10 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {perfume.stock} units
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right text-[10px] font-bold uppercase tracking-widest space-x-6">
                      <button onClick={() => handleEdit(perfume)} className="text-[#c5a059] hover:text-black transition-colors">Edit</button>
                      <button onClick={() => handleDelete(perfume.id)} className="text-red-400 hover:text-red-600 transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white/40 backdrop-blur-md rounded-sm border border-[#dcd0ad] overflow-hidden shadow-sm animate-in fade-in duration-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#dcd0ad]">
              <thead className="bg-[#dfd5b7]/30">
                <tr>
                  <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Order & Client</th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Full Delivery Details</th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Total</th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-right text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic font-serif">"The archive of orders is currently empty."</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/60 transition-colors">
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-gray-900 font-serif tracking-wide">{order.customerName}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">ID: {order.id}</div>
                        <div className="text-[9px] text-gray-400 font-medium tracking-widest mt-1">{order.customerEmail}</div>
                        <div className="text-[11px] text-[#c5a059] font-medium tracking-widest mt-1">{order.whatsappNumber}</div>
                        <div className="text-[8px] text-gray-400 italic mt-1">{order.date}</div>
                      </td>
                      <td className="px-8 py-6 min-w-[250px] max-w-sm">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-800 mb-1">Shipping Address:</div>
                        <p className="text-[11px] text-gray-600 whitespace-pre-wrap leading-relaxed italic mb-2">{order.address}</p>
                        <div className="inline-block px-2 py-0.5 bg-[#e6dcbe] rounded-sm text-[9px] font-bold uppercase tracking-[0.2em] text-[#c5a059]">Postal Code: {order.postalCode}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-900">PKR {order.totalAmount.toFixed(2)}</td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full ${
                          order.status === 'verified' ? 'bg-green-50 text-green-700 border border-green-100' : 
                          order.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right space-x-4">
                        <button 
                          onClick={() => setSelectedReceipt(order.transactionScreenshot)}
                          className="text-[10px] font-bold uppercase tracking-widest text-black hover:text-[#c5a059] border-b border-black hover:border-[#c5a059] transition-all"
                        >
                          View Receipt
                        </button>
                        {order.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'verified')}
                              className="text-[9px] font-bold uppercase tracking-widest bg-green-600 text-white px-3 py-1.5 rounded-sm hover:bg-green-700 transition-colors shadow-sm"
                            >
                              Verify
                            </button>
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                              className="text-[9px] font-bold uppercase tracking-widest bg-red-600 text-white px-3 py-1.5 rounded-sm hover:bg-red-700 transition-colors shadow-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Form Modal (Products) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#faf8f2] max-w-2xl w-full p-10 md:p-16 rounded-sm shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <h2 className="text-3xl font-serif font-bold mb-10 text-center tracking-tight">
              {editingProduct ? 'Refine Masterpiece' : 'New Creation Entry'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="mb-10 text-center">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-6">Artistic Visual</label>
                <div className="relative group mx-auto w-48 h-64 bg-white border border-[#dcd0ad] overflow-hidden rounded-sm flex items-center justify-center cursor-pointer">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Select Image</span>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Creation Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-b border-[#dcd0ad] py-2 focus:outline-none focus:border-[#c5a059] text-sm tracking-wide font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-transparent border-b border-[#dcd0ad] py-2 focus:outline-none focus:border-[#c5a059] text-sm tracking-wide font-medium">
                    <option value="Oriental">Oriental</option>
                    <option value="Fresh">Fresh</option>
                    <option value="Woody">Woody</option>
                    <option value="Floral">Floral</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Retail Value (PKR)</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-transparent border-b border-[#dcd0ad] py-2 focus:outline-none focus:border-[#c5a059] text-sm tracking-wide font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Stock Availability</label>
                  <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full bg-transparent border-b border-[#dcd0ad] py-2 focus:outline-none focus:border-[#c5a059] text-sm tracking-wide font-medium" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Fragrance Narrative</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-transparent border-b border-[#dcd0ad] py-2 focus:outline-none focus:border-[#c5a059] text-sm tracking-wide font-medium resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {['topNotes', 'middleNotes', 'baseNotes'].map((field) => (
                    <div key={field} className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{field.replace(/([A-Z])/g, ' $1').trim()} (Comma Sep.)</label>
                      <input type="text" value={(formData as any)[field]?.join(', ')} onChange={e => setFormData({...formData, [field]: e.target.value.split(',').map(s => s.trim())})} className="w-full bg-transparent border-b border-[#dcd0ad] py-2 focus:outline-none focus:border-[#c5a059] text-sm tracking-wide font-medium" />
                    </div>
                 ))}
              </div>

              <div className="pt-10 flex space-x-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 border border-black text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-100 transition-all">Discard Changes</button>
                <button type="submit" className="flex-1 py-5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#c5a059] transition-all shadow-xl">{editingProduct ? 'Commit Updates' : 'Publish Masterpiece'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedReceipt(null)} />
          <div className="relative max-w-2xl w-full p-4">
            <button onClick={() => setSelectedReceipt(null)} className="absolute -top-12 right-0 text-white text-[10px] font-bold uppercase tracking-widest flex items-center">
              Close <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img src={selectedReceipt} className="w-full h-auto rounded-sm shadow-2xl border border-white/10" alt="Transaction Proof" />
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #dcd0ad; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
