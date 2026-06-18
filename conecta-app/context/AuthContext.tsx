import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi, User, usersApi } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updated: User) => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        const storedUser = await SecureStore.getItemAsync('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = async (newToken: string, newUser: User) => {
    await SecureStore.setItemAsync('token', newToken);
    await SecureStore.setItemAsync('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authApi.login(email, password);
    await persist(res.token, res.user);
    return res.user;
  };

  const register = async (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: string;
  }): Promise<User> => {
    const res = await authApi.register(data);
    await persist(res.token, res.user);
    return res.user;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (updated: User) => {
    await SecureStore.setItemAsync('user', JSON.stringify(updated));
    setUser(updated);
  };

  const markOnboardingComplete = async () => {
    if (!user || !token) return;
    try {
      const updatedUser = await usersApi.update(user.id, { onboarding_completed: 1 }, token);
      await updateUser(updatedUser);
    } catch (err) {
      console.error('Failed to update onboarding state in backend:', err);
    }
    await SecureStore.setItemAsync(`onboarding_${user.id}`, 'true');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser, markOnboardingComplete }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
