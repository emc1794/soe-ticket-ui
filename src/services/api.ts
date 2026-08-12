import {
  AuthUser,
  Event,
  EventSearchFilters,
  Order,
} from '../features/types';

const TICKET_API_BASE = import.meta.env.VITE_TICKET_API_URL || 'http://localhost:3000/api/v1';
const ORDERING_API_BASE = import.meta.env.VITE_ORDERING_API_URL || 'http://localhost:3001/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(baseUrl: string, path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
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

// --- Identity (soe-ticket-api) ---

async function register(email: string, name: string, password: string): Promise<AuthUser> {
  return request<AuthUser>(TICKET_API_BASE, '/identity/register', {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
  });
}

async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  return request<{ token: string; user: AuthUser }>(TICKET_API_BASE, '/identity/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

async function profile(token: string): Promise<AuthUser> {
  return request<AuthUser>(TICKET_API_BASE, '/identity/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- Events (soe-ticket-api) ---

async function listEvents(filters?: EventSearchFilters): Promise<Event[]> {
  const params = new URLSearchParams();
  if (filters?.city) params.set('city', filters.city);
  if (filters?.artist) params.set('artist', filters.artist);
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);
  const qs = params.toString();
  return request<Event[]>(TICKET_API_BASE, `/events${qs ? `?${qs}` : ''}`);
}

async function getEventById(id: string): Promise<Event | undefined> {
  // soe-ticket-api has no GET /events/:id — fetch the catalog and filter client-side.
  const events = await listEvents();
  return events.find((e) => e.id === id);
}

// --- Orders (soe-ticket-ordering-service) ---

interface CreateOrderPayload {
  userId: string;
  eventId: string;
  seatNumbers: string[];
  amount: number;
}

async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return request<Order>(ORDERING_API_BASE, '/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function getOrderById(id: string): Promise<Order> {
  return request<Order>(ORDERING_API_BASE, `/orders/${id}`);
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
