import type { Course, Point } from '../data/courses';
export function distanceKm(a: Point, b: Point): number {
  for (const p of [a, b]) {
    if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude) || Math.abs(p.latitude) > 90 || Math.abs(p.longitude) > 180) throw new Error('Invalid coordinates');
  }
  const rad = (n: number) => n * Math.PI / 180;
  const h = Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(rad(b.longitude - a.longitude) / 2) ** 2;
  return 6371.0088 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
}
export function nearbyCourses(items: Course[], origin: Point, radius: number, query = '', holes = 0) {
  if (!Number.isFinite(radius) || radius < 0) throw new Error('Invalid radius');
  const needle = query.trim().toLowerCase();
  return items.filter(c => (!holes || c.holes === holes) && `${c.name} ${c.municipality}`.toLowerCase().includes(needle))
    .map(c => ({ ...c, distance: distanceKm(origin, c.location) }))
    .filter(c => c.distance <= radius).sort((a, b) => a.distance - b.distance);
}
