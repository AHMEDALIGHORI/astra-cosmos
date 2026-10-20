export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;
export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const smoothstep = (a: number, b: number, v: number) => smooth(range(v, a, b));
export const pulse = (v: number, a: number, b: number, c: number, d: number) => smoothstep(a, b, v) * (1 - smoothstep(c, d, v));
export const damp = (current: number, target: number, lambda: number, dt: number) => lerp(current, target, 1 - Math.exp(-lambda * dt));
export function mulberry32(seed: number) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export const gauss = (rnd: () => number) => (rnd() + rnd() + rnd() + rnd() - 2) / 2;
export const pad2 = (n: number) => String(n).padStart(2, '0');
