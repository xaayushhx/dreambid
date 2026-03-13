import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'
  
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({
        phone: formData.phone,
        password: formData.password
      });

      const userRole = response.user?.role;

      if (loginType === 'admin') {
        // Admin login
        if (userRole !== 'admin' && userRole !== 'staff') {
          toast.error('This account does not have admin privileges');
          setErrors(prev => ({
            ...prev,
            phone: 'Admin account required'
          }));
          return;
        }
        
        toast.success('Admin logged in successfully!');
        navigate('/admin/dashboard');
      } else {
        // User login
        if (userRole === 'admin' || userRole === 'staff') {
          toast.error('Please use Entity Login for admin accounts');
          setErrors(prev => ({
            ...prev,
            phone: 'Use Entity Login for admin'
          }));
          return;
        }
        
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      
      if (error.response?.status === 401) {
        setErrors(prev => ({
          ...prev,
          password: 'Invalid phone number or password'
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-950 to-midnight-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-midnight-800 rounded-lg shadow-2xl p-8 border border-midnight-700">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-text-nav">Sign in to your DreamBid account</p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex bg-midnight-700 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setLoginType('user')}
            className={`flex-1 py-2 rounded font-medium transition-colors text-sm ${
              loginType === 'user'
                ? 'bg-gold text-midnight-950'
                : 'text-text-nav hover:text-white'
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            className={`flex-1 py-2 rounded font-medium transition-colors text-sm ${
              loginType === 'admin'
                ? 'bg-gold text-midnight-950'
                : 'text-text-nav hover:text-white'
            }`}
          >
            Entity Login
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your 10-digit phone number"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-midnight-700 text-white placeholder-text-muted ${
                errors.phone ? 'border-red-500' : 'border-midnight-600'
              }`}
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                Password
              </label>
              <a href="#" className="text-sm text-gold hover:text-gold-hover">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-midnight-700 text-white placeholder-text-muted ${
                  errors.password ? 'border-red-500' : 'border-midnight-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-text-muted hover:text-text-nav"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold hover:bg-gold-hover text-midnight-950 font-semibold py-2 rounded-lg transition duration-200 disabled:bg-text-muted disabled:text-midnight-950"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-midnight-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-midnight-800 text-text-nav">Don't have an account?</span>
          </div>
        </div>

        {/* Signup Link */}
        <p className="text-center">
          <Link to="/signup" className="text-gold hover:text-gold-hover font-medium">
            Create Account
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          By signing in, you agree to our{' '}
          <a href="#" className="text-gold hover:text-gold-hover">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-gold hover:text-gold-hover">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
