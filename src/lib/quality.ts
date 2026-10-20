export type Tier = 'low' | 'medium' | 'high';
export interface QualityProfile { tier: Tier; mobile: boolean; maxDpr: number; minDpr: number; stars: number; dust: number; streaks: number; nebulaSprites: number; nebulaStars: number; galaxy: number; glyph: number; heroGlyph: number; blackHoleSteps: number; blackHoleParticles: number; planetOctaves: number; sphereSegments: number; postProcessing: boolean; bloomLevels: number; }
const PROFILES: Record<Tier, Omit<QualityProfile, 'mobile'>> = {
  high: { tier: 'high', maxDpr: 1.75, minDpr: 1, stars: 9000, dust: 3200, streaks: 900, nebulaSprites: 420, nebulaStars: 2600, galaxy: 42000, glyph: 2600, heroGlyph: 9000, blackHoleSteps: 110, blackHoleParticles: 7000, planetOctaves: 6, sphereSegments: 128, postProcessing: true, bloomLevels: 7 },
  medium: { tier: 'medium', maxDpr: 1.5, minDpr: 0.85, stars: 5500, dust: 1900, streaks: 520, nebulaSprites: 260, nebulaStars: 1500, galaxy: 22000, glyph: 1500, heroGlyph: 5200, blackHoleSteps: 72, blackHoleParticles: 3600, planetOctaves: 5, sphereSegments: 96, postProcessing: true, bloomLevels: 6 },
  low: { tier: 'low', maxDpr: 1.25, minDpr: 0.75, stars: 3000, dust: 900, streaks: 240, nebulaSprites: 140, nebulaStars: 700, galaxy: 9000, glyph: 800, heroGlyph: 2800, blackHoleSteps: 44, blackHoleParticles: 1600, planetOctaves: 4, sphereSegments: 64, postProcessing: false, bloomLevels: 5 },
};
export const DEFAULT_QUALITY: QualityProfile = { ...PROFILES.medium, mobile: false };
function softwareRenderer() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return true;
    const extension = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = extension ? String(gl.getParameter(extension.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|software|basic render/i.test(renderer);
  } catch {
    return true;
  }
}

export function hasWebGL() {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    const available = Boolean(gl);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return available;
  } catch {
    return false;
  }
}

export function detectQuality(): QualityProfile {
  if (typeof window === 'undefined') return DEFAULT_QUALITY;
  const override = new URLSearchParams(window.location.search).get('q') as Tier | null;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const mobile = coarse || Math.min(window.innerWidth, window.innerHeight) < 560;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  let tier: Tier;
  if (mobile) tier = cores >= 6 && memory >= 4 ? 'medium' : 'low';
  else if (cores >= 8 && memory >= 8) tier = 'high';
  else if (cores >= 4) tier = 'medium';
  else tier = 'low';
  if (softwareRenderer()) tier = 'low';
  if (override && override in PROFILES) tier = override;

  const profile: QualityProfile = { ...PROFILES[tier], mobile };
  if (mobile) {
    profile.maxDpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1.5 : 2);
    profile.bloomLevels = Math.min(profile.bloomLevels, 5);
    profile.blackHoleSteps = Math.round(profile.blackHoleSteps * .8);
  } else {
    profile.maxDpr = Math.min(window.devicePixelRatio || 1, profile.maxDpr);
  }
  profile.minDpr = Math.min(profile.minDpr, profile.maxDpr);
  return profile;
}
