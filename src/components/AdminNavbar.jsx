import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    closeMenu();
  };

  return (
    <nav className="bg-gradient-to-b from-midnight-950 to-midnight-900 shadow-dark-elevation sticky top-0 z-50 border-b border-midnight-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <Link to="/admin/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/Dreambid_logo2.svg" alt="DreamBid" className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="text-lg sm:text-xl font-bold text-gold hover:text-gold-hover transition-colors hidden sm:inline">DreamBid Admin</span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-text-nav hover:text-gold transition-colors">
                Home
              </Link>
              <Link to="/admin/dashboard" className="text-text-nav hover:text-gold transition-colors">
                Dashboard
              </Link>
              <Link to="/admin/properties" className="text-text-nav hover:text-gold transition-colors">
                Properties
              </Link>
              <Link to="/admin/featured" className="text-text-nav hover:text-gold transition-colors">
                Featured
              </Link>
              <Link to="/admin/enquiries" className="text-text-nav hover:text-gold transition-colors">
                Enquiries
              </Link>
              <Link to="/admin/registrations" className="text-text-nav hover:text-gold transition-colors">
                Registrations
              </Link>
              <Link to="/admin/blogs" className="text-text-nav hover:text-gold transition-colors">
                Blogs
              </Link>
              <Link to="/admin/users" className="text-text-nav hover:text-gold transition-colors">
                Users
              </Link>
            </div>
          </div>

          {/* Desktop User Menu and Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* Desktop User Info and Logout */}
            <div className="hidden md:flex items-center space-x-4">
              {user && (
                <span className="text-xs sm:text-sm text-text-secondary">
                  {user.full_name} ({user.role})
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-text-nav hover:text-gold px-3 py-1 rounded hover:bg-midnight-800 transition-colors text-sm"
              >
                Logout
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-text-nav hover:text-gold hover:bg-midnight-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-midnight-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={closeMenu}
              className="text-text-nav hover:text-gold hover:bg-midnight-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/admin/dashboard"
              onClick={closeMenu}
              className="text-text-nav hover:text-gold hover:bg-midnight-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/properties"
              onClick={closeMenu}
              className="text-text-nav hover:text-gold hover:bg-midnight-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Properties
            </Link>
            <Link
              to="/admin/featured"
              onClick={closeMenu}
              className="text-text-nav hover:text-gold hover:bg-midnight-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Featured
            </Link>
            <Link
              to="/admin/enquiries"
              onClick={closeMenu}
              className="text-text-nav hover:text-gold hover:bg-midnight-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Enquiries
            </Link>
            <Link
              to="/admin/registrations"
              onClick={closeMenu}
              className="text-text-nav hover:text-gold hover:bg-midnight-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Registrations
            </Link>
            <Link
              to="/admin/blogs"
              onClick={closeMenu}
              className="text-text-nav hover:text-gold hover:bg-midnight-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Blogs
            </Link>
            <Link
              to="/admin/users"
              onClick={closeMenu}
              className="text-text-nav hover:text-gold hover:bg-midnight-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Users
            </Link>
            
            {/* Mobile User Info */}
            {user && (
              <div className="px-3 py-2 text-xs text-gray-600 border-t border-gray-100 mt-2">
                {user.full_name} ({user.role})
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600 hover:bg-red-50 block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors mt-2"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default AdminNavbar;
