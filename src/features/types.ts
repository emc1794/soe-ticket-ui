export type EventCategory = 'Concierto' | 'Deporte' | 'Conferencia' | 'Teatro' | 'Otro';

export interface Venue {
  id: string;
  name: string;
  city: string;
  address: string;
  capacity: number;
  image?: string;
  hasAssignedSeating: boolean;
}

export interface Event {
  id: string;
  title: string;
  artist: string;
  description: string;
  date: string;
  time: string;
  category: EventCategory;
  venueId: string;
  venue?: Venue;
  imageUrl: string;
  minPrice: number;
  maxPrice: number;
  status: 'Disponible' | 'Agotado' | 'Pospuesto' | 'Cancelado';
  tags?: string[];
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  description?: string;
  availableQuantity: number;
}

export type SeatStatus = 'available' | 'selected' | 'reserved' | 'sold' | 'accessible';

export interface Seat {
  id: string;
  row: string;
  number: string;
  section: string;
  status: SeatStatus;
  price: number;
  isAccessible: boolean;
}

export interface CartItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  ticketTypeId?: string;
  ticketTypeName?: string;
  seatId?: string;
  seatLabel?: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  expiresAt?: number; // Timestamp
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'canceled' | 'refunded';
  createdAt: string;
  paymentMethod?: string;
  billingInfo: {
    name: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface Promotion {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  description: string;
  venueId?: string; // Si es específica de un recinto
  isActive: boolean;
}
