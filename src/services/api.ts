import {
  AuthUser,
  Event,
  EventSearchFilters,
  Order,
} from '../features/types';

// Both backend services sit behind a single Kong gateway (see ../kong.yml): it routes
// /api/v1/identity, /api/v1/events, /api/v1/payment, /api/v1/notification to soe-ticket-api
// and /api/v1/orders to soe-ticket-ordering-service, all under one host:port. Kong's proxy
// port is 8000 — 8001 is its Admin API and does not proxy application traffic.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://100.93.232.89:8000/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body (e.g. 204 or network-level HTML error page)
  }

  if (!res.ok) {
    const message =
      body?.error?.message || body?.message || `La solicitud falló con estado ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return body?.data as T;
}

// --- Identity (soe-ticket-api, via Kong) ---

async function register(email: string, name: string, password: string): Promise<AuthUser> {
  return request<AuthUser>('/identity/register', {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
  });
}

async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  return request<{ token: string; user: AuthUser }>('/identity/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

async function profile(token: string): Promise<AuthUser> {
  return request<AuthUser>('/identity/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- Events (soe-ticket-api, via Kong) ---

async function listEvents(filters?: EventSearchFilters): Promise<Event[]> {
  const params = new URLSearchParams();
  if (filters?.city) params.set('city', filters.city);
  if (filters?.artist) params.set('artist', filters.artist);
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);
  const qs = params.toString();
  return request<Event[]>(`/events${qs ? `?${qs}` : ''}`);
}

async function getEventById(id: string): Promise<Event | undefined> {
  // soe-ticket-api has no GET /events/:id — fetch the catalog and filter client-side.
  const events = await listEvents();
  return events.find((e) => e.id === id);
}

// --- Orders (soe-ticket-ordering-service, via Kong) ---

interface CreateOrderPayload {
  userId: string;
  eventId: string;
  seatNumbers: string[];
  amount: number;
}

async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return request<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function getOrderById(id: string): Promise<Order> {
  return request<Order>(`/orders/${id}`);
}

/**
 * Order completion is fully asynchronous (fraud check -> payment -> RabbitMQ) with no
 * push channel to the frontend, so the only way to learn the outcome is to poll.
 */
async function pollOrderUntilSettled(
  id: string,
  { intervalMs = 1500, timeoutMs = 20000 }: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<Order> {
  const start = Date.now();
  let order = await getOrderById(id);
  while (order.status === 'PENDING' && Date.now() - start < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    order = await getOrderById(id);
  }
  return order;
}

export const api = {
  identity: { register, login, profile },
  events: { list: listEvents, getById: getEventById },
  orders: { create: createOrder, getById: getOrderById, pollUntilSettled: pollOrderUntilSettled },
};
