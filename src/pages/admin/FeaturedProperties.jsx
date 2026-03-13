import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';

function FeaturedProperties() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all properties
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery(
    'all-properties',
    async () => {
      const response = await api.get('/properties?limit=1000');
      return response.data?.properties || [];
    }
  );

  // Fetch featured properties
  const { data: featuredData, isLoading: featuredLoading } = useQuery(
    'featured-properties',
    async () => {
      const response = await api.get('/properties?is_featured=true');
      return response.data?.properties || [];
    }
  );

  // Toggle featured status
  const toggleFeaturedMutation = useMutation(
    (propertyId) => api.put(`/properties/${propertyId}/toggle-featured`),
    {
      onSuccess: (data) => {
        const isFeatured = data.data?.is_featured;
        toast.success(isFeatured ? 'Property marked as featured' : 'Property removed from featured');
        queryClient.invalidateQueries('featured-properties');
        queryClient.invalidateQueries('all-properties');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update property');
      }
    }
  );

  const properties = propertiesData || [];
  const featuredProperties = featuredData || [];

  // Filter properties
  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleFeatured = (propertyId) => {
    toggleFeaturedMutation.mutate(propertyId);
  };

  const isFeatured = (propertyId) => {
    return featuredProperties.some(p => p.id === propertyId);
  };

  const isLoading = propertiesLoading || featuredLoading || toggleFeaturedMutation.isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 to-midnight-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Featured Properties</h1>
          <p className="text-text-secondary">
            Manage properties displayed on the home page. Currently featuring <span className="text-gold font-semibold">{featuredProperties.length}</span> properties
          </p>
        </div>

        {/* Featured Properties Count */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-midnight-800 border border-midnight-700 rounded-lg p-6">
            <div className="text-text-secondary text-sm mb-2">Total Properties</div>
            <div className="text-3xl font-bold text-white">{properties.length}</div>
          </div>
          <div className="bg-midnight-800 border border-midnight-700 rounded-lg p-6">
            <div className="text-text-secondary text-sm mb-2">Featured Properties</div>
            <div className="text-3xl font-bold text-gold">{featuredProperties.length}</div>
          </div>
          <div className="bg-midnight-800 border border-midnight-700 rounded-lg p-6">
            <div className="text-text-secondary text-sm mb-2">Available to Feature</div>
            <div className="text-3xl font-bold text-green-400">{properties.length - featuredProperties.length}</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search properties by title or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        {/* Properties Grid */}
        <div className="bg-midnight-800 border border-midnight-700 rounded-lg shadow-xl p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin mb-4">
                  <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-text-secondary">Loading properties...</p>
              </div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">No properties found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-gold hover:text-gold-hover transition"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(property => (
                <div
                  key={property.id}
                  className={`rounded-lg border-2 transition-all ${
                    isFeatured(property.id)
                      ? 'border-gold bg-midnight-750'
                      : 'border-midnight-600 bg-midnight-700 hover:border-midnight-500'
                  }`}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-t-lg h-40">
                    <img
                      src={property.cover_image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop'}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop';
                      }}
                    />
                    {isFeatured(property.id) && (
                      <div className="absolute top-3 right-3 bg-gold text-midnight-950 px-3 py-1 rounded-full text-xs font-bold">
                        ★ Featured
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-1 line-clamp-2">{property.title}</h3>
                    <p className="text-text-secondary text-sm mb-3">{property.city}, {property.state}</p>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-text-secondary">
                      <div className="text-center">
                        <div className="font-semibold text-white">{property.area_sqft ? `${property.area_sqft}` : '-'}</div>
                        <div>Sqft</div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4 pb-4 border-b border-midnight-600">
                      <p className="text-gold font-bold">
                        ₹{(property.reserve_price / 100000).toFixed(1)}L
                      </p>
                    </div>

                    {/* Toggle Button */}
                    <button
                      onClick={() => handleToggleFeatured(property.id)}
                      disabled={toggleFeaturedMutation.isLoading}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                        isFeatured(property.id)
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gold hover:bg-gold-hover text-midnight-950'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {toggleFeaturedMutation.isLoading ? (
                        <span className="inline-block animate-spin">⟳</span>
                      ) : isFeatured(property.id) ? (
                        '✕ Remove from Featured'
                      ) : (
                        '★ Add to Featured'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured Properties List */}
        {featuredProperties.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Currently Featured ({featuredProperties.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProperties.map(property => (
                <div key={property.id} className="bg-midnight-800 border-2 border-gold rounded-lg p-4">
                  <img
                    src={property.cover_image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=150&h=100&fit=crop'}
                    alt={property.title}
                    className="w-full h-20 object-cover rounded mb-2"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=150&h=100&fit=crop';
                    }}
                  />
                  <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">{property.title}</h4>
                  <p className="text-text-secondary text-xs mb-2">{property.city}</p>
                  <button
                    onClick={() => handleToggleFeatured(property.id)}
                    className="w-full text-xs bg-red-600 hover:bg-red-700 text-white py-1 rounded transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeaturedProperties;
