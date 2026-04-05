import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { Link, useLocation } from 'react-router-dom';
import { propertiesAPI, interestsAPI } from '../../services/api';
import { shareProperty } from '../../utils/whatsapp';
import { getImageUrl } from '../../utils/imageUrl';
import { useShortlist } from '../../contexts/ShortlistContext';
import PropertyTypeDropdown from '../../components/PropertyTypeDropdown';

// Custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function Properties() {
  const location = useLocation();
  const { toggleShortlist, isShortlisted } = useShortlist();
  
  // Budget range mapping
  const budgetRanges = {
    '': { min: '', max: '' },
    '2000000': { min: 0, max: 2000000 },
    '4000000': { min: 2000000, max: 4000000 },
    '6000000': { min: 4000000, max: 6000000 },
    '10000000': { min: 6000000, max: 10000000 },
    '20000000': { min: 10000000, max: 20000000 },
    '50000000': { min: 20000000, max: 50000000 },
    '999999999': { min: 50000000, max: 999999999 },
  };

  // Initialize filters from location state if available
  const initialFilters = location.state?.filters || {
    city: '',
    property_type: [],
    budget: '',
  };
  
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('reserve_price');
  const [page, setPage] = useState(1);
  const limit = 12;

  // Debounce text inputs
  const debouncedCity = useDebounce(filters.city, 500);

  // Create query filters object with debounced values
  const queryFilters = useMemo(() => {
    const budgetRange = budgetRanges[filters.budget] || budgetRanges[''];
    return {
      city: debouncedCity,
      property_type: filters.property_type && filters.property_type.length > 0 
        ? filters.property_type.join(',') 
        : '',
      min_price: budgetRange.min !== '' ? budgetRange.min : '',
      max_price: budgetRange.max !== '' ? budgetRange.max : '',
    };
  }, [debouncedCity, filters.property_type, filters.budget]);

  const { data, isLoading, error } = useQuery(
    ['properties', queryFilters, page, sortBy],
    () => {
      const params = { page, limit, sort_by: sortBy };
      if (queryFilters.city) params.city = queryFilters.city;
      if (queryFilters.property_type) params.property_type = queryFilters.property_type;
      if (queryFilters.min_price !== '') params.min_price = queryFilters.min_price;
      if (queryFilters.max_price !== '') params.max_price = queryFilters.max_price;
      return propertiesAPI.getAll(params);
    }
  );

  // Debug logging
  useEffect(() => {
    console.log('=== PROPERTIES PAGE DEBUG ===');
    console.log('Query Data:', data);
    console.log('Is Loading:', isLoading);
    console.log('Error:', error);
    console.log('Properties Count:', properties.length);
  }, [data, isLoading, error]);

  const properties = data?.data?.data?.properties || [];
  const pagination = data?.data?.data?.pagination || {};

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleView = (propertyId) => {
    interestsAPI.track({ property_id: propertyId, interest_type: 'view' });
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-950 border border-red-700 rounded-lg p-4">
          <p className="text-red-200">Error loading properties: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-900 to-midnight-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Search Bar */}
        <div className="card p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Location/Borrower Search */}
            <div>
              <label className="label block mb-2">
                Search by Location, Borrower Name
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-3 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="e.g. Delhi, Noida, Gurugram"
                  className="w-full pl-10 pr-4 py-3 bg-midnight-800 border border-midnight-700 text-text-primary placeholder-text-muted rounded-input focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Property Type Multi-Select */}
            <div>
              <label className="label block mb-2">
                Property Type
              </label>
              <PropertyTypeDropdown
                value={filters.property_type}
                onChange={(newValue) => handleFilterChange('property_type', newValue)}
              />
            </div>

            {/* Budget */}
            <div>
              <label className="label block mb-2">
                Budget
              </label>
              <select
                value={filters.budget}
                onChange={(e) => handleFilterChange('budget', e.target.value)}
                className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 text-text-primary rounded-input focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition"
              >
                <option value="" className="bg-midnight-800 text-text-primary">Select</option>
                <option value="2000000" className="bg-midnight-800 text-text-primary">Under 20 Lakhs</option>
                <option value="4000000" className="bg-midnight-800 text-text-primary">20-40 Lakhs</option>
                <option value="6000000" className="bg-midnight-800 text-text-primary">40-60 Lakhs</option>
                <option value="10000000" className="bg-midnight-800 text-text-primary">60 Lakhs - 1 Crore</option>
                <option value="20000000" className="bg-midnight-800 text-text-primary">1-2 Crores</option>
                <option value="50000000" className="bg-midnight-800 text-text-primary">2-5 Crores</option>
                <option value="999999999" className="bg-midnight-800 text-text-primary">Above 5 Crores</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button 
                onClick={() => setPage(1)}
                className="w-full px-6 py-3 bg-gold text-midnight-950 rounded-btn hover:bg-gold-hover transition font-semibold text-sm"
              >
                Search
              </button>
            </div>
          </div>

          {/* Results info */}
          <p className="text-sm text-text-secondary mb-8">
            ({pagination.total || 0} Properties Found)
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">Loading properties...</p>
          </div>
        )}

        {/* Properties Grid */}
        {!isLoading && !error && (
          <>
            {properties.length === 0 ? (
              <div className="text-center py-12 card">
                <p className="text-text-secondary text-lg">No properties found matching your criteria.</p>
                <button
                  onClick={() => setFilters({ city: '', property_type: [], budget: '' })}
                  className="mt-4 px-4 py-2 bg-gold text-midnight-950 rounded-btn hover:bg-gold-hover transition text-sm font-medium"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {properties.map((property) => {
                    const imageUrl = property.cover_image_url || 
                      (property.images && property.images.length > 0 
                        ? (typeof property.images[0] === 'object' ? (property.images[0].image_data || property.images[0].image_url) : property.images[0])
                        : null);
                    const applicationDate = property.auction_date ? new Date(property.auction_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

                    return (
                      <div
                        key={property.id}
                        className="card overflow-hidden hover:shadow-2xl transition-all duration-300"
                      >
                        {/* Image Section */}
                        <div className="relative h-56 bg-midnight-800 overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={getImageUrl(imageUrl)}
                              alt={property.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%231F2A3D" width="400" height="300"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-midnight-800">
                              <span className="text-text-secondary">No Image</span>
                            </div>
                          )}
                          
                          {/* Property ID Badge */}
                          <div className="absolute top-4 left-4 bg-gold text-midnight-950 px-3 py-1 rounded-full text-xs font-semibold">
                            P{property.id}
                          </div>

                          {/* Wishlist Button */}
                          <button
                            onClick={() => toggleShortlist(property.id)}
                            className="absolute top-4 right-4 p-2 bg-midnight-800 rounded-full hover:bg-midnight-700 transition"
                          >
                            <svg className={`w-5 h-5 ${isShortlisted(property.id) ? 'fill-red-500 text-red-500' : 'text-text-muted'}`} viewBox="0 0 24 24">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
                        </div>

                        {/* Content Section */}
                        <div className="p-6">
                          {/* Title */}
                          <h3 className="text-lg md:text-2xl font-bold text-text-primary mb-3 line-clamp-2 min-h-14">
                            {property.title}
                          </h3>

                          {/* Location */}
                          <p className="text-text-secondary text-xs md:text-sm mb-4">
                            📍 {property.city}, {property.state}
                          </p>

                          {/* Property Details Grid */}
                          <div className="space-y-3 mb-4 pb-4 border-b border-midnight-700">
                            <div>
                              <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-1">Reserve Price</p>
                              <p className="text-lg md:text-2xl font-bold text-gold">
                                ₹{parseFloat(property.reserve_price).toLocaleString('en-IN')}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="text-text-secondary mb-1">Application Date</p>
                                <p className="font-semibold text-text-primary">{applicationDate}</p>
                              </div>
                              <div>
                                <p className="text-text-secondary mb-1">Possession Status</p>
                                <p className="font-semibold text-text-primary">Physical</p>
                              </div>
                            </div>
                          </div>

                          

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Link
                              to={`/properties/${property.id}`}
                              onClick={() => handleView(property.id)}
                              className="flex-1 px-4 py-3 bg-gold text-midnight-950 text-center rounded-btn hover:bg-gold-hover transition font-semibold text-sm btn-primary"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => {
                                shareProperty(property);
                                interestsAPI.track({ property_id: property.id, interest_type: 'share' });
                              }}
                              className="px-4 py-3 bg-status-live text-white rounded-btn hover:bg-green-600 transition flex items-center justify-center gap-2"
                              title="Share on WhatsApp"
                            >
                              <img src="/whatsapp.svg" alt="WhatsApp" className="w-5 h-5" />
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex flex-wrap justify-center items-center gap-4">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-6 py-3 bg-midnight-800 text-text-nav rounded-btn disabled:opacity-50 disabled:cursor-not-allowed hover:bg-midnight-700 transition-all font-medium"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-3 text-text-nav text-base">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="px-6 py-3 bg-midnight-800 text-text-nav rounded-btn disabled:opacity-50 disabled:cursor-not-allowed hover:bg-midnight-700 transition-all font-medium"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Properties;
