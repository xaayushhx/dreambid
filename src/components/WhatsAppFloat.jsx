import { useState, useContext, createContext, useRef, useEffect } from 'react';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';
const WHATSAPP_API_URL = 'https://api.whatsapp.com/send';

export const WhatsAppFloatContext = createContext();

export default function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const bottomOffset = useContext(WhatsAppFloatContext) || 'calc(15rem + env(safe-area-inset-bottom, 0))';

  const handleWhatsAppClick = () => {
    // Only open WhatsApp if not dragging
    if (isDragging) return;
    
    const message = "Hello! I'm interested in learning more about your properties.";
    const url = `${WHATSAPP_API_URL}?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleMouseDown = (e) => {
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragStart.x && !dragStart.y && dragStart.x !== 0 && dragStart.y !== 0) return;
      
      setIsDragging(true);
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragStart, position]);

  return (
    <div 
      ref={containerRef}
      className="fixed z-[60] md:bottom-6" 
      style={{ 
        bottom: isDragging ? 'auto' : bottomOffset,
        right: isDragging ? 'auto' : 'max(1.5rem, env(safe-area-inset-right, 1.5rem))',
        left: isDragging ? `${position.x}px` : 'auto',
        top: isDragging ? `${position.y}px` : 'auto',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >      {/* Tooltip */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 bg-gray-800 text-white rounded-lg px-4 py-2 mb-2 whitespace-nowrap text-sm shadow-lg animate-fadeIn z-[60]">
          Chat with us
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleWhatsAppClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => !isDragging && setIsOpen(true)}
        onMouseLeave={() => !isDragging && setIsOpen(false)}
        onTouchStart={() => setIsOpen(!isOpen)}
        className={`relative group bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex-shrink-0 ${
          isDragging ? 'scale-110' : ''
        }`}
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
