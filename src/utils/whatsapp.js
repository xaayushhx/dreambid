const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';
const WHATSAPP_API_URL = 'https://api.whatsapp.com/send';

export const shareProperty = (property) => {
  const message = `Check out this property: ${property.title}\n\nLocation: ${property.city}, ${property.state}\nReserve Price: ₹${parseFloat(property.reserve_price).toLocaleString('en-IN')}\nAuction Date: ${new Date(property.auction_date).toLocaleDateString()}\n\nView more: ${window.location.origin}/properties/${property.id}`;
  const url = `${WHATSAPP_API_URL}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

export const contactViaWhatsApp = (property, enquiry = null) => {
  let message = `Hello, I'm interested in this property:\n\nProperty ID: ${property.id}\nTitle: ${property.title}\nLocation: ${property.city}, ${property.state}\nReserve Price: ₹${parseFloat(property.reserve_price).toLocaleString('en-IN')}`;
  
  if (enquiry) {
    message += `\n\nMy Details:\nName: ${enquiry.name}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone}`;
    if (enquiry.message) {
      message += `\nMessage: ${enquiry.message}`;
    }
  }
  
  const url = `${WHATSAPP_API_URL}?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

