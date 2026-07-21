import { Event, Venue, TicketType, Seat, Promotion } from '../features/types';

export const mockVenues: Venue[] = [
  {
    id: 'v1',
    name: 'Estadio Nacional',
    city: 'Santiago',
    address: 'Av. Grecia 2001',
    capacity: 45000,
    hasAssignedSeating: true,
  },
  {
    id: 'v2',
    name: 'Teatro Oriente',
    city: 'Santiago',
    address: 'Av. Pedro de Valdivia 99',
    capacity: 1000,
    hasAssignedSeating: true,
  },
  {
    id: 'v3',
    name: 'Club Hípico',
    city: 'Santiago',
    address: 'Blanco Encalada 2540',
    capacity: 50000,
    hasAssignedSeating: false,
  }
];

export const mockEvents: Event[] = [
  {
    id: 'e1',
    title: 'Taylor Swift - The Eras Tour',
    artist: 'Taylor Swift',
    description: 'La gira más grande de la década llega a Chile con un show de más de 3 horas.',
    date: '2026-10-15',
    time: '20:00',
    category: 'Concierto',
    venueId: 'v1',
    venue: mockVenues[0],
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop',
    minPrice: 45000,
    maxPrice: 250000,
    status: 'Disponible',
    tags: ['Pop', 'Internacional', 'Sold Out Proximamente']
  },
  {
    id: 'e2',
    title: 'Final Copa Chile',
    artist: 'Varios Equipos',
    description: 'La gran final del fútbol chileno en un encuentro único.',
    date: '2026-11-20',
    time: '18:30',
    category: 'Deporte',
    venueId: 'v1',
    venue: mockVenues[0],
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop',
    minPrice: 15000,
    maxPrice: 60000,
    status: 'Disponible',
    tags: ['Fútbol', 'Nacional', 'Familiar']
  },
  {
    id: 'e3',
    title: 'TechConf 2026',
    artist: 'Varios Speakers',
    description: 'La conferencia de tecnología más importante de Latinoamérica.',
    date: '2026-09-05',
    time: '09:00',
    category: 'Conferencia',
    venueId: 'v2',
    venue: mockVenues[1],
    imageUrl: 'https://images.unsplash.com/photo-1475721027187-4024733923f7?w=800&auto=format&fit=crop',
    minPrice: 80000,
    maxPrice: 150000,
    status: 'Disponible',
    tags: ['Tecnología', 'Innovación']
  }
];

export const mockTicketTypes: Record<string, TicketType[]> = {
  'e1': [
    { id: 't1', eventId: 'e1', name: 'Cancha VIP', price: 250000, availableQuantity: 100 },
    { id: 't2', eventId: 'e1', name: 'Cancha General', price: 90000, availableQuantity: 500 },
    { id: 't3', eventId: 'e1', name: 'Galería', price: 45000, availableQuantity: 200 }
  ],
  'e3': [
    { id: 't4', eventId: 'e3', name: 'Full Pass', price: 150000, availableQuantity: 50 },
    { id: 't5', eventId: 'e3', name: 'Student Pass', price: 80000, availableQuantity: 30 }
  ]
};

export const generateMockSeats = (section: string, rows: number, cols: number): Seat[] => {
  const seats: Seat[] = [];
  for (let r = 0; r < rows; r++) {
    const rowChar = String.fromCharCode(65 + r);
    for (let c = 1; c <= cols; c++) {
      const isSold = Math.random() < 0.2;
      const isReserved = !isSold && Math.random() < 0.1;
      const isAccessible = r === 0 && c <= 2;
      
      seats.push({
        id: `${section}-${rowChar}-${c}`,
        row: rowChar,
        number: c.toString(),
        section,
        status: isSold ? 'sold' : isReserved ? 'reserved' : isAccessible ? 'accessible' : 'available',
        price: section === 'VIP' ? 150000 : 75000,
        isAccessible
      });
    }
  }
  return seats;
};

export const mockPromotions: Promotion[] = [
  { id: 'p1', code: 'WAVE20', discountType: 'percentage', value: 20, description: '20% de descuento de bienvenida', isActive: true },
  { id: 'p2', code: 'ESTADIO10', discountType: 'fixed', value: 10000, description: '$10.000 de descuento en Estadio Nacional', venueId: 'v1', isActive: true }
];
