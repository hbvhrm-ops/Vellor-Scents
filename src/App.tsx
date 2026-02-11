// Vellor Scents Official - Root Application
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { db } from './firebase'; 
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

// COMPONENT IMPORTS
import type { Perfume, CartItem, Order } from './types.ts';
import { PERFUMES as INITIAL_PERFUMES } from './constants';
import { ProductModal, CartDrawer, CheckoutModal, AdminDashboard } from './components';

// Global Declarations for External Services
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

// Helper to decode Google JWT tokens
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const App: React.FC = () => {
  // 1. STATE: All data now sources from Cloud
  const [perfumes, setPerfumes] = useState<Perfume[]>(INITIAL_PERFUMES);
  const [orders, setOrders] = useState<Order[]>([]);

  // Boutique UI & Auth States
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
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 2. REAL-TIME PERFUME SYNC: Replaces localStorage logic
  useEffect(() => {
    const q = query(collection(db, "perfumes"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const cloudPerfumes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Perfume[];
        setPerfumes(cloudPerfumes);
      }
    }, (error) => console.error("Perfume Sync Error:", error));

    return () => unsubscribe();
  }, []);

  // 3. REAL-TIME ORDER SYNC: Keeps the Admin Dashboard live
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cloudOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleString() : 'Just now'
      })) as Order[];
      setOrders(cloudOrders);
    }, (error) => console.error("Order Sync Error:", error));

    return () => unsubscribe();
  }, []);

  // 4. GOOGLE SIGN-IN INITIALIZATION
  useEffect(() => {
    if (!isAuthenticated && !isAdminOpen) {
      const initGoogle = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: "689215905696-2u3eak8vjj1jhlof67qpsrc6iufj9gg1.apps.googleusercontent.com", 
            callback: (res: any) => {
              const payload = parseJwt(res.credential);
              if (payload) {
                setIsAuthenticated(true);
                setUserRole('customer');
                setUserEmail(payload.email);
                setUserName(payload.name || payload.given_name || 'Valued Client');
              }
            },
          });
          if (googleBtnRef.current) {
            window.google.accounts.id.renderButton(googleBtnRef.current, { theme: "outline", size: "large", width: "100%" });
          }
        } else {
          setTimeout(initGoogle, 100);
        }
      };
      initGoogle();
    }
  }, [isAuthenticated, isAdminOpen]);

  // Click Outside Handler
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Logic Handlers
  const cartTotal = useMemo(() => cartItems.reduce((t, i) => t + i.price * i.quantity, 0), [cartItems]);

  const filteredPerfumes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return perfumes;
    return perfumes.filter(p => `${p.name} ${p.category} ${p.brand}`.toLowerCase().includes(q));
  }, [searchQuery, perfumes]);

  const suggestions = useMemo(() => searchQuery.length > 1 ? filteredPerfumes.slice(0, 5) : [], [filteredPerfumes, searchQuery]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === 'admin@vellorscents.com' && loginPassword === 'VellorAdmin2025') {
      setIsAuthenticated(true);
      setUserRole('admin');
      setIsAdminOpen(true);
    } else {
      alert('Authentication error.');
    }
  };

  const addToCart = (p: Perfume) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === p.id);
      return exists ? prev.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item) : [...prev, { ...p, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  // 5. CLOUD PLACE ORDER: Integrated with n8n Automation
  const handlePlaceOrder = async (name: string, whatsapp: string, address: string, postalCode: string, screenshot: string) => {
    try {
      await addDoc(collection(db, "orders"), {
        customerName: name,
        customerEmail: userEmail || 'guest',
        whatsappNumber: whatsapp,
        address,
        postalCode,
        items: cartItems.map(item => `${item.name} (${item.quantity})`),
        totalAmount: cartTotal,
        status: 'pending',
        processedByN8N: false, // Trigger for your AI Agent
        transactionScreenshot: screenshot,
        createdAt: serverTimestamp(),
      });
      setCartItems([]);
      setIsCheckoutOpen(false);
      alert("Luxury Order Confirmed!");
    } catch (err) {
      console.error("Cloud Error:", err);
      alert("Order failed. Please check your connection.");
    }
  };

  // --- RENDER ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen luxury-fade-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#fcfcfa]/80 backdrop-blur-xl p-12 rounded-sm border border-[#c5a059]/20 shadow-2xl text-center">
          <h1 className="text-4xl font-serif font-bold tracking-[0.4em] uppercase text-gray-900 mb-2">Vellor</h1>
          <p className="text-[10px] tracking-[0.6em] text-[#c5a059] uppercase font-bold mb-12">Private Entrance</p>
          <div className="space-y-8">
            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Authenticate with Google</p>
            <div ref={googleBtnRef} className="w-full"></div>
            <div className="relative border-t border-[#dcd0ad] pt-8">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-[#fcfcfa] text-[9px] text-gray-400">ADMIN</span>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <input type="email" placeholder="EMAIL" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-transparent border-b border-[#dcd0ad] py-2 text-[10px] tracking-widest focus:outline-none text-center" />
              <input type="password" placeholder="PASSWORD" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-transparent border-b border-[#dcd0ad] py-2 text-[10px] tracking-widest focus:outline-none text-center" />
              <button type="submit" className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#c5a059]">Access Studio</button>
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
            <div className="w-full md:w-1/4">
              <button onClick={() => setIsAuthenticated(false)} className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-black">Logout {userRole === 'admin' && '(Admin)'}</button>
              {userName && <div className="text-[8px] uppercase tracking-widest text-[#c5a059] mt-1 font-bold">Welcome, {userName}</div>}
            </div>
            <div className="flex-1 text-center py-4">
              <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-[0.5em] uppercase cursor-pointer" onClick={() => setIsAdminOpen(false)}>Vellor Scents</h1>
              <span className="text-[9px] tracking-[0.8em] text-[#c5a059] uppercase font-bold block">Artisanal Essences</span>
              {!isAdminOpen && (
                <div ref={searchRef} className="mt-4 relative inline-block w-full max-w-xs px-8">
                  <input type="text" placeholder="FIND AN ESSENCE..." value={searchQuery} onFocus={() => setShowSuggestions(true)} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-b border-[#c5a059]/10 focus:border-[#c5a059] pb-1 text-[10px] tracking-[0.2em] w-full focus:outline-none" />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-[#fcfcfa] shadow-2xl border border-[#c5a059]/10 rounded-sm z-50 overflow-hidden">
                       {suggestions.map(p => (
                         <div key={p.id} onClick={() => { setSelectedProduct(p); setShowSuggestions(false); }} className="flex items-center p-4 hover:bg-[#e6dcbe]/30 cursor-pointer">
                            <div className="w-10 h-12 bg-white mr-4"><img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /></div>
                            <div className="text-left"><p className="text-[10px] font-serif font-bold">{p.name}</p><p className="text-[8px] text-[#c5a059] uppercase font-bold">{p.category}</p></div>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="w-full md:w-1/4 flex justify-end items-center space-x-8">
              {userRole === 'admin' && <button onClick={() => setIsAdminOpen(!isAdminOpen)} className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#c5a059]">{isAdminOpen ? 'Storefront' : 'Studio'}</button>}
              <button onClick={() => setIsCartOpen(true)} className="relative group">
                <svg className="w-7 h-7 text-gray-800 group-hover:text-[#c5a059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {cartItems.length > 0 && <span className="absolute -top-1 -right-1 bg-[#c5a059] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{cartItems.reduce((a, b) => a + b.quantity, 0)}</span>}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-4">
        {isAdminOpen && userRole === 'admin' ? (
          <AdminDashboard perfumes={perfumes} setPerfumes={setPerfumes} orders={orders} setOrders={setOrders} />
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="h-[80vh] flex flex-col items-center justify-center text-center mb-32 border border-[#c5a059]/10 bg-[#fcfcfa]/20 shadow-sm px-6">
                <span className="text-[11px] uppercase font-bold tracking-[1.5em] mb-10 text-[#c5a059]">Maison de Luxe • Italia</span>
                <h2 className="text-5xl md:text-[8.5rem] font-serif font-bold tracking-tighter leading-[0.9] text-gray-800/80">The Art of <span className="italic text-[#c5a059]/90">Scent</span></h2>
                <p className="text-lg md:text-xl mb-14 max-w-2xl font-light italic leading-relaxed text-gray-700/80 mt-8">"Crafting liquid emotions inspired by the timeless class and sun-drenched elegance of the Italian soul."</p>
                <button onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })} className="px-16 py-7 bg-black text-white text-[11px] font-bold uppercase tracking-[0.6em] transition-all hover:bg-[#c5a059]">Enter The Boutique</button>
            </div>
            <div id="gallery" className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-32">
                {filteredPerfumes.map((p) => (
                  <div key={p.id} className="group cursor-pointer" onClick={() => setSelectedProduct(p)}>
                    <div className="aspect-[3/4] overflow-hidden bg-white mb-10 shadow-sm hover:shadow-2xl transition-all duration-500">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-[#c5a059] font-bold mb-4">{p.category}</p>
                      <h3 className="text-3xl md:text-4xl font-serif font-bold group-hover:text-[#c5a059] transition-colors">{p.name}</h3>
                      <p className="text-gray-700 font-medium italic text-xl mt-4">PKR {p.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onRemove={(id) => setCartItems(prev => prev.filter(i => i.id !== id))} onUpdateQuantity={(id, d) => setCartItems(p => p.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))} onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} total={cartTotal} onConfirm={handlePlaceOrder} />
    </div>
  );
};

export default App;