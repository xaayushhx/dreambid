import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Properties API
export const propertiesAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
};

// Enquiries API
export const enquiriesAPI = {
  create: (data) => api.post('/enquiries', data),
};

// Interests API
export const interestsAPI = {
  track: (data) => api.post('/interests', data),
};

export default api;

