import type { ChapterId } from '@/lib/journey';
export interface NavLink { label: string; chapter: ChapterId; local: number; covers: ChapterId[]; }
export const NAV_LINKS: NavLink[] = [
  { label: 'Journey', chapter: 'solar', local: 0.05, covers: ['hero', 'solar', 'earth', 'outer'] },
  { label: 'Astrology', chapter: 'constellations', local: 0.08, covers: ['constellations', 'chart'] },
  { label: 'Numerology', chapter: 'numerology', local: 0.3, covers: ['numerology'] },
  { label: 'Courses', chapter: 'courses', local: 0, covers: ['courses'] },
  { label: 'Consultation', chapter: 'consultation', local: 0.42, covers: ['consultation', 'finale'] },
];
export const BEGIN_TARGET = { chapter: 'chart' as ChapterId, local: 0 };
