import React from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onUpdateQuantity, onCheckout }) => {
  if (!isOpen) return null;
  const total = items.reduce((t, i) => t + i.price * i.quantity, 0);
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-[#fcfcfa] border-l border-[#c5a059]/20 shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-serif font-bold uppercase tracking-widest">Your Cart</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">&times;</button>
          </div>
          {items.length === 0 ? (
            <p className="text-gray-500 text-sm">Your cart is empty.</p>
          ) : (
            <>
              <ul className="space-y-4 mb-6">
                {items.map(item => (
                  <li key={item.id} className="flex gap-4 border-b border-[#c5a059]/10 pb-4">
                    <div className="w-16 h-20 flex-shrink-0 bg-white overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-serif font-bold truncate">{item.name}</p>
                      <p className="text-[10px] text-[#c5a059]">PKR {item.price.toLocaleString()} × {item.quantity}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-6 h-6 border border-[#c5a059]/30 text-[10px] font-bold">−</button>
                        <span className="text-[10px] w-6 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-6 h-6 border border-[#c5a059]/30 text-[10px] font-bold">+</button>
                        <button onClick={() => onRemove(item.id)} className="text-[9px] text-red-600 ml-2 uppercase">Remove</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-bold mb-4">Total: PKR {total.toLocaleString()}</p>
              <button onClick={onCheckout} className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#c5a059]">
                Checkout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
