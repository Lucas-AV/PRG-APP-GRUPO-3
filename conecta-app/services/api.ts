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

// ── Addresses ─────────────────────────────────────────────────────────────────

export interface Address {
  id: number;
  user_id: number;
  type: 'casa' | 'trabalho' | 'outro';
  zip_code?: string;
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  created_at: string;
}

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

  listAddresses: (userId: number, token: string) =>
    request<Address[]>(`/users/${userId}/addresses`, {}, token),

  addAddress: (userId: number, data: Omit<Address, 'id' | 'user_id' | 'created_at'>, token: string) =>
    request<Address>(`/users/${userId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateAddress: (userId: number, addressId: number, data: Partial<Omit<Address, 'id' | 'user_id' | 'created_at'>>, token: string) =>
    request<Address>(`/users/${userId}/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  deleteAddress: (userId: number, addressId: number, token: string) =>
    request<{ message: string }>(`/users/${userId}/addresses/${addressId}`, { method: 'DELETE' }, token),
};

// ── Cards ─────────────────────────────────────────────────────────────────────

export interface Card {
  id: number;
  brand: string;
  last_four: string;
  expiry_month: string;
  expiry_year: string;
  created_at: string;
}

export const cardsApi = {
  list: (userId: number, token: string) =>
    request<Card[]>(`/users/${userId}/cards`, {}, token),

  add: (userId: number, data: { brand: string; last_four: string; expiry_month: string; expiry_year: string }, token: string) =>
    request<Card>(`/users/${userId}/cards`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  remove: (userId: number, cardId: number, token: string) =>
    request<{ message: string }>(`/users/${userId}/cards/${cardId}`, { method: 'DELETE' }, token),
};

// ── Metrics ───────────────────────────────────────────────────────────────────

export interface ServiceMetrics {
  total_revenue: number;
  total_bookings: number;
  avg_rating: number;
  weekly_data: number[];
}

export const metricsApi = {
  get: (serviceId: number, token: string) =>
    request<ServiceMetrics>(`/services/${serviceId}/metrics`, {}, token),
};

// ── Reviews ───────────────────────────────────────────────────────────────────

export interface ServiceReview {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name: string;
}

export const reviewsApi = {
  list: (serviceId: number) =>
    request<ServiceReview[]>(`/services/${serviceId}/reviews`),

  create: (serviceId: number, data: { rating: number; comment?: string }, token: string) =>
    request<ServiceReview>(`/services/${serviceId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),
};

// ── Plans ─────────────────────────────────────────────────────────────────────

export interface Plan {
  id: number;
  name: string;
  role: 'cliente' | 'prestador';
  price: number;
  billing_cycle: string;
  features: string[];
}

export const plansApi = {
  list: (role: 'cliente' | 'prestador') =>
    request<Plan[]>(`/plans?role=${role}`),
};

// ── Subscriptions ─────────────────────────────────────────────────────────────

export interface Subscription {
  id?: number;
  plan_id?: number;
  plan_name: string;
  plan_price: number;
  status: string;
  features: string[];
  is_subscribed: boolean;
  started_at?: string;
  expires_at?: string;
}

export const subscriptionsApi = {
  get: (userId: number, token: string) =>
    request<Subscription>(`/users/${userId}/subscription`, {}, token),

  subscribe: (userId: number, planId: number, token: string) =>
    request<Subscription>(`/users/${userId}/subscription`, {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    }, token),
};

// ── Public Services ───────────────────────────────────────────────────────────

export interface PublicService {
  id: number;
  name: string;
  category?: string;
  price?: number;
  price_type: 'fixo' | 'a_partir_de';
  description?: string;
  provider_id: number;
  provider_name: string;
  avg_rating: number | null;
  review_count: number;
}

export const publicServicesApi = {
  list: (params?: { category?: string; q?: string }) => {
    const parts: string[] = [];
    if (params?.category) parts.push(`category=${encodeURIComponent(params.category)}`);
    if (params?.q) parts.push(`q=${encodeURIComponent(params.q)}`);
    const qs = parts.length ? `?${parts.join('&')}` : '';
    return request<PublicService[]>(`/services/public${qs}`);
  },
};

// ── Transactions ───────────────────────────────────────────────────────────────

export interface Transaction {
  id: number;
  user_id: number;
  service_name: string;
  provider_name?: string;
  amount: number;
  status: 'concluido' | 'pendente' | 'cancelado';
  paid_at: string;
}

export const transactionsApi = {
  list: (userId: number, token: string) =>
    request<Transaction[]>(`/users/${userId}/transactions`, {}, token),
};
