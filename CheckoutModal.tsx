import React, { useState } from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (name: string, whatsapp: string, address: string, postalCode: string, screenshot: string) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, total, onConfirm }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [screenshot, setScreenshot] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(name, whatsapp, address, postalCode, screenshot);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#fcfcfa] max-w-md w-full rounded-sm border border-[#c5a059]/20 shadow-2xl p-8" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-serif font-bold uppercase tracking-widest">Checkout</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">&times;</button>
        </div>
        <p className="text-sm font-bold mb-6">Total: PKR {total.toLocaleString()}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-transparent border-b border-[#dcd0ad] py-2 text-[10px] tracking-widest focus:outline-none" />
          <input type="tel" placeholder="WhatsApp Number" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required className="w-full bg-transparent border-b border-[#dcd0ad] py-2 text-[10px] tracking-widest focus:outline-none" />
          <input type="text" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} required className="w-full bg-transparent border-b border-[#dcd0ad] py-2 text-[10px] tracking-widest focus:outline-none" />
          <input type="text" placeholder="Postal Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} className="w-full bg-transparent border-b border-[#dcd0ad] py-2 text-[10px] tracking-widest focus:outline-none" />
          <input type="url" placeholder="Transaction screenshot URL (optional)" value={screenshot} onChange={e => setScreenshot(e.target.value)} className="w-full bg-transparent border-b border-[#dcd0ad] py-2 text-[10px] tracking-widest focus:outline-none" />
          <button type="submit" className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#c5a059]">
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
