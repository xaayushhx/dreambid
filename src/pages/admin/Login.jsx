import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login({ email, password });
      const { token, user } = response;

      // Check if user is admin or staff
      if (user.role !== 'admin' && user.role !== 'staff') {
        toast.error('Access denied. Admin or staff access required.');
        setLoading(false);
        return;
      }

      toast.success('Login successful!');
      // Navigate to dashboard
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 to-midnight-900 flex flex-col">
      {/* Home Button */}
      <div className="p-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gold hover:text-gold-hover font-semibold transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 1.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414L4 8.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1V8.414l.293.293a1 1 0 001.414-1.414l-6-6z" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="card p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              {/* Logo/Icon */}
              <div className="flex justify-center">
                <img src="/Dreambid_logo2.svg" alt="DreamBid" className="w-16 h-16 shadow-dark-elevation" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Entity Login
              </h1>
              <p className="text-text-secondary text-sm sm:text-base">
                Access the DreamBid management portal
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="admin@dreambid.com"
                  />
                  <svg className="w-5 h-5 text-text-secondary absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                  <svg className="w-5 h-5 text-text-secondary absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Sign In
                  </span>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="pt-4 border-t border-midnight-700">
              <p className="text-center text-sm text-text-secondary">
                Demo Credentials:
                <br />
                <span className="font-semibold text-text-soft">admin@dreambid.com</span> / <span className="font-semibold text-text-soft">admin123</span>
              </p>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="mt-8 text-center text-sm text-text-secondary">
            <p>🔒 This is a secure admin area</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
