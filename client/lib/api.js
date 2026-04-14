const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('at_token');
  }
  return null;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  };

  // Don't set Content-Type for FormData (let browser set boundary)
  if (!(options.body instanceof FormData)) {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  }

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Auth
export const authAPI = {
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (name, email, password) => apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  getMe: () => apiFetch('/auth/me'),
};

// Assets
export const assetAPI = {
  getAll: (params = '') => apiFetch(`/assets${params ? '?' + params : ''}`),
  getOne: (id) => apiFetch(`/assets/${id}`),
  create: (formData) => apiFetch('/assets', { method: 'POST', body: formData }),
};

// Transactions
export const transactionAPI = {
  buy: (assetId, tokenCount) => apiFetch('/transactions/buy', { method: 'POST', body: JSON.stringify({ assetId, tokenCount }) }),
  getMy: () => apiFetch('/transactions/my'),
  getPortfolio: () => apiFetch('/transactions/portfolio'),
};

// Admin
export const adminAPI = {
  getUsers: () => apiFetch('/admin/users'),
  getTransactions: () => apiFetch('/admin/transactions'),
  getStats: () => apiFetch('/admin/stats'),
};
