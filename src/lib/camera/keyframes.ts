import { BLACK_HOLE, BODIES, GUIDE_STAR, NUMEROLOGY, SUN, WORLD_CENTER, type V3 } from '@/data/world';
import { at, type ChapterId } from '@/lib/journey';
import { DEG } from '@/lib/math';

export interface CameraKey {
  at: [ChapterId, number];
  pos: V3;
  look: V3;
  fov?: number;
  roll?: number;
  frame?: [number, number];
  frameM?: [number, number];
  shake?: number;
  hold?: boolean;
}

export function cameraOrbit(center: V3, radius: number, azimuthDeg: number, elevationDeg: number): V3 {
  const az = azimuthDeg * DEG;
  const el = elevationDeg * DEG;
  return [
    center[0] + radius * Math.sin(az) * Math.cos(el),
    center[1] + radius * Math.sin(el),
    center[2] + radius * Math.cos(az) * Math.cos(el),
  ];
}

const [SUN_P, MERCURY, VENUS, EARTH, MOON, MARS, JUPITER, SATURN, URANUS, NEPTUNE] = [
  SUN.position, BODIES.mercury.position, BODIES.venus.position, BODIES.earth.position,
  BODIES.moon.position, BODIES.mars.position, BODIES.jupiter.position, BODIES.saturn.position,
  BODIES.uranus.position, BODIES.neptune.position,
];
const HERO_NUMERAL = NUMEROLOGY.hero;
const HOLE = BLACK_HOLE.position;
const STAR = GUIDE_STAR.position;

export const CAMERA_KEYS: CameraKey[] = [
  { at: ['hero', 0], pos: [-1050, 520, 980], look: [15, 0, -310], fov: 25, roll: 0, frame: [.4, -.06], frameM: [0, -.36], shake: 0 },
  { at: ['hero', .5], pos: [-880, 430, 830], look: [12, 0, -240], fov: 27 },
  { at: ['solar', 0], pos: [-560, 250, 540], look: [0, 0, -40], fov: 34, frame: [.3, 0], frameM: [0, -.2] },
  { at: ['solar', .17], pos: [-232, 82, 236], look: SUN_P, fov: 40, frame: [.26, 0], frameM: [0, -.16] },
  { at: ['solar', .33], pos: [-64, 14, 64], look: [14, -2, -46], fov: 46, frame: [.08, 0], frameM: [0, 0], roll: -.06, shake: .7 },
  { at: ['solar', .43], pos: [-64, 6, -4], look: [-6, 0, -124], fov: 48, frame: [0, 0], roll: -.1, shake: .9 },
  { at: ['solar', .51], pos: [-34, 0, -70], look: [22, -2, -176], fov: 46, roll: -.04, shake: .2 },
  { at: ['solar', .6], pos: [4, 1, -138], look: MERCURY, fov: 42, frame: [.12, 0], roll: 0, shake: 0 },
  { at: ['solar', .69], pos: [19, 0, -171], look: [26.5, -2, -187], fov: 44, frame: [0, 0], roll: .05 },
  { at: ['solar', .76], pos: [17, 2, -224], look: VENUS, fov: 42, roll: 0 },
  { at: ['solar', .87], pos: [15, 5, -326], look: VENUS, fov: 42, frame: [.12, 0] },
  { at: ['solar', .95], pos: [20.2, 4.7, -365.2], look: [26, 4, -404], fov: 46, frame: [0, 0], roll: .05 },
  { at: ['earth', 0], pos: [16, 6, -434], look: EARTH, fov: 38, frame: [.1, 0], frameM: [0, -.1], roll: 0 },
  { at: ['earth', .14], pos: cameraOrbit(EARTH, 150, -8, 6), look: EARTH, fov: 34, frame: [.32, 0], frameM: [0, -.3] },
  { at: ['earth', .34], pos: cameraOrbit(EARTH, 134, -46, 11), look: EARTH, fov: 34, frame: [.34, 0], frameM: [0, -.3] },
  { at: ['earth', .52], pos: cameraOrbit(EARTH, 108, -86, 12), look: EARTH, fov: 35, frame: [.34, -.02], frameM: [0, -.3] },
  { at: ['earth', .7], pos: cameraOrbit(EARTH, 82, -126, 9), look: EARTH, fov: 36, frame: [.36, -.02], frameM: [0, -.32] },
  { at: ['earth', .86], pos: cameraOrbit(EARTH, 60, -165, 5), look: EARTH, fov: 38, frame: [.3, 0], frameM: [0, -.26] },
  { at: ['outer', 0], pos: [20, 11, -704], look: MOON, fov: 40, frame: [.1, 0], frameM: [0, 0] },
  { at: ['outer', .07], pos: [29, 13, -757], look: [14, 15, -792], fov: 42, frame: [0, 0], roll: .04 },
  { at: ['outer', .13], pos: [20, 12, -812], look: MARS, fov: 40, roll: 0 },
  { at: ['outer', .23], pos: [-9, 9, -956], look: MARS, fov: 40, frame: [.14, 0] },
  { at: ['outer', .29], pos: [-11, 9.5, -981], look: [6, 6, -996], fov: 44, frame: [0, 0], roll: .05 },
  { at: ['outer', .35], pos: [0, 6, -1064], look: JUPITER, fov: 40, roll: 0 },
  { at: ['outer', .46], pos: [40, 0, -1330], look: JUPITER, fov: 42, frame: [.22, 0], frameM: [0, -.1] },
  { at: ['outer', .54], pos: [58, 3, -1410], look: [112, -14, -1444], fov: 46, frame: [.1, 0], frameM: [0, 0], roll: .07 },
  { at: ['outer', .61], pos: [40, 5, -1504], look: SATURN, fov: 40, frame: [0, 0], roll: 0 },
  { at: ['outer', .71], pos: [-18, 34, -1790], look: SATURN, fov: 40, frame: [-.16, 0], frameM: [0, -.08] },
  { at: ['outer', .78], pos: [-68, 30, -1868], look: [-128, -12, -1908], fov: 46, frame: [0, 0], frameM: [0, 0], roll: -.08 },
  { at: ['outer', .83], pos: [-58, 32, -1964], look: URANUS, fov: 40, roll: 0 },
  { at: ['outer', .9], pos: [57, 26, -2268], look: [82, 30, -2308], fov: 44, frame: [.1, 0], frameM: [0, 0], roll: .05 },
  { at: ['outer', .94], pos: [42, 16, -2384], look: NEPTUNE, fov: 40, frame: [0, 0], roll: 0 },
  { at: ['outer', .99], pos: [-10, -6, -2590], look: [14, -13, -2640], fov: 44, frame: [.1, 0], frameM: [0, 0], roll: .04 },
  { at: ['constellations', .06], pos: [-4, -4, -2704], look: [16, 4, -2900], fov: 46, frame: [0, 0], roll: 0 },
  { at: ['constellations', .3], pos: [14, 6, -3040], look: [-12, 0, -3260], fov: 48, roll: .05 },
  { at: ['constellations', .55], pos: [-14, -4, -3380], look: [10, 4, -3600], fov: 48, roll: -.05 },
  { at: ['constellations', .8], pos: [10, 4, -3720], look: [0, 0, -3950], fov: 48, roll: .04 },
  { at: ['numerology', 0], pos: [0, 0, -4030], look: [0, 0, -4420], fov: 46, roll: 0 },
  { at: ['numerology', .2], pos: [0, 8, -4250], look: [40, 0, -4640], fov: 46, frame: [.26, 0], frameM: [0, -.18] },
  { at: ['numerology', .36], pos: [0, 4, -4380], look: [-210, 10, -4610], fov: 48, roll: .03 },
  { at: ['numerology', .5], pos: [0, 0, -4415], look: [190, -6, -4640], fov: 48, roll: -.03 },
  { at: ['numerology', .66], pos: [0, 0, -4410], look: HERO_NUMERAL, fov: 42, roll: 0, frame: [.34, 0], frameM: [0, -.2] },
  { at: ['chart', 0], pos: [0, 0, -4170], look: HERO_NUMERAL, fov: 36, frame: [.4, 0], frameM: [0, -.5], hold: true },
  { at: ['chart', .86], pos: [0, 5, -4196], look: HERO_NUMERAL, fov: 36, frame: [.4, 0], frameM: [0, -.5] },
  { at: ['nebula', 0], pos: [0, 0, -4760], look: [0, 0, -5300], fov: 46, frame: [0, 0], frameM: [0, 0], roll: 0 },
  { at: ['nebula', .25], pos: [44, -22, -5210], look: [-30, 10, -5620], fov: 50, roll: .1 },
  { at: ['nebula', .5], pos: [-52, 30, -5650], look: [40, -10, -6020], fov: 52, roll: -.08 },
  { at: ['nebula', .76], pos: [30, 10, -6060], look: [0, 0, -6600], fov: 50, roll: .06 },
  { at: ['blackhole', 0], pos: [0, 30, -6480], look: HOLE, fov: 42, roll: 0, shake: 0 },
  { at: ['blackhole', .3], pos: [130, 150, -7700], look: HOLE, fov: 44, roll: .14, shake: .1 },
  { at: ['blackhole', .5], pos: [70, 74, -8150], look: HOLE, fov: 48, roll: .3, shake: .4 },
  { at: ['blackhole', .61], pos: [24, 28, -8420], look: HOLE, fov: 54, roll: .46, shake: 1.2 },
  { at: ['blackhole', .68], pos: [5, 8, -8528], look: [0, 0, -8640], fov: 58, roll: .6, shake: 1.6 },
  { at: ['blackhole', .8], pos: [0, 0, -10000], look: [0, 0, -10700], fov: 40, roll: 0, shake: 0 },
  { at: ['courses', 0], pos: [0, 0, -10100], look: [30, 6, -10760], fov: 40 },
  { at: ['courses', .6], pos: [0, 4, -10160], look: [-30, -4, -10760], fov: 40 },
  { at: ['consultation', 0], pos: [0, 0, -10210], look: STAR, fov: 38, frame: [.36, .1], frameM: [.1, -.4] },
  { at: ['consultation', .7], pos: [0, 0, -10270], look: STAR, fov: 38, frame: [.36, .1], frameM: [.1, -.4] },
  { at: ['finale', 0], pos: [0, 0, -10290], look: STAR, fov: 38, frame: [.3, .08], frameM: [.1, -.4] },
  { at: ['finale', .1], pos: [460, 200, -10560], look: [0, 0, -9700], fov: 40, frame: [0, 0], frameM: [0, 0] },
  { at: ['finale', .2], pos: [2500, 1200, -10300], look: HOLE, fov: 40 },
  { at: ['finale', .32], pos: [9500, 5000, -7400], look: [0, 0, -6200], fov: 40 },
  { at: ['finale', .44], pos: [30000, 16500, -5000], look: WORLD_CENTER, fov: 38 },
  { at: ['finale', .55], pos: [150000, 84000, -5000], look: WORLD_CENTER, fov: 36, frame: [0, .3], frameM: [0, .4] },
  { at: ['finale', .64], pos: [640000, 360000, -5000], look: WORLD_CENTER, fov: 34, frame: [0, .52], frameM: [0, .56], hold: true },
  { at: ['finale', 1.2], pos: [660000, 372000, -5000], look: WORLD_CENTER, fov: 34, frame: [0, .52], frameM: [0, .56] },
];

export const keyTime = (key: CameraKey) => at(key.at[0], key.at[1]);
export const sortedKeys = [...CAMERA_KEYS].sort((a, b) => keyTime(a) - keyTime(b));
export const KEY_TIMES = CAMERA_KEYS.map((key) => keyTime(key));
