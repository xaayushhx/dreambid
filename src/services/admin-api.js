import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Properties API
export const propertiesAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data, {
    headers: { 'Content-Type': 'application/json' },
  }),
  update: (id, data) => api.put(`/properties/${id}`, data, {
    headers: { 'Content-Type': 'application/json' },
  }),
  delete: (id) => api.delete(`/properties/${id}`),
  uploadPdf: (id, formData) => api.post(`/properties/${id}/pdf`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Enquiries API
export const enquiriesAPI = {
  getAll: (params) => api.get('/enquiries', { params }),
  create: (data) => api.post('/enquiries', data),
  updateStatus: (id, status) => api.put(`/enquiries/${id}/status`, { status }),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/user/all', { params }),
  getById: (id) => api.get(`/user/${id}`),
  updateStatus: (id, is_active) => api.put(`/user/${id}/status`, { is_active }),
  updateRole: (id, role) => api.put(`/user/${id}/role`, { role }),
};

// Interests API
export const interestsAPI = {
  track: (data) => api.post('/interests', data),
  getStats: (propertyId) => api.get(`/interests/stats/${propertyId}`),
};

// User Registrations API
export const userRegistrationsAPI = {
  getAll: (params) => api.get('/user-registrations', { params }),
  getById: (id) => api.get(`/user-registrations/${id}`),
  create: (data) => api.post('/user-registrations', data),
};

export default api;

