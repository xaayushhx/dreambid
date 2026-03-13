import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function AdminBlogs() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editingBlog, setEditingBlog] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [configLoading, setConfigLoading] = useState(true);

  // Fetch blog configuration (categories and statuses)
  const { data: configData, isLoading: configIsLoading } = useQuery(
    'blog-config',
    async () => {
      const response = await api.get('/blogs/config/meta');
      return response.data.data || { categories: [], statuses: [] };
    },
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      onSuccess: (data) => {
        setCategories(data.categories || []);
        setStatuses(data.statuses || []);
        setConfigLoading(false);
      },
      onError: (err) => {
        console.error('Error fetching blog config:', err);
        setConfigLoading(false);
      }
    }
  );

  // Default status from dynamic data
  const defaultStatus = statuses.length > 0 ? statuses[0].value : 'draft';
  const defaultCategory = categories.length > 0 ? categories[0].value : 'buying';

  const [formData, setFormData] = useState({
    title: '',
    category: defaultCategory,
    author: '',
    excerpt: '',
    content: '',
    readTime: '',
    image: '',
    status: defaultStatus
  });

  // Fetch all blogs from API
  const { data: blogsData, isLoading, error } = useQuery(
    'blogs',
    async () => {
      const response = await api.get('/blogs');
      return response.data.data || [];
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      onError: (err) => {
        console.error('Error fetching blogs:', err);
        toast.error('Failed to fetch blogs');
      }
    }
  );

  const blogs = blogsData || [];

  const handleOpenForm = (blog = null) => {
    if (blog) {
      setFormData(blog);
      setImagePreview(blog.image);
      setEditingBlog(blog.id);
    } else {
      setFormData({
        title: '',
        category: defaultCategory,
        author: '',
        excerpt: '',
        content: '',
        readTime: '',
        image: '',
        status: defaultStatus
      });
      setImagePreview(null);
      setEditingBlog(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBlog(null);
    setImagePreview(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setFormData(prev => ({
          ...prev,
          image: base64String
        }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.excerpt || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingBlog) {
        // Update existing blog via API
        await api.put(`/blogs/${editingBlog}`, formData);
        toast.success('Blog updated successfully');
      } else {
        // Create new blog via API
        await api.post('/blogs', formData);
        toast.success('Blog created successfully');
      }

      // Invalidate and refetch blogs
      queryClient.invalidateQueries('blogs');
      handleCloseForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save blog';
      toast.error(errorMessage);
      console.error('Error saving blog:', error);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.delete(`/blogs/${id}`);
        toast.success('Blog deleted successfully');
        // Invalidate and refetch blogs
        queryClient.invalidateQueries('blogs');
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete blog';
        toast.error(errorMessage);
        console.error('Error deleting blog:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      buying: 'bg-blue-100 text-blue-800',
      investment: 'bg-purple-100 text-purple-800',
      market: 'bg-indigo-100 text-indigo-800',
      legal: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const getStatusLabel = (statusValue) => {
    const status = statuses.find(s => s.value === statusValue);
    return status ? status.label : statusValue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 to-midnight-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Blog Management</h1>
            <p className="text-text-secondary">Manage all blog posts</p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="w-full md:w-auto bg-gradient-to-r from-gold to-gold-hover text-midnight-950 px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold"
          >
            + Add New Blog
          </button>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-midnight-800 border border-midnight-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingBlog ? 'Edit Blog' : 'Create New Blog'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="text-text-secondary hover:text-white transition"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-midnight-700 border border-midnight-600 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="Blog title"
                    />
                  </div>

                  {/* Category & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-midnight-700 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Status *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-midnight-700 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
                      >
                        {statuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Author & Read Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Author *
                      </label>
                      <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-midnight-700 border border-midnight-600 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                        placeholder="Author name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Read Time
                      </label>
                      <input
                        type="text"
                        name="readTime"
                        value={formData.readTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-midnight-700 border border-midnight-600 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                        placeholder="e.g., 5 min read"
                      />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Excerpt *
                    </label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-2 bg-midnight-700 border border-midnight-600 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="Brief description of the blog post"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Content *
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows="6"
                      className="w-full px-4 py-2 bg-midnight-700 border border-midnight-600 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="Full blog content"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Blog Image
                    </label>
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mb-4">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-40 object-cover rounded-lg border border-midnight-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({
                              ...prev,
                              image: ''
                            }));
                          }}
                          className="mt-2 text-sm text-red-400 hover:text-red-300 transition"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}

                    {/* File Upload Input */}
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center px-4 py-3 bg-midnight-700 border border-midnight-600 border-dashed rounded-lg cursor-pointer hover:bg-midnight-650 transition">
                        <div className="text-center">
                          <svg className="mx-auto h-8 w-8 text-text-secondary mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12v12m0 0l-4-4m4 4l4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-white font-medium">Upload Image</p>
                          <p className="text-xs text-text-secondary">or paste URL below</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Image URL as Alternative */}
                    <div className="mt-3">
                      <p className="text-xs text-text-secondary mb-2">Or paste image URL:</p>
                      <input
                        type="url"
                        name="imageUrl"
                        value={formData.image}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            image: e.target.value
                          }));
                          if (e.target.value) {
                            setImagePreview(e.target.value);
                          }
                        }}
                        className="w-full px-4 py-2 bg-midnight-700 border border-midnight-600 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-gold to-gold-hover text-midnight-950 py-2 rounded-lg hover:shadow-lg transition font-semibold"
                    >
                      {editingBlog ? 'Update Blog' : 'Create Blog'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="flex-1 bg-midnight-700 text-text-secondary py-2 rounded-lg hover:bg-midnight-600 transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Blogs Table */}
        <div className="bg-midnight-800 border border-midnight-700 rounded-lg shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="text-text-secondary mb-4">Loading blogs...</div>
              <div className="inline-block animate-spin">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-400 mb-4">Error loading blogs</p>
              <button
                onClick={() => queryClient.invalidateQueries('blogs')}
                className="bg-gold text-midnight-950 px-4 py-2 rounded-lg hover:shadow-lg transition font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : blogs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-text-secondary mb-4">No blogs found</p>
              <button
                onClick={() => handleOpenForm()}
                className="bg-gold text-midnight-950 px-4 py-2 rounded-lg hover:shadow-lg transition font-semibold"
              >
                Create Your First Blog
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-midnight-700 border-b border-midnight-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Author</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map(blog => (
                    <tr key={blog.id} className="border-b border-midnight-700 hover:bg-midnight-750 transition">
                      <td className="px-6 py-4">
                        {blog.image ? (
                          <img 
                            src={blog.image} 
                            alt={blog.title}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1470114716159-e389f8712fda?w=50&h=50&fit=crop';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-midnight-700 rounded flex items-center justify-center text-text-secondary">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white font-medium max-w-xs truncate">{blog.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(blog.category)}`}>
                          {getCategoryLabel(blog.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary text-sm">{blog.author}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(blog.status)}`}>
                          {getStatusLabel(blog.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary text-sm">{blog.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenForm(blog)}
                            className="text-gold hover:text-gold-hover transition font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(blog.id, blog.title)}
                            className="text-red-500 hover:text-red-600 transition font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="hidden lg:grid grid-cols-3 gap-4 mt-8">
          <div className="bg-midnight-800 border border-midnight-700 rounded-lg p-6">
            <div className="text-text-secondary text-sm mb-2">Total Blogs</div>
            <div className="text-3xl font-bold text-white">{blogs.length}</div>
          </div>
          {statuses.filter(s => s.value === 'published').length > 0 && (
            <div className="bg-midnight-800 border border-midnight-700 rounded-lg p-6">
              <div className="text-text-secondary text-sm mb-2">{getStatusLabel('published')}</div>
              <div className="text-3xl font-bold text-green-400">{blogs.filter(b => b.status === 'published').length}</div>
            </div>
          )}
          {statuses.filter(s => s.value === 'draft').length > 0 && (
            <div className="bg-midnight-800 border border-midnight-700 rounded-lg p-6">
              <div className="text-text-secondary text-sm mb-2">{getStatusLabel('draft')}</div>
              <div className="text-3xl font-bold text-yellow-400">{blogs.filter(b => b.status === 'draft').length}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminBlogs;
