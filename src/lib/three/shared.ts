import * as THREE from 'three';

export const shared = {
  uTime: { value: 0 },
  uScale: { value: 720 },
  uPixelRatio: { value: 1 },
  uSky: { value: null as THREE.Texture | null },
  uHasSky: { value: 0 },
  uSkyGain: { value: 1 },
};
