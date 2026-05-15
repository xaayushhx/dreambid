import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    // Add token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.warn('Unauthorized: token may be expired or invalid');
      localStorage.removeItem('token');
      
      // Redirect to login if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    if (error.response?.status === 403) {
      console.warn('Access Forbidden: insufficient permissions');
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.post('/auth/change-password', data),
  verifyToken: () => api.post('/auth/verify'),
};

// Activity API endpoints
export const activityAPI = {
  saveActivity: (data) => api.post('/activity/save', data),
  getUserActivity: (userId, limit = 50, offset = 0) =>
    api.get(`/activity/user/${userId}`, { params: { limit, offset } }),
  getUserStats: (userId, daysBack = 30) =>
    api.get(`/activity/stats/user/${userId}`, { params: { daysBack } }),
  getAllActivities: (limit = 50, offset = 0) =>
    api.get('/activity/all', { params: { limit, offset } }),
  getActivitiesByCategory: (category, limit = 50, offset = 0) =>
    api.get(`/activity/category/${category}`, { params: { limit, offset } }),
  getActivityStats: (daysBack = 30) =>
    api.get('/activity/stats', { params: { daysBack } }),
};

export const propertiesAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (formData) => api.post('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/properties/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/properties/${id}`),
  uploadPdf: (id, formData) => api.post(`/properties/${id}/pdf`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const enquiriesAPI = {
  create: (data) => {
    // If FormData, use multipart/form-data; otherwise use JSON
    if (data instanceof FormData) {
      return api.post('/enquiries', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/enquiries', data);
  },
  getAll: (params) => api.get('/enquiries', { params }),
  updateStatus: (id, status) => api.put(`/enquiries/${id}/status`, { status }),
};

export const contactAPI = {
  submit: (formData) => api.post('/enquiries/contact', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const interestsAPI = {
  track: (data) => api.post('/interests', data),
  getStats: (propertyId) => api.get(`/interests/stats/${propertyId}`),
};

export default api;