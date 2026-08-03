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

/**
 * Handle 401 — clear stale credentials and redirect to login.
 * This fixes the "Token invalid or expired" bug when switching accounts
 * or when the DB is re-seeded while a token is still in localStorage.
 */
function handleUnauthorized() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('at_token');
    localStorage.removeItem('at_user');
    // Only redirect if not already on the login page
    if (!window.location.pathname.startsWith('/auth/')) {
      window.location.href = '/auth/login';
    }
  }
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

  // Auto-logout on 401 — token is invalid, expired, or user deleted
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error(data.message || 'Session expired. Please login again.');
  }

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
  getChartData: (id) => apiFetch(`/assets/${id}/chart`),
};

// Transactions
export const transactionAPI = {
  buy: (assetId, tokenCount) => apiFetch('/transactions/buy', { method: 'POST', body: JSON.stringify({ assetId, tokenCount }) }),
  sell: (assetId, tokenCount) => apiFetch('/transactions/sell', { method: 'POST', body: JSON.stringify({ assetId, tokenCount }) }),
  sync: (assetId, tokenCount, txHash, type) => apiFetch('/transactions/sync', { method: 'POST', body: JSON.stringify({ assetId, tokenCount, txHash, type }) }),
  getMy: () => apiFetch('/transactions/my'),
  getPortfolio: () => apiFetch('/transactions/portfolio'),
};

// Admin
export const adminAPI = {
  getUsers: () => apiFetch('/admin/users'),
  getTransactions: () => apiFetch('/admin/transactions'),
  getStats: () => apiFetch('/admin/stats'),
};
