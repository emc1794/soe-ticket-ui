import { LocalOrder, Order } from '../features/types';

const STORAGE_KEY = 'ticketwave_orders';

function readAll(): LocalOrder[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function writeAll(orders: LocalOrder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function saveLocalOrder(order: LocalOrder): void {
  const all = readAll();
  writeAll([order, ...all.filter((o) => o.id !== order.id)]);
}

export function updateLocalOrderStatus(id: string, status: Order['status']): void {
  const all = readAll();
  writeAll(all.map((o) => (o.id === id ? { ...o, status } : o)));
}

export function getLocalOrder(id: string): LocalOrder | undefined {
  return readAll().find((o) => o.id === id);
}

export function listLocalOrders(): LocalOrder[] {
  return readAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
