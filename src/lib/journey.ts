export type ChapterId = 'hero' | 'solar' | 'earth' | 'outer' | 'constellations' | 'numerology' | 'chart' | 'nebula' | 'blackhole' | 'courses' | 'consultation' | 'finale';
export type Phase = 'LOADING' | 'INTRO' | 'TRAVELLING' | 'DISCOVERY' | 'INTERPRETATION' | 'LEARNING' | 'CONSULTATION' | 'COMPLETION';
export type NavMode = 'transparent' | 'minimal' | 'visible';
export interface Chapter { id: ChapterId; index: number; label: string; phase: Phase; nav: NavMode; kind: 'stage' | 'flow'; length: number; }
const define = (chapters: Omit<Chapter, 'index'>[]): Chapter[] => chapters.map((chapter, index) => ({ ...chapter, index }));
export const CHAPTERS = define([
  { id: 'hero', label: 'Origin', phase: 'INTRO', nav: 'transparent', kind: 'stage', length: 160 },
  { id: 'solar', label: 'Inner Worlds', phase: 'TRAVELLING', nav: 'minimal', kind: 'stage', length: 400 },
  { id: 'earth', label: 'Earth', phase: 'DISCOVERY', nav: 'minimal', kind: 'stage', length: 340 },
  { id: 'outer', label: 'Outer Worlds', phase: 'TRAVELLING', nav: 'minimal', kind: 'stage', length: 560 },
  { id: 'constellations', label: 'Constellations', phase: 'DISCOVERY', nav: 'minimal', kind: 'stage', length: 480 },
  { id: 'numerology', label: 'Numerology', phase: 'DISCOVERY', nav: 'minimal', kind: 'stage', length: 340 },
  { id: 'chart', label: 'Birth Chart', phase: 'INTERPRETATION', nav: 'visible', kind: 'flow', length: 0 },
  { id: 'nebula', label: 'Nebula', phase: 'INTERPRETATION', nav: 'minimal', kind: 'stage', length: 360 },
  { id: 'blackhole', label: 'Singularity', phase: 'TRAVELLING', nav: 'minimal', kind: 'stage', length: 500 },
  { id: 'courses', label: 'Observatory', phase: 'LEARNING', nav: 'visible', kind: 'flow', length: 0 },
  { id: 'consultation', label: 'Consultation', phase: 'CONSULTATION', nav: 'visible', kind: 'stage', length: 200 },
  { id: 'finale', label: 'Return', phase: 'COMPLETION', nav: 'visible', kind: 'stage', length: 340 },
]);
export const CHAPTER_COUNT = CHAPTERS.length;
const INDEX = Object.fromEntries(CHAPTERS.map((chapter) => [chapter.id, chapter.index])) as Record<ChapterId, number>;
export const chapterIndex = (id: ChapterId) => INDEX[id];
export const chapterById = (id: ChapterId) => CHAPTERS[INDEX[id]];
export const at = (id: ChapterId, local = 0) => INDEX[id] + local;
export interface HoverTarget { id: string; label: string; x: number; y: number; r: number; }
export const journey = {
  t: 0, ts: 0, time: 0, speed: 0, scrollVelocity: 0,
  pointer: { x: 0, y: 0 }, pointerSmooth: { x: 0, y: 0 },
  viewport: { width: 1280, height: 720, aspect: 16 / 9, portrait: 0 },
  camera: { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
  sunScreen: { x: 0.72, y: 0.5, visible: false },
  targets: [] as HoverTarget[], warm: true, entered: false, finaleLift: 0,
};
export type Journey = typeof journey;
