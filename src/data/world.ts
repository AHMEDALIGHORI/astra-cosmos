/**
 * Art-directed coordinates for the single world traversed by the camera.
 * The solar system is intentionally compressed so every body reads at a glance.
 */
export type V3 = [number, number, number];
export type PlanetKind = 'mercury' | 'venus' | 'earth' | 'moon' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';

export interface BodyDef {
  kind: PlanetKind;
  name: string;
  position: V3;
  radius: number;
  tilt: number;
  spin: number;
  visible: [number, number];
  focus?: number;
  atmosphere?: { shell: number; color: V3; sunset: V3; density: number; falloff: number; mie: number };
  rings?: { inner: number; outer: number; style: 0 | 1 };
  beacon: V3;
}

export const SUN = { position: [0, 0, 0] as V3, radius: 26 };

export const BODIES: Record<PlanetKind, BodyDef> = {
  mercury: { kind: 'mercury', name: 'Mercury', position: [27.5, -2, -178], radius: 3.4, tilt: .03, spin: .012, visible: [0, 2.35], beacon: [.75, .7, .64] },
  venus: { kind: 'venus', name: 'Venus', position: [30, 6, -372], radius: 9.5, tilt: 177, spin: -.006, visible: [0, 2.6], atmosphere: { shell: 1.42, color: [1, .82, .55], sunset: [1, .5, .22], density: .75, falloff: 2.6, mie: .5 }, beacon: [.95, .82, .6] },
  earth: { kind: 'earth', name: 'Earth', position: [30, 0, -620], radius: 13, tilt: 23.4, spin: .02, visible: [0, 3.5], atmosphere: { shell: 1.16, color: [.3, .56, 1], sunset: [1, .42, .18], density: 1.05, falloff: 3.4, mie: .9 }, beacon: [.45, .68, 1] },
  moon: { kind: 'moon', name: 'Moon', position: [18, 16, -772], radius: 3.5, tilt: 6.7, spin: .004, visible: [1.9, 3.6], beacon: [.8, .8, .78] },
  mars: { kind: 'mars', name: 'Mars', position: [8, 6, -985], radius: 7, tilt: 25.2, spin: .018, visible: [2.6, 3.9], atmosphere: { shell: 1.1, color: [.95, .62, .42], sunset: [.45, .6, .9], density: .4, falloff: 3.2, mie: .35 }, beacon: [.9, .45, .28] },
  jupiter: { kind: 'jupiter', name: 'Jupiter', position: [122, -22, -1425], radius: 48, tilt: 3.1, spin: .03, visible: [2.7, 4.3], focus: 3.5, atmosphere: { shell: 1.045, color: [.95, .8, .62], sunset: [.9, .5, .3], density: .5, falloff: 3.5, mie: .3 }, beacon: [.9, .78, .62] },
  saturn: { kind: 'saturn', name: 'Saturn', position: [-140, -14, -1900], radius: 36, tilt: 26.7, spin: .028, visible: [2.9, 4.6], atmosphere: { shell: 1.045, color: [.98, .88, .66], sunset: [.95, .6, .35], density: .45, falloff: 3.5, mie: .3 }, rings: { inner: 1.24, outer: 2.42, style: 0 }, beacon: [.95, .86, .66] },
  uranus: { kind: 'uranus', name: 'Uranus', position: [92, 30, -2300], radius: 19, tilt: 97.8, spin: .02, visible: [3.2, 4.8], atmosphere: { shell: 1.07, color: [.55, .9, .95], sunset: [.4, .7, .9], density: .34, falloff: 3, mie: .3 }, rings: { inner: 1.55, outer: 2.05, style: 1 }, beacon: [.62, .9, .92] },
  neptune: { kind: 'neptune', name: 'Neptune', position: [22, -16, -2620], radius: 18, tilt: 28.3, spin: .022, visible: [3.4, 5], atmosphere: { shell: 1.07, color: [.25, .45, 1], sunset: [.3, .4, .9], density: .7, falloff: 3, mie: .3 }, beacon: [.35, .5, 1] },
};

export const CONSTELLATION_ZONE = { startZ: -2900, spacing: 92, scale: 78 };
export const NUMEROLOGY = {
  center: [0, 0, -4420] as V3,
  ringRadius: 250,
  digitHeight: 120,
  hero: [0, 0, -4720] as V3,
  heroHeight: 150,
};
export const NEBULA = { center: [0, 0, -5700] as V3, halfLength: 780, radius: 520 };
export const GALAXY = { position: [2600, 1100, -12000] as V3, radius: 1500 };
export const BLACK_HOLE = { position: [0, 0, -8600] as V3, rs: 40, diskInner: 2.6, diskOuter: 11.5, influence: 17 };
export const GUIDE_STAR = { position: [0, 0, -10760] as V3 };
export const WORLD_CENTER: V3 = [0, 0, -5000];
