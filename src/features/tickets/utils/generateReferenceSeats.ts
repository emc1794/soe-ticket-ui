export interface ReferenceSeat {
  id: string;
  row: string;
  number: string;
  price: number;
  tier: 'VIP' | 'General';
  isAccessible: boolean;
}

/**
 * soe-ticket-api's venue seating-map/availability endpoints are unimplemented stubs
 * (always return empty arrays), so there is no real per-seat inventory to render.
 * This generates a reference seating chart from the event's own min/max price so
 * users can still pick seats; real availability is only known once the order is
 * submitted (a 409 means a seat was already taken).
 */
export function generateReferenceSeats(
  minPrice: number,
  maxPrice: number,
  rows = 8,
  cols = 12
): ReferenceSeat[] {
  const seats: ReferenceSeat[] = [];
  for (let r = 0; r < rows; r++) {
    const rowChar = String.fromCharCode(65 + r);
    const isVipRow = r < 2 && maxPrice > minPrice;
    for (let c = 1; c <= cols; c++) {
      seats.push({
        id: `${rowChar}-${c}`,
        row: rowChar,
        number: String(c),
        price: isVipRow ? maxPrice : minPrice,
        tier: isVipRow ? 'VIP' : 'General',
        isAccessible: r === rows - 1 && c <= 2,
      });
    }
  }
  return seats;
}
