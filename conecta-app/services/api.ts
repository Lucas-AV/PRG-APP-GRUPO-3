import { API_BASE_URL } from '@/constants/config';

let onUnauthorizedCallback: (() => void) | null = null;

export function onUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token && token !== 'null' && token !== 'undefined') {
    let cleanToken = token.trim();
    if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
      cleanToken = cleanToken.slice(1, -1);
    }
    headers['Authorization'] = `Bearer ${cleanToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      if (onUnauthorizedCallback) onUnauthorizedCallback();
    }
    throw new Error(data.error ?? data.message ?? 'Erro desconhecido');
  }
  return data as T;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'cliente' | 'prestador';
  avatar?: string;
  onboarding_completed?: boolean;
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
  cover_image_url?: string | null;
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
  update: (
    id: number,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
      onboarding_completed?: boolean;
      specialties?: string;
      bio?: string;
    },
    token: string
  ) =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  completeOnboarding: (id: number, token: string) =>
    request<{ ok: boolean }>(`/users/${id}/complete-onboarding`, { method: 'POST' }, token),

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
  list: (serviceId: number, token?: string | null) =>
    request<ServiceReview[]>(`/services/${serviceId}/reviews`, {}, token ?? undefined),

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

// ── Coupons & Payments ────────────────────────────────────────────────────────
export interface Coupon {
  id: number;
  code: string;
  discount_percent: number | null;
  discount_value: number | null;
  description: string;
}

export const paymentsApi = {
  validateCoupon: (code: string, token: string) =>
    request<Coupon>('/payments/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
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
  duration?: string;
  included_items?: string[];
  images?: { id: number; url: string }[];
  cover_image_url?: string | null;
  provider_id: number;
  provider_name: string;
  avg_rating: number | null;
  review_count: number;
}

export const publicServicesApi = {
  list: (params?: { category?: string; q?: string; provider_id?: number }) => {
    const parts: string[] = [];
    if (params?.category) parts.push(`category=${encodeURIComponent(params.category)}`);
    if (params?.q) parts.push(`q=${encodeURIComponent(params.q)}`);
    if (params?.provider_id) parts.push(`provider_id=${params.provider_id}`);
    const qs = parts.length ? `?${parts.join('&')}` : '';
    return request<PublicService[]>(`/services/public${qs}`);
  },

  getById: (id: number) =>
    request<PublicService>(`/services/public/${id}`),
};

// ── Provider Reviews ──────────────────────────────────────────────────────────

export interface ProviderReview {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name: string;
  service_name: string;
}

export interface ProviderReviews {
  avg_rating: number | null;
  total_count: number;
  distribution: Record<string, number>;
  reviews: ProviderReview[];
}

export const providerApi = {
  reviews: (userId: number) =>
    request<ProviderReviews>(`/users/provider/${userId}/reviews`),

  profile: (userId: number) =>
    request<ProviderProfile>(`/users/provider/${userId}/profile`),
};

// ── Provider Profile ──────────────────────────────────────────────────────────

export interface ProviderSpecialty {
  icon: string;
  label: string;
  wide: boolean;
}

export interface ProviderCertification {
  icon: string;
  title: string;
  subtitle: string;
}

export interface ProviderProfile {
  id: number;
  name: string;
  bio: string | null;
  years_experience: number | null;
  response_time: string | null;
  specialties: ProviderSpecialty[];
  certifications: ProviderCertification[];
  completed_count: number;
}

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

// ── Availability ──────────────────────────────────────────────────────────────

export interface AvailabilityDay {
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  is_active: boolean;
}

export interface TimeSlot {
  time: string;
  is_occupied: boolean;
  is_past: boolean;
}

export interface SlotsResponse {
  date: string;
  slots: TimeSlot[];
}

export const availabilityApi = {
  get: (providerId: number, token: string) =>
    request<AvailabilityDay[]>(`/users/${providerId}/availability`, {}, token),

  update: (providerId: number, days: AvailabilityDay[], token: string) =>
    request<{ message: string }>(`/users/${providerId}/availability`, {
      method: 'PUT',
      body: JSON.stringify(days),
    }, token),

  slots: (providerId: number, date: string, serviceId: number, token: string) =>
    request<SlotsResponse>(`/users/${providerId}/slots?date=${date}&serviceId=${serviceId}`, {}, token),
};

// ── Appointments ──────────────────────────────────────────────────────────────

export interface Appointment {
  id: number;
  client_id: number;
  provider_id: number;
  service_id: number;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: 'confirmado' | 'cancelado' | 'concluido';
  payment_method: 'pix' | 'cartao';
  card_id: number | null;
  card_brand: string | null;
  card_last_four: string | null;
  total_price: number;
  service_name: string;
  provider_name: string;
  client_name: string;
  client_address_street: string | null;
  client_address_number: string | null;
  client_address_neighborhood: string | null;
  client_address_city: string | null;
  client_address_state: string | null;
  client_address_zip: string | null;
  created_at: string;
}

// ── Service Images ────────────────────────────────────────────────────────────

export interface ServiceImage {
  id: number;
  service_id: number;
  url: string;
  created_at: string;
}

export const serviceImagesApi = {
  list: (serviceId: number, token: string) =>
    request<ServiceImage[]>(`/uploads/services/${serviceId}/images`, {}, token),

  upload: async (serviceId: number, fileUri: string, token: string): Promise<ServiceImage> => {
    const filename = fileUri.split('/').pop() ?? 'image.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    const form = new FormData();
    form.append('file', { uri: fileUri, name: filename, type: mimeType } as any);

    let cleanToken = token.trim();
    if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
      cleanToken = cleanToken.slice(1, -1);
    }

    const res = await fetch(`${API_BASE_URL}/uploads/services/${serviceId}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cleanToken}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Erro ao enviar imagem');
    return data;
  },

  remove: (serviceId: number, imageId: number, token: string) =>
    request<{ message: string }>(`/uploads/services/${serviceId}/images/${imageId}`, { method: 'DELETE' }, token),
};

export const appointmentsApi = {
  list: (token: string) =>
    request<Appointment[]>('/appointments', {}, token),

  get: (id: number, token: string) =>
    request<Appointment>(`/appointments/${id}`, {}, token),

  create: (data: {
    service_id: number;
    provider_id: number;
    scheduled_date: string;
    scheduled_time: string;
    payment_method: 'pix' | 'cartao';
    card_id?: number;
  }, token: string) =>
    request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  cancel: (id: number, token: string) =>
    request<{ message: string }>(`/appointments/${id}/cancel`, {
      method: 'PATCH',
    }, token),
};

export interface ProviderDocument {
  type: string;
  url: string;
  created_at: string;
}

export const documentsApi = {
  list: (token: string) =>
    request<ProviderDocument[]>('/uploads/documents', {}, token),

  upload: async (type: string, fileUri: string, token: string): Promise<{ type: string; url: string }> => {
    const filename = fileUri.split('/').pop() ?? 'document.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    const form = new FormData();
    form.append('file', { uri: fileUri, name: filename, type: mimeType } as any);

    let cleanToken = token.trim();
    if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
      cleanToken = cleanToken.slice(1, -1);
    }

    const res = await fetch(`${API_BASE_URL}/uploads/documents/${type}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cleanToken}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Erro ao enviar documento');
    return data;
  },

  remove: (type: string, token: string) =>
    request<{ message: string }>(`/uploads/documents/${type}`, { method: 'DELETE' }, token),
};
