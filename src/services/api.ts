import { Event, TicketType, Seat, Promotion, Order, Notification } from '../features/types';
import { mockEvents, mockTicketTypes, generateMockSeats, mockPromotions } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  events: {
    getAll: async (): Promise<Event[]> => {
      await delay(500);
      return mockEvents;
    },
    getById: async (id: string): Promise<Event | undefined> => {
      await delay(300);
      return mockEvents.find(e => e.id === id);
    },
    search: async (query: string, city?: string, date?: string): Promise<Event[]> => {
      await delay(600);
      return mockEvents.filter(e => {
        const matchesQuery = !query || 
          e.title.toLowerCase().includes(query.toLowerCase()) || 
          e.artist.toLowerCase().includes(query.toLowerCase());
        const matchesCity = !city || e.venue?.city === city;
        const matchesDate = !date || e.date === date;
        return matchesQuery && matchesCity && matchesDate;
      });
    }
  },
  tickets: {
    getTypes: async (eventId: string): Promise<TicketType[]> => {
      await delay(400);
      return mockTicketTypes[eventId] || [];
    },
    getSeats: async (eventId: string, section: string): Promise<Seat[]> => {
      await delay(800);
      // Generamos asientos dinámicamente para el mock
      return generateMockSeats(section, 10, 15);
    }
  },
  promotions: {
    validate: async (code: string, venueId?: string): Promise<Promotion | undefined> => {
      await delay(300);
      return mockPromotions.find(p => 
        p.code.toUpperCase() === code.toUpperCase() && 
        p.isActive && 
        (!p.venueId || p.venueId === venueId)
      );
    }
  },
  orders: {
    create: async (orderData: Partial<Order>): Promise<Order> => {
      await delay(1500);
      const newOrder: Order = {
        id: `ord-${Math.random().toString(36).substr(2, 9)}`,
        userId: 'user-1',
        items: orderData.items || [],
        total: orderData.total || 0,
        status: 'completed',
        createdAt: new Date().toISOString(),
        billingInfo: orderData.billingInfo!,
        paymentMethod: orderData.paymentMethod
      };
      return newOrder;
    }
  }
};
