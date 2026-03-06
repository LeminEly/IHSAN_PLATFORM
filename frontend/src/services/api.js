import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Si c'est un FormData, laisser axios définir le Content-Type automatiquement
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });
        localStorage.setItem("token", response.data.token);
        originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const auth = {
  // register accepte FormData ou JSON
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  verifyPhone: (data) => api.post("/auth/verify-phone", data),
  resendCode: (data) => api.post("/auth/resend-code", data),
  getMe: () => api.get("/auth/me"),
};

export const donor = {
  getNeeds: (params) => api.get("/donor/needs", { params }),
  getNeed: (id) => api.get(`/donor/needs/${id}`),
  fundNeed: (id, data) => api.post(`/donor/needs/${id}/fund`, data),
  getDonations: () => api.get("/donor/donations"),
  getDonationStats: () => api.get("/donor/donations/stats"),
  getReceipt: (id) => api.get(`/donor/donations/${id}/receipt`),
};

export const validator = {
  getStats: () => api.get("/validator/stats"),
  getNeeds: () => api.get("/validator/needs"),
  getToConfirm: () => api.get("/validator/needs/to-confirm"),
  createNeed: (data) => api.post("/validator/needs", data),
  confirmDelivery: (id, data) => {
    const formData = new FormData();
    if (data.photo) formData.append("proof_photo", data.photo);
    formData.append("proof_type", data.proof_type || "photo");
    return api.post(`/validator/needs/${id}/confirm`, formData);
  },
  registerBeneficiary: (data) => api.post("/validator/beneficiaries", data),
  getPartners: () => api.get("/validator/partners"),
};

export const partner = {
  getOrders: () => api.get("/partner/orders"),
  getOrder: (id) => api.get(`/partner/orders/${id}`),
  getStats: () => api.get("/partner/stats"),
  updateOrderStatus: (id, status) =>
    api.put(`/partner/orders/${id}/status`, { status }),
};

export const admin = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (params) => api.get("/admin/users", { params }),
  getPendingValidators: () => api.get("/admin/validators/pending"),
  approveValidator: (id, reason) =>
    api.put(`/admin/validators/${id}/approve`, { reason }),
  rejectValidator: (id, reason) =>
    api.put(`/admin/validators/${id}/reject`, { reason }),
  suspendValidator: (id, reason) =>
    api.put(`/admin/validators/${id}/suspend`, { reason }),
  getPendingPartners: () => api.get("/admin/partners/pending"),
  approvePartner: (id, reason) =>
    api.put(`/admin/partners/${id}/approve`, { reason }),
  rejectPartner: (id, reason) =>
    api.put(`/admin/partners/${id}/reject`, { reason }),
  recordSiteVisit: (id, data) => api.post(`/admin/partners/${id}/visit`, data),
  suspendUser: (id, reason) =>
    api.put(`/admin/users/${id}/suspend`, { reason }),
  activateUser: (id, reason) =>
    api.put(`/admin/users/${id}/activate`, { reason }),
};

export const publicApi = {
  getDashboard: (params) => api.get("/public/dashboard", { params }),
  getTransaction: (id) => api.get(`/public/transactions/${id}`),
  verifyHash: (hash) => api.get(`/public/verify/${hash}`),
  getMap: (params) => api.get("/public/map", { params }),
};

export default api;
