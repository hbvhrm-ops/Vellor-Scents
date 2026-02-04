
// Vellor Scents Official - Root Application
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Perfume, CartItem, Order } from './types';
import { PERFUMES as INITIAL_PERFUMES } from './constants';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/AdminDashboard';

// Fix: Declare global window properties for Google Identity Services and AI Studio
// Using a separate interface for AIStudio to avoid conflict with existing global declarations
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    google: any;
    aistudio: AIStudio;
  }
}

// Helper to decode Google JWT tokens without external libraries
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const App: React.FC = () => {
  // Persistence for the artisanal collection
  const [perfumes, setPerfumes] = useState<Perfume[]>(() => {
    const saved = localStorage.getItem('vellor_collection');
    return saved ? JSON.parse(saved) : INITIAL_PERFUMES;
  });

  // Persistence for orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('vellor_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'customer' | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Perfume | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Initialize Google Sign-In
  useEffect(() => {
    if (!isAuthenticated && !isAdminOpen) {
      const initGoogle = () => {
        // Fix: accessing google on window now that it's declared in the global scope
        if (window.google) {
          window.google.accounts.id.initialize({
          client_id: "689215905696-2u3eak8vjj1jhlof67qpsrc6iufj9gg1.apps.googleusercontent.com", 
          callback: handleGoogleCredentialResponse,
          });
          if (googleBtnRef.current) {
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: "outline",
              size: "large",
              text: "continue_with",
              shape: "rectangular",
              width: "100%",
            });
          }
        } else {
          // If script not loaded yet, retry shortly
          setTimeout(initGoogle, 100);
        }
      };
      initGoogle();
    }
  }, [isAuthenticated, isAdminOpen]);

  const handleGoogleCredentialResponse = (response: any) => {
    const payload = parseJwt(response.credential);
    if (payload) {
      setIsAuthenticated(true);
      setUserRole('customer');
      setUserEmail(payload.email);
      setUserName(payload.name || payload.given_name || 'Valued Client');
      console.log("Logged in as:", payload.email);
    }
  };

  // Save collection changes
  useEffect(() => {
    localStorage.setItem('vellor_collection', JSON.stringify(perfumes));
  }, [perfumes]);

  // Save orders changes
  useEffect(() => {
    localStorage.setItem('vellor_orders', JSON.stringify(orders));
  }, [orders]);

  // Handle click outside search for suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cartTotal = useMemo(() => 
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  // Term-based matching logic (Multi-term "fuzzy" approach)
  const filteredPerfumes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return perfumes;
    const terms = query.split(/\s+/);
    return perfumes.filter(p => {
      const searchableText = `${p.name} ${p.category} ${p.description} ${p.brand}`.toLowerCase();
      return terms.every(term => searchableText.includes(term));
    });
  }, [searchQuery, perfumes]);

  // Deriving suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    return filteredPerfumes.slice(0, 5);
  }, [filteredPerfumes, searchQuery]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === 'admin@vellorscents.com' && loginPassword === 'VellorAdmin2025') {
      setIsAuthenticated(true);
      setUserRole('admin');
      setUserEmail(loginEmail);
      setIsAdminOpen(true);
    } else {
      alert('The secret key or email provided does not match our archives.');
    }
  };

  const addToCart = (perfume: Perfume) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === perfume.id);
      if (existing) {
        return prev.map(item => 
          item.id === perfume.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        id: perfume.id, 
        name: perfume.name, 
        brand: perfume.brand, 
        category: perfume.category, 
        price: perfume.price, 
        quantity: 1, 
        imageUrl: perfume.imageUrl 
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleSuggestionClick = (perfume: Perfume) => {
    setSelectedProduct(perfume);
    setSearchQuery(perfume.name);
    setShowSuggestions(false);
  };

  // --- AROUND LINE 183 ---
const handlePlaceOrder = (name: string, whatsapp: string, address: string, postalCode: string, screenshot: string) => {
  const newOrder: Order = {
    id: `VL-${Date.now()}`,
    customerName: name,
    customerEmail: userEmail,
    whatsappNumber: whatsapp,
    address: address,
    postalCode: postalCode,
    items: [...cartItems],
    totalAmount: cartTotal,
    status: 'pending',
    transactionScreenshot: screenshot,
    date: new Date().toLocaleString()
  };

  // 1. Update your local state
  setOrders(prev => [newOrder, ...prev]);
  setCartItems([]);

  // 2. TRIGGER THE AI AGENT (The Change is Here)
  // Replace the URL with your actual ngrok public URL
  fetch('https://your-ngrok-url.ngrok-free.app/webhook/your-id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: userEmail, // Critical for your Postgres Chat Memory
      ...newOrder
    })
  })
  .then(response => {
    if (response.ok) console.log("AI Agent received the order.");
  })
  .catch(err => console.error("Could not reach AI Agent:", err));

};

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen luxury-fade-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#fcfcfa]/80 backdrop-blur-xl p-12 rounded-sm border border-[#c5a059]/20 shadow-2xl text-center">
          <h1 className="text-4xl font-serif font-bold tracking-[0.4em] uppercase text-gray-900 mb-2">Vellor</h1>
          <p className="text-[10px] tracking-[0.6em] text-[#c5a059] uppercase font-bold mb-12">Private Entrance</p>
          
          <div className="space-y-8">
            <div className="flex flex-col items-center">
              <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-4 font-bold">Authenticate with Google</p>
              <div ref={googleBtnRef} className="w-full"></div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#dcd0ad]"></div></div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-widest text-gray-400"><span className="px-4 bg-[#fcfcfa] rounded-full">Maison Administrator</span></div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-4">
                <input 
                  type="email" 
                  placeholder="ADMIN EMAIL" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-[#dcd0ad] py-2 text-[10px] tracking-widest focus:outline-none focus:border-[#c5a059] text-center"
                />
                <input 
                  type="password" 
                  placeholder="PASSWORD" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-[#dcd0ad] py-2 text-[10px] tracking-widest focus:outline-none focus:border-[#c5a059] text-center"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#c5a059] transition-all shadow-lg active:scale-95"
              >
                Access Studio
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen luxury-fade-bg text-gray-900 font-sans selection:bg-[#c5a059] selection:text-white transition-colors duration-1000">
      <nav className="fixed top-0 w-full bg-[#e6dcbe]/60 backdrop-blur-xl z-40 border-b border-[#c5a059]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-24 py-4 md:py-0">
            <div className="flex items-center justify-start w-full md:w-1/4 mb-4 md:mb-0">
              <div className="flex flex-col items-start">
                <button 
                  onClick={() => { setIsAuthenticated(false); setUserRole(null); setIsAdminOpen(false); }} 
                  className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-black transition-all"
                >
                  Logout {userRole === 'admin' ? '(Admin)' : ''}
                </button>
                {userName && <span className="text-[8px] uppercase tracking-widest text-[#c5a059] mt-1 font-bold">Welcome, {userName}</span>}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center flex-1 space-y-4 md:space-y-0 md:space-x-12">
              <div className="flex flex-col items-center">
                <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-[0.5em] uppercase text-gray-900 cursor-pointer text-center" onClick={() => setIsAdminOpen(false)}>Vellor Scents</h1>
                <span className="text-[9px] tracking-[0.8em] text-[#c5a059] uppercase font-bold mt-1">Artisanal Essences</span>
              </div>
              
              {!isAdminOpen && (
                <div ref={searchRef} className="relative flex items-center w-full max-w-xs md:w-72 group border-t md:border-t-0 md:border-l border-[#c5a059]/20 pt-4 md:pt-0 md:pl-8">
                  <svg className="w-3.5 h-3.5 absolute left-0 md:left-8 text-gray-400 group-focus-within:text-[#c5a059] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text"
                    placeholder="FIND AN ESSENCE..."
                    value={searchQuery}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    className="bg-transparent border-b border-[#c5a059]/10 focus:border-[#c5a059] pl-7 pb-1 text-[10px] tracking-[0.2em] font-medium w-full focus:outline-none transition-all placeholder:text-gray-400 placeholder:font-light"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#fcfcfa]/95 backdrop-blur-md shadow-2xl border border-[#c5a059]/10 rounded-sm z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-gray-100 bg-[#e6dcbe]/10">
                         <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#c5a059]">Top Matches</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {suggestions.map(p => (
                          <div key={p.id} onClick={() => handleSuggestionClick(p)} className="flex items-center p-4 hover:bg-[#e6dcbe]/30 cursor-pointer transition-colors group">
                            <div className="w-10 h-12 bg-white mr-4 overflow-hidden border border-gray-100 shadow-sm">
                               <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-all" />
                            </div>
                            <div>
                               <p className="text-[10px] font-serif font-bold text-gray-900">{p.name}</p>
                               <p className="text-[8px] text-[#c5a059] uppercase tracking-widest font-bold">{p.category}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center md:justify-end items-center w-full md:w-1/4 space-x-8 mt-4 md:mt-0">
              {userRole === 'admin' && (
                <button 
                  onClick={() => setIsAdminOpen(!isAdminOpen)}
                  className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#c5a059] hover:text-black transition-all"
                >
                  {isAdminOpen ? 'Storefront' : 'Studio'}
                </button>
              )}
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 group">
                <svg className="w-7 h-7 text-gray-800 group-hover:text-[#c5a059] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#c5a059] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 md:pt-24">
        {isAdminOpen && userRole === 'admin' ? (
          <AdminDashboard perfumes={perfumes} setPerfumes={setPerfumes} orders={orders} setOrders={setOrders} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative h-[80vh] flex flex-col items-center justify-center text-center mb-32 border border-[#c5a059]/10 rounded-sm bg-[#fcfcfa]/20 backdrop-blur-[1px] shadow-sm">
              <div className="max-w-5xl animate-in fade-in zoom-in duration-1000 px-6">
                <span className="text-[11px] uppercase font-bold tracking-[1.5em] mb-10 block text-[#c5a059]">Maison de Luxe • Italia</span>
                <div className="relative mb-12">
                  <h2 className="text-5xl md:text-[8.5rem] font-serif font-bold tracking-tighter text-gray-800/80 leading-[0.9]">The Art of</h2>
                  <h2 className="text-6xl md:text-[11rem] font-serif italic text-[#c5a059]/90 leading-[0.8] mt-[-1rem]">Scent</h2>
                </div>
                <p className="text-lg md:text-xl mb-14 max-w-2xl font-light italic leading-relaxed mx-auto text-gray-700/80">"Crafting liquid emotions inspired by the timeless class, whispered softness, and sun-drenched elegance of the Italian soul."</p>
                <button onClick={() => document.getElementById('gallery-start')?.scrollIntoView({ behavior: 'smooth' })} className="group relative overflow-hidden px-16 py-7 bg-black text-white text-[11px] font-bold uppercase tracking-[0.6em] transition-all hover:bg-[#c5a059] shadow-2xl active:scale-[0.98]">
                  <span className="relative z-10">Enter The Boutique</span>
                </button>
              </div>
            </div>

            <div id="gallery-start" className="pt-24 pb-20 text-center relative">
               <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-24 bg-gradient-to-b from-[#c5a059] to-transparent mb-12"></div>
               <span className="text-[10px] uppercase font-bold tracking-[1em] text-[#c5a059] mb-4 block">Collection N°1</span>
               <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-gray-900 mb-6">The Gallery</h2>
               <p className="text-sm uppercase tracking-[0.4em] text-gray-700 font-medium italic">{searchQuery ? `Refining selection for "${searchQuery}"` : 'A Curation of Artisanal Masterpieces'}</p>
            </div>

            {filteredPerfumes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 md:gap-x-20 gap-y-32">
                {filteredPerfumes.map((perfume) => (
                  <div key={perfume.id} className="group cursor-pointer" onClick={() => setSelectedProduct(perfume)}>
                    <div className="aspect-[3/4] overflow-hidden bg-white mb-10 relative rounded-sm shadow-sm transition-shadow duration-500 hover:shadow-2xl">
                      <img src={perfume.imageUrl} alt={perfume.name} className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-700 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="px-10 py-5 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">View Masterpiece</span>
                      </div>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-[#c5a059] font-bold mb-4 opacity-80">{perfume.category}</p>
                      <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 group-hover:text-[#c5a059] transition-colors duration-500 mb-3">{perfume.name}</h3>
                      <div className="w-8 h-px bg-gray-400 mx-auto mb-4 group-hover:w-16 group-hover:bg-[#c5a059] transition-all duration-500"></div>
                      <p className="text-gray-700 font-medium tracking-widest italic text-xl">PKR {perfume.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center">
                <p className="text-gray-400 italic text-xl mb-8">"No matching essences found in our current archives."</p>
                <button onClick={() => setSearchQuery('')} className="text-xs font-bold uppercase tracking-[0.3em] border-b border-black pb-2 hover:text-[#c5a059] hover:border-[#c5a059] transition-all">Clear Curation Filters</button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white/10 border-t border-[#c5a059]/10 pt-32 pb-16 backdrop-blur-[1px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-bold tracking-[0.4em] uppercase mb-8">Vellor Scents</h2>
          <p className="text-gray-600 text-[10px] uppercase tracking-[0.4em] mb-20 font-bold">Maison de Parfum • Est. 2024</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto mb-24">
            {['The Maison', 'Sustainability', 'Bespoke Services', 'Contact'].map(link => (
              <a key={link} href="#" className="text-gray-600 hover:text-[#c5a059] transition-colors text-[10px] font-bold uppercase tracking-[0.3em]">{link}</a>
            ))}
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#c5a059]/20 to-transparent mb-12"></div>
          <p className="text-[9px] text-gray-500 tracking-[0.5em] uppercase font-bold">© 2024 Vellor Scents Official • All Rights Reserved</p>
        </div>
      </footer>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onRemove={removeFromCart} onUpdateQuantity={updateQuantity} onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} total={cartTotal} onConfirm={handlePlaceOrder} />
    </div>
  );
};

export default App;
