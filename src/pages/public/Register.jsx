import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from 'react-query';
import PropertyTypeDropdown from '../../components/PropertyTypeDropdown';
import api from '../../services/api';
import toast from 'react-hot-toast';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    requirements: [
      {
        preferredCity: '',
        budget: '',
        propertyType: [],
        requirementType: 'immediate'
      }
    ]
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activeRequirementTab, setActiveRequirementTab] = useState(0);

  // Mutation for submitting registration
  const registerMutation = useMutation(
    (data) => api.post('/user-registrations', data),
    {
      onSuccess: () => {
        toast.success('Registration successful! We will contact you soon.');
        navigate('/');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    }
  );

  const validateForm = () => {
    const newErrors = {};
    
    // Basic Details Validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber.replace(/\s/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid 10-digit contact number';
    }

    // Requirements Validation
    formData.requirements.forEach((req, index) => {
      if (!req.preferredCity.trim()) {
        newErrors[`preferredCity_${index}`] = 'Preferred city is required';
      }
      if (!req.budget) {
        newErrors[`budget_${index}`] = 'Budget is required';
      }
      if (!Array.isArray(req.propertyType) || req.propertyType.length === 0) {
        newErrors[`propertyType_${index}`] = 'Property type is required';
      }
    });

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

  const handleRequirementChange = (index, field, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = {
      ...newRequirements[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
    
    // Clear error when user starts typing
    const errorKey = `${field}_${index}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [
        ...prev.requirements,
        {
          preferredCity: '',
          budget: '',
          propertyType: [],
          requirementType: 'immediate'
        }
      ]
    }));
    setActiveRequirementTab(formData.requirements.length);
  };

  const removeRequirement = (index) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        requirements: newRequirements
      }));
      if (activeRequirementTab >= newRequirements.length) {
        setActiveRequirementTab(newRequirements.length - 1);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!acceptedTerms) {
      setErrors({ submit: 'Please accept the Terms & Conditions and Privacy Policy to continue.' });
      return;
    }

    registerMutation.mutate(formData);
  };

  const budgetOptions = [
    'Under 20 Lakhs',
    '20-40 Lakhs',
    '40-60 Lakhs',
    '60 Lakhs - 1 Crore',
    '1-2 Crores',
    '2-5 Crores',
    'Above 5 Crores'
  ];

  const propertyTypeOptions = [
    'Residential Apartment',
    'Independent House',
    'Villa',
    'Plot/Land',
    'Commercial Office',
    'Retail Shop',
    'Warehouse',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 to-midnight-900">
      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Forms (75%) */}
          <div className="flex-1 space-y-8">
            {/* Basic Details Section */}
            <div className="bg-midnight-800 rounded-2xl shadow-sm border border-midnight-700 p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-text-primary mb-2">Basic Details</h2>
                <p className="text-sm text-text-soft">Fields marked with * are mandatory.</p>
              </div>

              {errors.submit && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-xl">
                  <p className="text-red-400">{errors.submit}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 text-sm bg-midnight-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all duration-200 ${
                      errors.name ? 'border-red-500 bg-red-900/20' : 'border-midnight-600'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-text-primary mb-2">
                    Contact Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 text-sm bg-midnight-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all duration-200 ${
                      errors.contactNumber ? 'border-red-500 bg-red-900/20' : 'border-midnight-600'
                    }`}
                    placeholder="Enter your 10-digit mobile number"
                  />
                  {errors.contactNumber && (
                    <p className="mt-1 text-xs text-red-400">{errors.contactNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Requirement Details Section */}
            <div className="bg-midnight-800 rounded-2xl shadow-sm border border-midnight-700 p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-text-primary mb-2">Requirement Details</h2>
                <p className="text-sm text-text-soft">Fields marked with * are mandatory.</p>
              </div>

              {/* Requirement Tabs */}
              <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  {formData.requirements.map((req, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveRequirementTab(index)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeRequirementTab === index
                          ? 'bg-gold text-midnight-950'
                          : 'bg-midnight-700 text-text-secondary hover:bg-midnight-600'
                      }`}
                    >
                      Requirement {index + 1}
                      {formData.requirements.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRequirement(index);
                          }}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={addRequirement}
                    className="px-3 py-2 text-sm font-medium text-gold bg-gold/10 rounded-lg hover:bg-gold/20 transition-all duration-200"
                  >
                    + Add Requirement
                  </button>
                </div>
              </div>

              {/* Requirement Form */}
              {formData.requirements.map((requirement, index) => (
                <div
                  key={index}
                  className={`${activeRequirementTab === index ? 'block' : 'hidden'}`}
                >
                  <div className="space-y-6">
                    {/* Preferred City / Locality */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Preferred City / Locality <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={requirement.preferredCity}
                        onChange={(e) => handleRequirementChange(index, 'preferredCity', e.target.value)}
                        className={`w-full px-4 py-3 text-sm bg-midnight-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all duration-200 ${
                          errors[`preferredCity_${index}`] ? 'border-red-500 bg-red-900/20' : 'border-midnight-600'
                        }`}
                        placeholder="Enter preferred city or locality"
                      />
                      {errors[`preferredCity_${index}`] && (
                        <p className="mt-1 text-xs text-red-400">{errors[`preferredCity_${index}`]}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Budget */}
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Budget <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={requirement.budget}
                          onChange={(e) => handleRequirementChange(index, 'budget', e.target.value)}
                          className={`w-full px-4 py-3 text-sm bg-midnight-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all duration-200 ${
                            errors[`budget_${index}`] ? 'border-red-500 bg-red-900/20' : 'border-midnight-600'
                          }`}
                        >
                          <option value="">Select Budget</option>
                          {budgetOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        {errors[`budget_${index}`] && (
                          <p className="mt-1 text-xs text-red-400">{errors[`budget_${index}`]}</p>
                        )}
                      </div>

                      {/* Property Type */}
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Property Type <span className="text-red-400">*</span>
                        </label>
                        <PropertyTypeDropdown
                          value={requirement.propertyType}
                          onChange={(value) => handleRequirementChange(index, 'propertyType', value)}
                        />
                        {errors[`propertyType_${index}`] && (
                          <p className="mt-1 text-xs text-red-400">{errors[`propertyType_${index}`]}</p>
                        )}
                      </div>
                    </div>

                    {/* Requirement Type */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3">
                        Requirement Type <span className="text-red-400">*</span>
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`requirementType_${index}`}
                            value="immediate"
                            checked={requirement.requirementType === 'immediate'}
                            onChange={(e) => handleRequirementChange(index, 'requirementType', e.target.value)}
                            className="w-4 h-4 text-gold border-midnight-600 focus:ring-gold"
                          />
                          <span className="ml-2 text-sm text-text-secondary">Immediate</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`requirementType_${index}`}
                            value="future"
                            checked={requirement.requirementType === 'future'}
                            onChange={(e) => handleRequirementChange(index, 'requirementType', e.target.value)}
                            className="w-4 h-4 text-gold border-midnight-600 focus:ring-gold"
                          />
                          <span className="ml-2 text-sm text-text-secondary">Future</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Action Panel (25%) */}
          <div className="lg:w-[320px] lg:sticky lg:top-8 lg:h-fit">
            <div className="bg-midnight-800 rounded-2xl shadow-sm border border-midnight-700 p-6">
              <div className="space-y-6">
                {/* Terms & Conditions */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-gold border-midnight-600 rounded focus:ring-gold"
                  />
                  <label htmlFor="terms" className="text-sm text-text-secondary leading-tight">
                    By continuing, you accept the <span className="text-gold font-medium">Terms & Conditions</span> and <span className="text-gold font-medium">Privacy Policy</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleSubmit}
                    disabled={registerMutation.isLoading || !acceptedTerms}
                    className="w-full px-6 py-3 bg-gold text-midnight-950 rounded-xl hover:bg-gold/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registerMutation.isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-midnight-950 border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit'
                    )}
                  </button>
                  
                  <button
                    onClick={() => navigate('/')}
                    className="w-full px-6 py-3 bg-midnight-700 text-text-primary rounded-xl hover:bg-midnight-600 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>

                {/* Info Section */}
                <div className="pt-4 border-t border-midnight-700">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-text-primary mb-1 text-sm">What happens next?</h3>
                      <p className="text-text-secondary text-xs leading-relaxed">
                        Once you submit your requirements, our team will review your information and contact you within 24-48 hours to discuss your property needs in detail.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
