// Domain types mirror the real HTTP contracts of soe-ticket-api (events/identity)
// and soe-ticket-ordering-service (orders). Fields not returned by either API
// (pricing, images, seat inventory, notifications, order listing) are either
// carried in Event.metadata (a free-form JSON column we seeded) or synthesized
// client-side and clearly treated as such — see CLAUDE.md.

export type EventType = 'assigned' | 'general';
export type EventStatus = 'ACTIVE' | 'CANCELLED';

export interface EventMetadata {
  minPrice?: number;
  maxPrice?: number;
  imageUrl?: string;
  venueName?: string;
  category?: string;
  tags?: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO datetime
  venueId: string;
  artist: string;
  city: string;
  type: EventType;
  metadata: EventMetadata;
  status: EventStatus;
}

export interface EventSearchFilters {
  city?: string;
  artist?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface CartItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  label: string;
  /** Tokens sent as Order.seatNumbers — real seat labels for assigned events, synthetic tokens for general admission. Length always equals quantity. */
  seatNumbers: string[];
  price: number; // per unit
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  expiresAt?: number;
}

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  seatNumbers: string[];
  amount: number;
  status: OrderStatus;
}

export interface LocalOrderLine {
  label: string;
  quantity: number;
  price: number;
}

/** Order enriched with display info the ordering-service doesn't store, persisted client-side since there is no "list my orders" endpoint. */
export interface LocalOrder extends Order {
  eventTitle: string;
  eventDate: string;
  venueName: string;
  lines: LocalOrderLine[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}
