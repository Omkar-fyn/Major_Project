'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask');
      return;
    }
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    setWalletAddress(accounts[0]);
  };

  /**
   * Clear all auth state and localStorage.
   * Used on logout and when a stale token is detected.
   */
  const clearAuth = useCallback(() => {
    localStorage.removeItem('at_token');
    localStorage.removeItem('at_user');
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Validate the stored session by calling /api/auth/me.
   * If the token is stale (401), auto-clear credentials so the user
   * can login fresh. This fixes "Token invalid or expired" on account switch.
   */
  const validateSession = useCallback(async (savedToken) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      const data = await res.json();
      if (data.success && data.user) {
        // Token is valid — update state with fresh user data from DB
        setToken(savedToken);
        setUser(data.user);
        localStorage.setItem('at_user', JSON.stringify(data.user));
      } else {
        // Token was rejected — clear stale credentials
        clearAuth();
      }
    } catch (err) {
      // Network error — keep the cached user data but mark as potentially stale
      console.error('Session validation failed:', err);
      // Still set the token so the user isn't kicked out on network blips
      setToken(savedToken);
      const savedUser = localStorage.getItem('at_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, [clearAuth]);

  useEffect(() => {
    const savedToken = localStorage.getItem('at_token');
    if (savedToken) {
      // Validate the token against the server instead of blindly trusting localStorage
      validateSession(savedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [validateSession]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    localStorage.setItem('at_token', data.token);
    localStorage.setItem('at_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    localStorage.setItem('at_token', data.token);
    localStorage.setItem('at_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    clearAuth();
  };

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('at_token');
    if (!currentToken) return;
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('at_user', JSON.stringify(data.user));
      } else {
        // Token became invalid — clear session
        clearAuth();
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      signup, 
      logout, 
      refreshUser,
      walletAddress,
      connectWallet,
      isAdmin: user?.role === 'admin' 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;