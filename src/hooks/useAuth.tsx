import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser } from '../features/types';
import { api } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'ticketwave_auth';

interface StoredAuth {
  token: string;
  user: AuthUser;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }
    const stored: StoredAuth = JSON.parse(raw);
    // Validate the token is still accepted by the backend rather than trusting stale localStorage.
    api.identity
      .profile(stored.token)
      .then((freshUser) => {
        setToken(stored.token);
        setUser(freshUser);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = (nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (email: string, password: string) => {
    const { token: newToken, user: newUser } = await api.identity.login(email, password);
    persist(newToken, newUser);
  };

  const register = async (email: string, name: string, password: string) => {
    await api.identity.register(email, name, password);
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
