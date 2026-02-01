
import React, { useState, useEffect } from 'react';
import { Perfume, Review } from '../types';

interface ProductModalProps {
  product: Perfume | null;
  onClose: () => void;
  onAddToCart: (p: Perfume) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');

  useEffect(() => {
    if (product) {
      const storedReviews = localStorage.getItem(`vellor_reviews_${product.id}`);
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      } else {
        setReviews([]);
      }
    }
  }, [product]);

  if (!product) return null;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    const review: Review = {
      id: Date.now().toString(),
      productId: product.id,
      rating: newRating,
      comment: newComment,
      author: authorName,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    const updatedReviews = [review, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`vellor_reviews_${product.id}`, JSON.stringify(updatedReviews));
    
    // Reset form
    setNewComment('');
    setAuthorName('');
    setNewRating(5);
  };

  const StarRating = ({ rating, interactive = false, onSetRating }: { rating: number, interactive?: boolean, onSetRating?: (r: number) => void }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onSetRating?.(star)}
          className={`${interactive ? 'cursor-pointer transform hover:scale-110' : 'cursor-default'} transition-all`}
        >
          <svg
            className={`w-4 h-4 ${star <= rating ? 'text-[#c5a059]' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#faf8f2] max-w-5xl w-full overflow-hidden rounded-sm shadow-2xl flex flex-col md:flex-row max-h-[95vh]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 bg-white/50 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all group shadow-sm"
        >
          <svg className="w-5 h-5 text-gray-800 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Product Visual */}
        <div className="md:w-1/2 h-80 md:h-auto overflow-hidden bg-white">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[2s]" />
        </div>

        {/* Content Area */}
        <div className="md:w-1/2 overflow-y-auto bg-[#faf8f2] custom-scrollbar">
          <div className="p-8 md:p-14">
            {/* Header Section */}
            <div className="mb-10">
              <span className="text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.4em] mb-4 block">Essence Curation</span>
              <h2 className="text-4xl font-serif font-bold text-gray-900 leading-tight mb-2">{product.name}</h2>
              <div className="flex items-center space-x-4">
                <p className="text-2xl text-gray-900 font-light italic">${product.price.toFixed(2)}</p>
                <div className="h-px w-8 bg-[#c5a059]/30"></div>
                <div className="flex items-center space-x-2">
                   <StarRating rating={reviews.length > 0 ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 5} />
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">({reviews.length})</span>
                </div>
              </div>
            </div>

            <div className="prose prose-sm text-gray-600 mb-12 italic leading-relaxed">
              <p>"{product.description}"</p>
            </div>

            {/* Olfactory Notes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12 border-y border-[#dcd0ad] py-10">
              <div>
                <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-4">Top Notes</h4>
                <ul className="text-[11px] font-medium text-gray-700 space-y-2 uppercase tracking-widest">
                  {product.topNotes.map(note => <li key={note} className="flex items-center"><span className="w-1.5 h-1.5 bg-[#c5a059] rounded-full mr-2 opacity-50"></span>{note}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-4">Heart Notes</h4>
                <ul className="text-[11px] font-medium text-gray-700 space-y-2 uppercase tracking-widest">
                  {product.middleNotes.map(note => <li key={note} className="flex items-center"><span className="w-1.5 h-1.5 bg-[#c5a059] rounded-full mr-2 opacity-50"></span>{note}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-4">Base Notes</h4>
                <ul className="text-[11px] font-medium text-gray-700 space-y-2 uppercase tracking-widest">
                  {product.baseNotes.map(note => <li key={note} className="flex items-center"><span className="w-1.5 h-1.5 bg-[#c5a059] rounded-full mr-2 opacity-50"></span>{note}</li>)}
                </ul>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex items-center space-x-4 mb-16">
              <button 
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 bg-black text-white py-5 rounded-sm font-bold hover:bg-[#c5a059] transition-all uppercase tracking-[0.4em] text-[10px] shadow-lg active:scale-[0.98]"
              >
                Add to Collection
              </button>
              <button className="p-5 border border-[#dcd0ad] rounded-sm hover:bg-white transition-all group shadow-sm">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Review Section */}
            <div className="border-t border-[#dcd0ad] pt-12">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-serif font-bold tracking-tight">Client Impressions</h3>
                <span className="text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.3em]">{reviews.length} Reflections</span>
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="bg-white/50 border border-[#dcd0ad] p-8 mb-12 rounded-sm shadow-sm">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-800 mb-6">Contribute a Reflection</h4>
                
                <div className="mb-6">
                   <label className="block text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-3">Rating</label>
                   <StarRating rating={newRating} interactive onSetRating={setNewRating} />
                </div>

                <div className="grid grid-cols-1 gap-6 mb-8">
                  <input
                    type="text"
                    placeholder="YOUR NAME"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                    className="bg-transparent border-b border-[#dcd0ad] py-3 text-[10px] tracking-widest font-medium focus:outline-none focus:border-[#c5a059] transition-all placeholder:text-gray-300"
                  />
                  <textarea
                    placeholder="DESCRIBE YOUR OLFACTORY EXPERIENCE..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    rows={3}
                    className="bg-transparent border-b border-[#dcd0ad] py-3 text-[10px] tracking-widest font-medium focus:outline-none focus:border-[#c5a059] transition-all resize-none placeholder:text-gray-300"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-white border border-black text-black py-4 text-[9px] font-bold uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all"
                >
                  Submit Review
                </button>
              </form>

              {/* Review List */}
              <div className="space-y-10">
                {reviews.length === 0 ? (
                  <p className="text-gray-400 text-sm italic text-center py-8">"Be the first to share your experience with this creation."</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="group border-b border-gray-100 pb-10 last:border-0">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-900 uppercase">{review.author}</p>
                          <p className="text-[9px] text-gray-400 font-medium tracking-widest uppercase mt-1">{review.date}</p>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-[13px] text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #faf8f2;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #dcd0ad;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c5a059;
        }
      `}</style>
    </div>
  );
};

export default ProductModal;
