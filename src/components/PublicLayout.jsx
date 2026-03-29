import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNavigation from './BottomNavigation';
import { WhatsAppFloatContext } from './WhatsAppFloat';

function PublicLayout() {
  return (
    <WhatsAppFloatContext.Provider value="calc(4rem + env(safe-area-inset-bottom, 0))">
      <div className="min-h-screen bg-midnight-900 flex flex-col pt-safe">
        <Navbar />
        <main className="relative flex-grow md:pb-0" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0))' }}><Outlet /></main>
        <BottomNavigation />
      <footer className="hidden lg:block bg-gradient-to-b from-midnight-900 to-midnight-950 text-white py-12 md:py-16 border-t border-midnight-700">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="text-xl font-semibold">Dream<span className="text-red-500">Bid</span></span>
              </div>
              <p className="text-text-secondary text-sm">Your trusted platform for premium property auctions with transparent bidding.</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-text-secondary hover:text-gold transition-colors text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/properties" className="text-text-secondary hover:text-gold transition-colors text-sm">
                    Properties
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-text-secondary hover:text-gold transition-colors text-sm">
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-text-secondary hover:text-gold transition-colors text-sm">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Information</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#buying-process" className="text-text-secondary hover:text-gold transition-colors text-sm">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-secondary hover:text-gold transition-colors text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-secondary hover:text-gold transition-colors text-sm">
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:dreambidproperties01@gmail.com" className="text-text-secondary hover:text-gold transition-colors text-sm">
                    Email: dreambidproperties01@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+919999999999" className="text-text-secondary hover:text-gold transition-colors text-sm">
                    Phone: +91 9999 999 999
                  </a>
                </li>
                <li className="text-text-secondary text-sm">
                  Available 24/7 for property enquiries
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-midnight-700 pt-8">
            {/* Social Links */}
            <div className="flex justify-center gap-6 mb-6">
              <a href="#" className="text-text-secondary hover:text-gold transition-colors" title="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-text-secondary hover:text-gold transition-colors" title="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 002.856-3.915 10 10 0 01-2.856.856 5 5 0 00-2.182-2.182c-1.144-.583-2.382-.583-3.626 0-2.285 1.17-3.76 3.681-3.76 6.412 0 .467.052.926.152 1.373-4.032-.196-7.812-2.247-10.382-5.309a5 5 0 001.532 6.659A5 5 0 012 9.85v.063c0 2.281 1.623 4.323 3.834 4.769a5 5 0 01-2.26.086c.64 1.977 2.447 3.446 4.494 3.476a10.04 10.04 0 01-5.953 2.055 10 10 0 006.167 1.793c7.41 0 11.446-6.288 11.446-11.74 0-.179-.004-.358-.013-.534a8.172 8.172 0 002.033-2.083z"/>
                </svg>
              </a>
              <a href="#" className="text-text-secondary hover:text-gold transition-colors" title="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.736 0-9.646h3.554v1.364c.43-.664 1.199-1.608 2.926-1.608 2.144 0 3.748 1.4 3.748 4.413v5.477zM5.337 9.433c-1.144 0-1.915-.762-1.915-1.715 0-.957.767-1.715 1.964-1.715 1.192 0 1.910.758 1.938 1.715 0 .953-.746 1.715-1.987 1.715zm1.946 11.019H3.391V9.956h3.892v10.496zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                </svg>
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center border-t border-midnight-700 pt-8">
              <p className="text-text-secondary text-sm">
                © {new Date().getFullYear()} DreamBid. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </WhatsAppFloatContext.Provider>
  );
}

export default PublicLayout;

