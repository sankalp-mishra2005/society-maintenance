const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = (isMultipart = false) => {
  const headers = {};
  const token = localStorage.getItem('society_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const api = {
  // Auth API
  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Complaints API
  getComplaints: async (params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    const res = await fetch(`${API_BASE_URL}/complaints?${query.toString()}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getComplaintById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  createComplaint: async (formData) => {
    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: getHeaders(true), // Multipart form-data
      body: formData
    });
    return res.json();
  },

  updateComplaint: async (id, formData) => {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'PUT',
      headers: getHeaders(true), // Multipart form-data
      body: formData
    });
    return res.json();
  },

  deleteComplaint: async (id) => {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  updateComplaintStatus: async (id, status, note) => {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, note })
    });
    return res.json();
  },

  updateComplaintPriority: async (id, priority) => {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}/priority`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ priority })
    });
    return res.json();
  },

  // Notices API
  getNotices: async () => {
    const res = await fetch(`${API_BASE_URL}/notices`, {
      headers: getHeaders()
    });
    return res.json();
  },

  createNotice: async (noticeData) => {
    const res = await fetch(`${API_BASE_URL}/notices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(noticeData)
    });
    return res.json();
  },

  deleteNotice: async (id) => {
    const res = await fetch(`${API_BASE_URL}/notices/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // User & Directory API
  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: getHeaders()
    });
    return res.json();
  },

  createUser: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  // Dashboard API
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Admin Dashboard API
  getAdminDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getSettings: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: getHeaders()
    });
    return res.json();
  },

  updateSettings: async (overdueThresholdDays) => {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ overdueThresholdDays })
    });
    return res.json();
  },

  getIntelligenceStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/intelligence`, {
      headers: getHeaders()
    });
    return res.json();
  },

  seedDatabase: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/seed`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  }
};
