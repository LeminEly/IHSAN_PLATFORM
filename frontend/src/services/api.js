import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyPhone: (data) => api.post('/auth/verify-phone', data),
  getMe: () => api.get('/auth/me')
};

export const donor = {
  getNeeds: (params) => api.get('/donor/needs', { params }),
  getNeed: (id) => api.get(`/donor/needs/${id}`),
  fundNeed: (id, data) => api.post(`/donor/needs/${id}/fund`, data),
  getDonations: () => api.get('/donor/donations'),
  getReceipt: (id) => api.get(`/donor/donations/${id}/receipt`)
};

export const validator = {
  getStats: () => api.get('/validator/stats'),
  getNeeds: () => api.get('/validator/needs'),
  createNeed: (data) => api.post('/validator/needs', data),
  getToConfirm: () => api.get('/validator/needs/to-confirm'),
  confirmDelivery: (id, data) => {
    const formData = new FormData();
    formData.append('proof_photo', data.photo);
    formData.append('proof_type', data.proof_type);
    return api.post(`/validator/needs/${id}/confirm`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  registerBeneficiary: (data) => api.post('/validator/beneficiaries', data)
};

export const partner = {
  getOrders: () => api.get('/partner/orders'),
  getStats: () => api.get('/partner/stats'),
  updateOrderStatus: (id, status) => api.put(`/partner/orders/${id}/status`, { status })
};

export const admin = {
  getStats: () => api.get('/admin/stats'),
  getPendingValidators: () => api.get('/admin/validators/pending'),
  approveValidator: (id, reason) => api.put(`/admin/validators/${id}/approve`, { reason }),
  rejectValidator: (id, reason) => api.put(`/admin/validators/${id}/reject`, { reason }),
  getPendingPartners: () => api.get('/admin/partners/pending'),
  approvePartner: (id, reason) => api.put(`/admin/partners/${id}/approve`, { reason }),
  rejectPartner: (id, reason) => api.put(`/admin/partners/${id}/reject`, { reason }),
  recordSiteVisit: (id, data) => api.post(`/admin/partners/${id}/visit`, data),
  suspendUser: (id, reason) => api.put(`/admin/users/${id}/suspend`, { reason }),
  activateUser: (id, reason) => api.put(`/admin/users/${id}/activate`, { reason })
};

export const publicApi = {
  getDashboard: (params) => api.get('/public/dashboard', { params }),
  getTransaction: (id) => api.get(`/public/transactions/${id}`),
  verifyHash: (hash) => api.get(`/public/verify/${hash}`),
  getMap: (params) => api.get('/public/map', { params })
};

export default api;