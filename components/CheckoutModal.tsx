
import React, { useState } from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (name: string, whatsapp: string, address: string, postalCode: string, screenshot: string) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, total, onConfirm }) => {
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmOrder = () => {
    if (screenshot && name && whatsapp && address && postalCode) {
      onConfirm(name, whatsapp, address, postalCode, screenshot);
      setStep('success');
    }
  };

  const isInfoValid = name.trim() !== '' && whatsapp.trim() !== '' && address.trim() !== '' && postalCode.trim() !== '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white max-w-lg w-full p-8 md:p-12 rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-300 hover:text-black transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 'info' && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-h-[80vh] overflow-y-auto custom-scrollbar pr-2">
            <h2 className="text-3xl font-serif mb-4 italic">Shipping Details</h2>
            <p className="text-gray-500 mb-8 text-sm italic">"Tell us where to send your chosen essence."</p>
            
            <div className="bg-[#e6dcbe] p-8 mb-8 border border-gray-100 text-center rounded-sm">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#c5a059] mb-4">
                <span>Total Amount Due</span>
              </div>
              <div className="text-4xl font-serif text-black tracking-tighter">${total.toFixed(2)}</div>
            </div>

            <div className="space-y-6 text-left mb-10">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Full Name (Required)</label>
                <input 
                  type="text"
                  placeholder="Your Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-[#dcd0ad] py-3 text-[12px] tracking-widest font-medium focus:outline-none focus:border-[#c5a059] transition-all placeholder:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">WhatsApp Number (Required)</label>
                <input 
                  type="tel"
                  placeholder="+92 XXX XXXXXXX"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-transparent border-b border-[#dcd0ad] py-3 text-[12px] tracking-widest font-medium focus:outline-none focus:border-[#c5a059] transition-all placeholder:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Delivery Address (Required)</label>
                <textarea 
                  placeholder="Street, City, Province"
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-transparent border-b border-[#dcd0ad] py-3 text-[12px] tracking-widest font-medium focus:outline-none focus:border-[#c5a059] transition-all placeholder:text-gray-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Postal Code (Required)</label>
                <input 
                  type="text"
                  placeholder="XXXXX"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-transparent border-b border-[#dcd0ad] py-3 text-[12px] tracking-widest font-medium focus:outline-none focus:border-[#c5a059] transition-all placeholder:text-gray-200"
                />
              </div>
            </div>

            <button 
              disabled={!isInfoValid}
              onClick={() => setStep('payment')}
              className={`w-full py-6 font-bold uppercase tracking-[0.3em] text-[10px] transition-all shadow-xl rounded-sm ${
                isInfoValid 
                  ? 'bg-black text-white hover:bg-gray-800' 
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              Proceed to Payment
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-serif mb-6 text-center italic">Maison Transfer</h2>
            <div className="space-y-6">
              <div className="p-6 bg-[#e6dcbe]/50 border border-[#c5a059]/10 rounded-sm text-center shadow-inner">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059] mb-4">Transfer via Easypaisa</p>
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Account Title</p>
                    <p className="text-lg font-serif">Hamza Haidar</p>
                  </div>
                  <div className="w-8 h-px bg-gray-300"></div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Account Number</p>
                    <p className="text-xl font-bold tracking-[0.1em] text-gray-900">0341 5566953</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-4">Step 2: Upload Receipt Screenshot</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed p-6 text-center transition-all duration-500 rounded-sm ${
                    screenshot ? 'border-green-400 bg-green-50/30' : 'border-gray-200 bg-gray-50'
                  }`}>
                    {screenshot ? (
                      <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="relative h-24 w-20 mb-2">
                           <img src={screenshot} alt="Preview" className="h-full w-full object-cover rounded-sm shadow-md border border-white" />
                           <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                           </div>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-green-600">Receipt Ready for Verification</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center opacity-40">
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Tap to select image</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {screenshot && (
                <button 
                  onClick={handleConfirmOrder}
                  className="w-full py-6 bg-black text-white font-bold uppercase tracking-[0.4em] text-[10px] transition-all transform hover:bg-[#c5a059] shadow-2xl active:scale-95 animate-in slide-in-from-bottom-2 duration-500 rounded-sm"
                >
                  Confirm
                </button>
              )}
              
              {!screenshot && (
                <div className="w-full py-6 bg-gray-50 text-gray-300 font-bold uppercase tracking-[0.4em] text-[10px] border border-dashed border-gray-200 text-center rounded-sm">
                  Upload to Continue
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-10 animate-in zoom-in duration-700">
            <div className="w-24 h-24 bg-green-50 text-[#c5a059] rounded-full flex items-center justify-center mx-auto mb-8 border border-[#c5a059]/20 shadow-xl">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-serif mb-4 italic">Essence Secured</h2>
            <p className="text-gray-500 mb-10 text-sm italic leading-relaxed px-4">
              "Dear <span className="text-black font-bold tracking-widest">{name}</span>, your payment screenshot has been received and archived. Our artisans are now preparing your shipment for departure. We will contact you at <span className="text-black font-bold tracking-widest">{whatsapp}</span> shortly."
            </p>
            <button 
              onClick={() => {
                onClose();
                setStep('info');
                setScreenshot(null);
                setName('');
                setWhatsapp('');
                setAddress('');
                setPostalCode('');
              }}
              className="px-16 py-5 bg-black text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#c5a059] transition-all shadow-xl rounded-sm"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #dcd0ad; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CheckoutModal;
