export type CourseEmblem = 'orrery' | 'lattice' | 'chart' | 'cycles';
export interface Course { slug: string; numeral: string; title: [string, string]; summary: string; duration: string; lessons: string; level: string; format: string; emblem: CourseEmblem; }
export const COURSES: Course[] = [
  { slug: 'astrology-foundations', numeral: 'I', title: ['Astrology', 'Foundations'], summary: 'Planets, signs and houses: the grammar of the sky, learned in the order it was built.', duration: '8 weeks', lessons: '24 lessons', level: 'Beginner', format: 'Live + recorded', emblem: 'orrery' },
  { slug: 'numerology-fundamentals', numeral: 'II', title: ['Numerology', 'Fundamentals'], summary: 'Core numbers, cycles and the logic of reduction. How a date becomes a pattern.', duration: '6 weeks', lessons: '18 lessons', level: 'Beginner', format: 'Self-paced', emblem: 'lattice' },
  { slug: 'birth-chart-decoded', numeral: 'III', title: ['Birth Chart', 'Decoded'], summary: 'Read a complete natal chart, from the first glance to a considered synthesis.', duration: '10 weeks', lessons: '30 lessons', level: 'Intermediate', format: 'Live cohort', emblem: 'chart' },
  { slug: 'cosmic-cycles', numeral: 'IV', title: ['Cosmic', 'Cycles'], summary: 'Transits, returns and timing. How the moving sky meets the map you were born with.', duration: '8 weeks', lessons: '20 lessons', level: 'Advanced', format: 'Live cohort', emblem: 'cycles' },
];
export const courseBySlug = (slug: string) => COURSES.find((course) => course.slug === slug);
