import { IUserResponse, IAuthResponse, ILoginData, IRegisterData, GuestLoginDto } from '@turborepo/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Re-export types
export type User = IUserResponse;
export type AuthResponse = IAuthResponse;
export type LoginData = ILoginData;
export type RegisterData = IRegisterData;
export type GuestLoginData = GuestLoginDto;

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = getCookie('Authentication') || getCookie('accessToken') || getCookie('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Usuwamy początkowy slash, żeby uniknąć podwójnych //
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  try {
    const response = await fetch(`${API_URL}/${cleanEndpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      console.warn("Unauthorized - Token expired or invalid");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    if (response.status === 204) return {} as T;

    return response.json();
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
}

// ============= AUTH API =============

export const authAPI = {
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  guestLogin: async (credentials: GuestLoginData): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('auth/guest-login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
  },

  register: async (userData: RegisterData): Promise<User> => {
    return apiFetch<User>('auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  me: async (): Promise<User> => {
    return apiFetch<User>('auth/me');
  },
};
