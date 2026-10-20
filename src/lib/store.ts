import { create } from 'zustand';
import type { ChapterId, NavMode, Phase } from './journey';
import type { QualityProfile } from './quality';
import type { BirthDate, Reading } from './astro/reading';
export interface DialogState { kind: 'consultation' | 'course'; source: string; courseSlug?: string; }
const TASK_WEIGHTS: Record<string, number> = { fonts: 0.14, scene: 0.3, glyphs: 0.16, shaders: 0.4 };
interface CosmicState {
  phase: Phase; chapter: ChapterId; navMode: NavMode; tasks: Record<string, number>; progress: number; webgl: boolean | null; quality: QualityProfile; reducedMotion: boolean; entered: boolean; birth: BirthDate | null; reading: Reading | null; dialog: DialogState | null; menuOpen: boolean;
  setTask: (name: string, value: number) => void; setEnvironment: (env: { webgl: boolean; quality: QualityProfile; reducedMotion: boolean }) => void; setChapter: (chapter: ChapterId, phase: Phase, navMode: NavMode) => void; enter: () => void; setReading: (reading: Reading | null) => void; openDialog: (dialog: DialogState) => void; closeDialog: () => void; setMenuOpen: (open: boolean) => void;
}
function totalProgress(tasks: Record<string, number>, webgl: boolean | null) { const names = webgl === false ? ['fonts'] : Object.keys(TASK_WEIGHTS); const total = names.reduce((sum, name) => sum + (TASK_WEIGHTS[name] ?? 0), 0); const done = names.reduce((sum, name) => sum + (TASK_WEIGHTS[name] ?? 0) * Math.min(tasks[name] ?? 0, 1), 0); return total ? done / total : 0; }
export const useCosmic = create<CosmicState>((set) => ({
  phase: 'LOADING', chapter: 'hero', navMode: 'transparent', tasks: {}, progress: 0, webgl: null, quality: { tier: 'medium', mobile: false, maxDpr: 1.5, minDpr: 0.85, stars: 4200, dust: 1500, streaks: 300, nebulaSprites: 200, nebulaStars: 1000, galaxy: 12000, glyph: 900, heroGlyph: 3200, blackHoleSteps: 48, blackHoleParticles: 1800, planetOctaves: 4, sphereSegments: 64, postProcessing: false, bloomLevels: 5 }, reducedMotion: false, entered: false, birth: null, reading: null, dialog: null, menuOpen: false,
  setTask: (name, value) => set((state) => { if ((state.tasks[name] ?? 0) >= value) return state; const tasks = { ...state.tasks, [name]: value }; return { tasks, progress: totalProgress(tasks, state.webgl) }; }),
  setEnvironment: ({ webgl, quality, reducedMotion }) => set((state) => ({ webgl, quality, reducedMotion, progress: totalProgress(state.tasks, webgl) })),
  setChapter: (chapter, phase, navMode) => set((state) => state.chapter === chapter && state.navMode === navMode ? state : { chapter, navMode, phase: state.entered ? phase : state.phase }),
  enter: () => set({ entered: true, phase: 'INTRO' }), setReading: (reading) => set({ reading, birth: reading?.birth ?? null }), openDialog: (dialog) => set({ dialog, menuOpen: false }), closeDialog: () => set({ dialog: null }), setMenuOpen: (menuOpen) => set({ menuOpen }),
}));
