export type TeeTime = { id: string; course: string; area: string; day: number; time: string; hour: number; price: number; spaces: number; holes: number; description: string };
// Fictional inventory only. A future backend adapter will return this same shape.
export const teeTimes: TeeTime[] = Array.from({ length: 3 }, (_, day) => [
  { id: `pine-${day}`, course: 'Pine & Creek', area: 'North valley', day, time: '8:20 AM', hour: 8, price: 65, spaces: 4, holes: 18, description: 'A peaceful woodland round with generous fairways and a winding creek. A fictional course for exploring the prototype.' },
  { id: `ridge-${day}`, course: 'The Ridge', area: 'West hills', day, time: '10:40 AM', hour: 10, price: 89, spaces: 2, holes: 18, description: 'Elevated greens, open views, and a little extra challenge. A fictional course for exploring the prototype.' },
  { id: `meadow-${day}`, course: 'Meadow Park', area: 'Central district', day, time: '2:10 PM', hour: 14, price: 42, spaces: 4, holes: 9, description: 'An easygoing nine-hole escape with room for a relaxed afternoon. A fictional course for exploring the prototype.' },
]).flat();
export type Filters = { query: string; day: number; players: number; budget: boolean; afternoon: boolean };
export function filterTimes(items: TeeTime[], f: Filters): TeeTime[] {
  const query = f.query.trim().toLowerCase();
  return items.filter(t => t.day === f.day && t.spaces >= f.players && (!f.budget || t.price <= 70) && (!f.afternoon || t.hour >= 12) && `${t.course} ${t.area}`.toLowerCase().includes(query));
}
