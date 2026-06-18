import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi, usersApi, User, onUnauthorized } from '@/services/api';

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
    onUnauthorized(() => {
      logout();
    });

    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        const storedUser = await SecureStore.getItemAsync('user');
        if (storedToken && storedUser) {
          let cleanToken = storedToken.trim();
          if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
            cleanToken = cleanToken.slice(1, -1);
          }
          if (cleanToken !== 'null' && cleanToken !== 'undefined') {
            setToken(cleanToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Limpa credenciais corrompidas do armazenamento
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
          }
        }
      } catch (e) {
        console.warn('Erro ao restaurar a sessão:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = async (newToken: string, newUser: User) => {
    let cleanToken = newToken;
    if (cleanToken && typeof cleanToken === 'string') {
      cleanToken = cleanToken.trim();
      if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
        cleanToken = cleanToken.slice(1, -1);
      }
    }
    await SecureStore.setItemAsync('token', cleanToken);
    await SecureStore.setItemAsync('user', JSON.stringify(newUser));
    setToken(cleanToken);
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

  const updateUser = async (updated: User & { token?: string }) => {
    const { token: newToken, ...userData } = updated;
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    setUser(userData);
    if (newToken) {
      await SecureStore.setItemAsync('token', newToken);
      setToken(newToken);
    }
  };

  const markOnboardingComplete = async () => {
    if (!user || !token) return;
    try {
      const updated = await usersApi.update(user.id, { onboarding_completed: true } as any, token);
      await updateUser(updated);
    } catch (e) {
      console.warn('Erro ao salvar onboarding_completed no backend:', e);
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
