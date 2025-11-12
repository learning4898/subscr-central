import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signin = async (email: string, password: string) => {
    const response = await api.post('/auth/sign-in', { email, password });
    const { token, user: userData } = response.data.data;
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/sign-up', { name, email, password });
    const { token, user: userData } = response.data.data;
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/signin';
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
