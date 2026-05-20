import { API_BASE_URL } from '@/constants/config';

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? data.message ?? 'Erro desconhecido');
  return data as T;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'cliente' | 'prestador';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Service {
  id: number;
  user_id: number;
  name: string;
  category?: string;
  price?: number;
  price_type: 'fixo' | 'a_partir_de';
  duration?: string;
  description?: string;
  status: 'ativo' | 'rascunho';
  created_at: string;
}

export type ServiceInput = Pick<
  Service,
  'name' | 'category' | 'price' | 'price_type' | 'duration' | 'description' | 'status'
>;

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: string;
  }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── Services ──────────────────────────────────────────────────────────────────

export const servicesApi = {
  list: (token: string) =>
    request<Service[]>('/services', {}, token),

  get: (id: number, token: string) =>
    request<Service>(`/services/${id}`, {}, token),

  create: (data: Partial<ServiceInput>, token: string) =>
    request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  update: (id: number, data: Partial<ServiceInput>, token: string) =>
    request<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  remove: (id: number, token: string) =>
    request<{ message: string }>(`/services/${id}`, { method: 'DELETE' }, token),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersApi = {
  update: (id: number, data: { name?: string; email?: string; phone?: string }, token: string) =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  changePassword: (id: number, data: { current_password: string; new_password: string }, token: string) =>
    request<{ message: string }>(`/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  deleteAccount: (id: number, data: { password: string }, token: string) =>
    request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    }, token),
};
