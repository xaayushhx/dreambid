import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { propertiesAPI } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';
import { formatNumber } from '../../utils/formatNumber';
import toast from 'react-hot-toast';

function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: propertyData } = useQuery(
    ['property', id],
    () => propertiesAPI.getById(id),
    { enabled: isEdit }
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India',
    latitude: '',
    longitude: '',
    area_sqft: '',
    floors: '',
    reserve_price: '',
    auction_date: '',
    status: 'upcoming',
    is_featured: false,
    estimated_market_value: '',
    built_up_area: '',
    total_area: '',
    emd: '',
    possession_type: '',
    application_end_date: '',
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [coverImageId, setCoverImageId] = useState(null);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  useEffect(() => {
    if (propertyData?.data?.property) {
      const prop = propertyData.data.property;
      setFormData({
        title: prop.title || '',
        description: prop.description || '',
        property_type: prop.property_type || '',
        address: prop.address || '',
        city: prop.city || '',
        state: prop.state || '',
        zip_code: prop.zip_code || '',
        country: prop.country || 'India',
        latitude: prop.latitude || '',
        longitude: prop.longitude || '',
        area_sqft: prop.area_sqft || '',
        floors: prop.floors || '',
        reserve_price: prop.reserve_price || '',
        auction_date: prop.auction_date ? prop.auction_date.split('T')[0] : '',
        status: prop.status || 'upcoming',
        is_featured: prop.is_featured || false,
        estimated_market_value: prop.estimated_market_value || '',
        built_up_area: prop.built_up_area || '',
        total_area: prop.total_area || '',
        emd: prop.emd || '',
        possession_type: prop.possession_type || '',
        application_end_date: prop.application_end_date ? prop.application_end_date.split('T')[0] : '',
      });
      setExistingImages(prop.images || []);
      // Set first image as default cover image
      if (prop.images && prop.images.length > 0) {
        setCoverImageId(prop.images[0].id);
      }
    }
  }, [propertyData]);

  const createMutation = useMutation(
    (formDataToSend) => propertiesAPI.create(formDataToSend),
    {
      onSuccess: () => {
        toast.success('Property created successfully!');
        // Invalidate all property-related queries
        queryClient.invalidateQueries('properties');
        queryClient.invalidateQueries(['properties']);
        navigate('/admin/properties');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create property');
      },
    }
  );

  const updateMutation = useMutation(
    (formDataToSend) => propertiesAPI.update(id, formDataToSend),
    {
      onSuccess: () => {
        toast.success('Property updated successfully!');
        // Invalidate all property-related queries
        queryClient.invalidateQueries('properties');
        queryClient.invalidateQueries(['properties']);
        queryClient.invalidateQueries(['property', id]);
        navigate('/admin/properties');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update property');
      },
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 20) {
      toast.error('Maximum 20 images allowed');
      setImages(files.slice(0, 20));
    } else {
      setImages(files);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRemoveExistingImage = (imageId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
    setImagesToRemove(prev => [...prev, imageId]);
    // Clear cover image if it was the removed one
    if (coverImageId === imageId) {
      const remainingImages = existingImages.filter(img => img.id !== imageId);
      setCoverImageId(remainingImages.length > 0 ? remainingImages[0].id : null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert images to base64
      const imageDataArray = [];
      for (const image of images) {
        const base64Data = await fileToBase64(image);
        imageDataArray.push({
          data: base64Data,
          mimeType: image.type,
          name: image.name
        });
      }

      // Determine cover image
      let coverImageSelection = null;
      if (coverImageId) {
        if (typeof coverImageId === 'string' && coverImageId.startsWith('new-')) {
          // Cover is from new images
          const newImageIndex = parseInt(coverImageId.split('-')[1]);
          coverImageSelection = {
            type: 'new',
            index: newImageIndex
          };
        } else {
          // Cover is from existing images (edit mode)
          coverImageSelection = {
            type: 'existing',
            id: coverImageId
          };
        }
      }

      // Create submit data object
      const submitData = {
        ...formData,
        images: imageDataArray,
        ...(coverImageSelection && { coverImage: coverImageSelection }),
        ...(isEdit && {
          removeImageIds: imagesToRemove
        })
      };

      if (isEdit) {
        updateMutation.mutate(submitData);
      } else {
        createMutation.mutate(submitData);
      }
    } catch (error) {
      toast.error('Failed to process images');
      console.error('Image processing error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-900 to-midnight-950 p-6">
      <h1 className="text-3xl font-bold text-white mb-8">
        {isEdit ? 'Edit Property' : 'Add New Property'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-midnight-800 rounded-lg shadow-lg border border-midnight-700 p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 pb-3 border-b border-midnight-700">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Property Type
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">Select Type</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
                <option value="villa">Villa</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 pb-3 border-b border-midnight-700">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Address *
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                State *
              </label>
              <select
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">Select State</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                <option value="Chandigarh">Chandigarh</option>
                <option value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</option>
                <option value="Daman and Diu">Daman and Diu</option>
                <option value="Lakshadweep">Lakshadweep</option>
                <option value="Delhi">Delhi</option>
                <option value="Puducherry">Puducherry</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Zip Code
              </label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 pb-3 border-b border-midnight-700">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Area (sq ft)
              </label>
              <input
                type="number"
                name="area_sqft"
                value={formData.area_sqft}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Built-Up Area (sq ft)
              </label>
              <input
                type="number"
                step="0.01"
                name="built_up_area"
                value={formData.built_up_area}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Total Area (sq ft)
              </label>
              <input
                type="number"
                step="0.01"
                name="total_area"
                value={formData.total_area}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Floors
              </label>
              <input
                type="number"
                name="floors"
                value={formData.floors}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>
        </div>

        {/* Auction Details */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 pb-3 border-b border-midnight-700">Auction Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Reserve Price (₹) *
              </label>
              <input
                type="number"
                name="reserve_price"
                required
                value={formData.reserve_price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Estimated Market Value (₹)
              </label>
              <input
                type="number"
                step="0.01"
                name="estimated_market_value"
                value={formData.estimated_market_value}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                EMD - Earnest Money Deposit (₹)
              </label>
              <input
                type="number"
                step="0.01"
                name="emd"
                value={formData.emd}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Auction Date
              </label>
              <input
                type="date"
                name="auction_date"
                value={formData.auction_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Application End Date
              </label>
              <input
                type="date"
                name="application_end_date"
                value={formData.application_end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Possession Type
              </label>
              <select
                name="possession_type"
                value={formData.possession_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">Select Possession Type</option>
                <option value="Physical">Physical Possession</option>
                <option value="Virtual">Virtual Possession</option>
              </select>
            </div>
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="sold">Sold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 focus:ring-gold border-midnight-600 rounded"
              />
              <label className="ml-2 block text-sm text-text-primary">
                Featured Property
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 pb-3 border-b border-midnight-700">Images</h2>
          {existingImages.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-text-secondary mb-3">Existing Images:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden border-2 border-midnight-600 hover:border-gold transition-colors">
                      <img
                        src={img.image_data || getImageUrl(img.image_url)}
                        alt={`Property image`}
                        className="h-full w-full object-cover"
                      />
                      {coverImageId === img.id && (
                        <div className="absolute inset-0 bg-gold bg-opacity-30 flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-gold px-2 py-1 rounded">Cover</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex flex-col items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCoverImageId(img.id)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          coverImageId === img.id
                            ? 'bg-gold text-midnight-950'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {coverImageId === img.id ? 'Cover' : 'Set Cover'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img.id)}
                        className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          {images.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-text-secondary mb-3">
                {isEdit ? 'New Images to Add:' : 'Images to Upload:'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden border-2 border-gold border-dashed hover:border-gold transition-colors bg-midnight-700">
                      <img
                        src={img.data}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {coverImageId === `new-${index}` && (
                        <div className="absolute inset-0 bg-gold bg-opacity-30 flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-gold px-2 py-1 rounded">Cover</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex flex-col items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCoverImageId(`new-${index}`)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          coverImageId === `new-${index}`
                            ? 'bg-gold text-midnight-950'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {coverImageId === `new-${index}` ? 'Cover' : 'Set Cover'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImages(images.filter((_, i) => i !== index));
                          // Clear cover image if this was the selected cover
                          if (coverImageId === `new-${index}`) {
                            setCoverImageId(null);
                          }
                        }}
                        className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Add New Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-midnight-600 bg-midnight-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <div className="mt-2 flex justify-between text-sm">
              <p className="text-text-muted">You can select up to 20 images</p>
              <p className="text-text-primary font-medium">Images selected: {images.length} / 20</p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-midnight-700">
          <button
            type="button"
            onClick={() => navigate('/admin/properties')}
            className="px-4 py-2 border border-midnight-600 rounded-md text-text-primary hover:bg-midnight-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isLoading || updateMutation.isLoading}
            className="px-4 py-2 bg-gold text-midnight-950 rounded-md hover:bg-gold/90 disabled:opacity-50 font-medium transition-colors"
          >
            {createMutation.isLoading || updateMutation.isLoading
              ? 'Saving...'
              : isEdit
              ? 'Update Property'
              : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PropertyForm;
