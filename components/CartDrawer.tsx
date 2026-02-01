
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
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="px-8 py-8 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-wider">Your Bag</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            {items.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-gray-400 italic mb-8">"An empty vessel waits to be filled."</p>
                <button onClick={onClose} className="text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-[#c5a059] hover:border-[#c5a059] transition-all">Start Exploring</button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li key={item.id} className="py-8 flex">
                    <div className="flex-shrink-0 w-24 h-32 bg-gray-50 overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-center object-cover" />
                    </div>
                    <div className="ml-6 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif text-lg">{item.name}</h3>
                          <p className="ml-4 font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-[10px] uppercase font-bold tracking-widest text-gray-400">{item.category}</p>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <div className="flex items-center space-x-3 border border-gray-200 rounded-sm px-3 py-1 scale-90 origin-left">
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="hover:text-[#c5a059] transition-colors">-</button>
                          <span className="w-4 text-center font-bold text-xs">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)} className="hover:text-[#c5a059] transition-colors">+</button>
                        </div>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-8 py-10 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-between text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
              <p>Subtotal</p>
              <p className="text-black text-base tracking-normal">${total.toFixed(2)}</p>
            </div>
            <p className="mt-0.5 text-[10px] text-gray-400 mb-8 italic">Complimentary luxury wrapping included with every order.</p>
            <button
              onClick={onCheckout}
              disabled={items.length === 0}
              className={`w-full py-5 text-xs font-bold uppercase tracking-[0.3em] transition-all ${
                items.length === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800 shadow-xl active:scale-[0.98]'
              }`}
            >
              Checkout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
