import * as THREE from 'three';
import { journey } from '@/lib/journey';
import { particleVertex, particleFragment, lineVertex, lineFragment } from '@/shaders/particles';
import { shared } from '@/lib/three/shared';
export { shared };

export const beforeCollapse = (ts: number) => 1 - THREE.MathUtils.smoothstep(ts, 11.5, 11.62);
export const visibleAt = (ts: number, ...ranges: [number, number][]) =>
  journey.warm || ranges.some(([from, to]) => ts >= from && ts <= to);

export function disposeTree(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose());
    else mesh.material?.dispose();
  });
}
export interface ParticleData {
  positions: Float32Array; sizes: Float32Array; colors: Float32Array; rands: Float32Array;
}
export function allocateParticles(count: number): ParticleData {
  return { positions: new Float32Array(count * 3), sizes: new Float32Array(count), colors: new Float32Array(count * 3), rands: new Float32Array(count * 4) };
}
export function particleGeometry(data: ParticleData) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(data.sizes, 1));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(data.colors, 3));
  geometry.setAttribute('aRand', new THREE.BufferAttribute(data.rands, 4));
  return geometry;
}
interface ParticleOptions {
  orbit?: boolean; dissolve?: boolean; flare?: boolean; occlude?: boolean;
  opacity?: number; minSize?: number; maxSize?: number; softness?: number; twinkle?: number;
  nearFade?: number; keepSmall?: boolean; depthTest?: boolean; blending?: THREE.Blending;
  extra?: Record<string, THREE.IUniform>;
}
export function particleMaterial(options: ParticleOptions = {}) {
  const defines: Record<string, string> = {};
  if (options.orbit) defines.ORBIT = '';
  if (options.dissolve) defines.DISSOLVE = '';
  if (options.flare) defines.FLARE = '';
  if (options.occlude) defines.OCCLUDE = '';
  return new THREE.ShaderMaterial({
    vertexShader: particleVertex, fragmentShader: particleFragment, defines,
    uniforms: {
      uTime: shared.uTime, uScale: shared.uScale, uPixelRatio: shared.uPixelRatio,
      uOpacity: { value: options.opacity ?? 1 }, uMinSize: { value: options.minSize ?? 1 },
      uMaxSize: { value: options.maxSize ?? 64 }, uSoftness: { value: options.softness ?? 2.2 },
      uTwinkle: { value: options.twinkle ?? 0 }, uNearFade: { value: options.nearFade ?? 0 },
      uKeepSmall: { value: options.keepSmall ? 1 : 0 }, uSpin: { value: 0 },
      uOrbitPower: { value: -1.5 }, uReveal: { value: 1 }, uDissolve: { value: 0 },
      uSpread: { value: 60 }, uOcclude: { value: 0 }, ...options.extra,
    }, transparent: true, depthWrite: false, depthTest: options.depthTest ?? true,
    blending: options.blending ?? THREE.AdditiveBlending,
  });
}
export function lineMaterial(options: { color?: THREE.ColorRepresentation; opacity?: number; draw?: number; nearFade?: number; depthTest?: boolean; additive?: boolean } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: lineVertex, fragmentShader: lineFragment,
    uniforms: { uColor: { value: new THREE.Color(options.color ?? '#EDEBE5') }, uOpacity: { value: options.opacity ?? 1 }, uDraw: { value: options.draw ?? 1 }, uNearFade: { value: options.nearFade ?? 0 } },
    transparent: true, depthWrite: false, depthTest: options.depthTest ?? true,
    blending: options.additive === false ? THREE.NormalBlending : THREE.AdditiveBlending,
  });
}
export function segmentGeometry(points: number[], order?: number[]) {
  const geometry = new THREE.BufferGeometry();
  const count = points.length / 3;
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geometry.setAttribute('aT', new THREE.Float32BufferAttribute(Array.from({ length: count }, (_, i) => order?.[i] ?? (count > 1 ? i / (count - 1) : 0)), 1));
  return geometry;
}
