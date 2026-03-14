import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: ''
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
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
      await register({
        phone: formData.phone,
        password: formData.password,
        full_name: formData.full_name
      });

      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      
      if (error.response?.status === 409) {
        setErrors(prev => ({
          ...prev,
          phone: error.response?.data?.message || 'Registration failed'
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
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-text-nav">Join DreamBid and start exploring properties</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-text-primary mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="John Doe"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-midnight-700 text-white placeholder-text-muted ${
                errors.full_name ? 'border-red-500' : 'border-midnight-600'
              }`}
            />
            {errors.full_name && (
              <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>
            )}
          </div>

          {/* Phone */}
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
              placeholder="5551234567"
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
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="At least 8 characters"
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

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-1">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter your password"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-midnight-700 text-white placeholder-text-muted ${
                errors.confirmPassword ? 'border-red-500' : 'border-midnight-600'
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold hover:bg-gold-hover text-midnight-950 font-semibold py-2 rounded-lg transition duration-200 disabled:bg-text-muted disabled:text-midnight-950"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-midnight-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-midnight-800 text-text-nav">Already have an account?</span>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center">
          <Link to="/login" className="text-gold hover:text-gold-hover font-medium">
            Sign In
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          By creating an account, you agree to our{' '}
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

export default SignUp;
