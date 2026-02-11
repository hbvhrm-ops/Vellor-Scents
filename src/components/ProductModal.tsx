import React from 'react';
import { Perfume } from '../types';

interface ProductModalProps {
  product: Perfume | null;
  onClose: () => void;
  onAddToCart: (p: Perfume) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#fcfcfa] max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-sm border border-[#c5a059]/20 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-8">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl">&times;</button>
          <div className="aspect-[3/4] overflow-hidden bg-white mb-6">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c5a059] font-bold mb-2">{product.category}</p>
          <h3 className="text-2xl font-serif font-bold mb-2">{product.name}</h3>
          <p className="text-gray-700 text-sm mb-4">{product.description}</p>
          <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">Notes</p>
          <p className="text-[10px] text-gray-600 mb-4">Top: {product.topNotes.join(', ')} · Mid: {product.middleNotes.join(', ')} · Base: {product.baseNotes.join(', ')}</p>
          <p className="text-xl font-medium text-gray-900 mb-6">PKR {product.price.toLocaleString()}</p>
          <button onClick={() => onAddToCart(product)} className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#c5a059]">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
