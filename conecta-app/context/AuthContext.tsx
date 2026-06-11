import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi, User, GoogleNewUserResponse } from '@/services/api';

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
  loginWithGoogle: (access_token: string, role?: string) => Promise<User | GoogleNewUserResponse>;
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

  const loginWithGoogle = async (
    access_token: string,
    role?: string
  ): Promise<User | GoogleNewUserResponse> => {
    const result = await authApi.googleAuth({ access_token, role });
    if ('isNewUser' in result) return result;
    await persist(result.token, result.user);
    return result.user;
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
    if (!user) return;
    await SecureStore.setItemAsync(`onboarding_${user.id}`, 'true');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginWithGoogle, register, logout, updateUser, markOnboardingComplete }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
