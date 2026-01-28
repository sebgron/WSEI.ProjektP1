'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { authAPI, User, LoginData, GuestLoginData } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginData) => Promise<User>;
  guestLogin: (credentials: GuestLoginData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { usePathname } from 'next/navigation';



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF';

  useEffect(() => {
    const initAuth = async () => {
      let tokenName = 'token';
      if (pathname?.startsWith('/admin') || pathname?.startsWith('/staff')) tokenName = 'admin_token';
      else if (pathname?.startsWith('/guest')) tokenName = 'guest_token';

      const token = Cookies.get(tokenName) || Cookies.get('token');

      if (token) {
        try {
          const userData = await authAPI.me();
          setUser(userData);
        } catch {
          Cookies.remove(tokenName);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, [pathname]);

  const login = async (credentials: LoginData): Promise<User> => {
    try {
      const response = await authAPI.login(credentials);

      // Determine token name based on role
      if (response.user.role === 'USER') {
        Cookies.set('guest_token', response.access_token, { expires: 7 });
      } else {
        Cookies.set('admin_token', response.access_token, { expires: 7 });
      }

      // Legacy cleanup
      Cookies.remove('token');

      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const guestLogin = async (credentials: GuestLoginData) => {
    try {
      const response = await authAPI.guestLogin(credentials);
      Cookies.set('guest_token', response.access_token, { expires: 7 }); // Bump to 7 days
      // Legacy cleanup
      Cookies.remove('token');

      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    if (pathname?.startsWith('/admin')) Cookies.remove('admin_token');
    else if (pathname?.startsWith('/guest')) Cookies.remove('guest_token');

    Cookies.remove('token');
    Cookies.remove('Authentication');
    setUser(null);
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
