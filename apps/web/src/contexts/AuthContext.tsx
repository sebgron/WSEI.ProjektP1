'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { authAPI, User, LoginData, GuestLoginData } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginData) => Promise<void>;
  guestLogin: (credentials: GuestLoginData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF';

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const userData = await authAPI.me();
          setUser(userData);
        } catch {
          Cookies.remove('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginData) => {
    try {
      const response = await authAPI.login(credentials);
      Cookies.set('token', response.access_token, { expires: 7 });
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const guestLogin = async (credentials: GuestLoginData) => {
    try {
      const response = await authAPI.guestLogin(credentials);
      Cookies.set('token', response.access_token, { expires: 1 });
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    // Also remove Authentication cookie if used in older code
    Cookies.remove('Authentication');
    setUser(null);
    // Optional: Redirect to login handled by components or router
    // window.location.href = '/login'; 
  };

  const value = {
    user,
    loading,
    login,
    guestLogin,
    logout,
    isAuthenticated,
    isAdmin,
    isStaff
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
