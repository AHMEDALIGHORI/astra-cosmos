import { DEG } from '@/lib/math';
export type BodyId = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';
export const BODY_ORDER: BodyId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
export const BODY_NAMES: Record<BodyId, string> = { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto' };
export function julianDay(year: number, month: number, day: number, hourUT = 12) { let y = year; let m = month; if (m <= 2) { y -= 1; m += 12; } const A = Math.floor(y / 100); const B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5 + hourUT / 24; }
const speed: Record<BodyId, number> = { sun: 0.9856, moon: 13.1764, mercury: 4.0923, venus: 1.6021, mars: 0.524, jupiter: 0.083, saturn: 0.034, uranus: 0.012, neptune: 0.006, pluto: 0.004 };
const epoch: Record<BodyId, number> = { sun: 280.46, moon: 218.32, mercury: 174.8, venus: 50.4, mars: 19.4, jupiter: 238.1, saturn: 266.4, uranus: 244.2, neptune: 84.0, pluto: 229.5 };
export function longitudes(jd: number): Record<BodyId, number> { const days = jd - 2451545; return Object.fromEntries(BODY_ORDER.map((id) => [id, ((epoch[id] + days * speed[id]) % 360 + 360) % 360])) as Record<BodyId, number>; }
export function separation(a: number, b: number) { const d = Math.abs((((a - b) % 360) + 360) % 360); return d > 180 ? 360 - d : d; }
export const formatPlacement = (p: { degree: number; sign: { name: string } }) => `${p.degree}° ${p.sign.name}`;
export const longitudeForDate = (date: Date) => longitudes(julianDay(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), 12));
