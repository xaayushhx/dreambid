import { useState } from 'react';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';
const WHATSAPP_API_URL = 'https://api.whatsapp.com/send';

export default function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    const message = "Hello! I'm interested in learning more about your properties.";
    const url = `${WHATSAPP_API_URL}?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-40">
      {/* Tooltip */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 bg-gray-800 text-white rounded-lg px-4 py-2 mb-2 whitespace-nowrap text-sm shadow-lg animate-fadeIn">
          Chat with us
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onTouchStart={() => setIsOpen(!isOpen)}
        className="relative group bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex-shrink-0"
        aria-label="Chat on WhatsApp"
      >
        <img 
          src="/whatsapp.svg" 
          alt="WhatsApp" 
          className="w-7 h-7"
        />
      </button>

      {/* Mobile Tooltip Alternative */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
