'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { NEBULA } from '@/data/world';
import { gauss, mulberry32, pulse, smoothstep } from '@/lib/math';
import { journey } from '@/lib/journey';
import { nebulaVertex, nebulaFragment } from '@/shaders/nebula';
import { allocateParticles, particleGeometry, particleMaterial, shared, beforeCollapse, visibleAt } from './shared';

const ramp = [
  [0, new THREE.Color(.03, .09, .3)], [.24, new THREE.Color(.03, .22, .3)],
  [.44, new THREE.Color(.09, .27, .42)], [.58, new THREE.Color(.62, .33, .12)],
  [.7, new THREE.Color(.8, .56, .28)], [.84, new THREE.Color(.04, .21, .3)],
  [1, new THREE.Color(.03, .08, .25)],
] as const;
function colorAt(t: number) {
  for (let i = 1; i < ramp.length; i++) {
    if (t <= ramp[i][0]) return ramp[i - 1][1].clone().lerp(ramp[i][1], (t - ramp[i - 1][0]) / (ramp[i][0] - ramp[i - 1][0]));
  }
  return ramp[ramp.length - 1][1].clone();
}
function buildCloud(count: number, starCount: number) {
  const random = mulberry32(5150);
  const knots = Array.from({ length: 34 }, () => {
    const z = (random() * 2 - 1) * NEBULA.halfLength;
    const r = NEBULA.radius * (.16 + .84 * Math.sqrt(random()));
    const angle = random() * Math.PI * 2;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r * .62, z, spread: 60 + random() * 150 };
  });
  const sprites = (total: number, dust: boolean) => {
    const plane = new THREE.PlaneGeometry(1, 1);
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.index = plane.index?.clone() ?? null;
    geometry.setAttribute('position', plane.getAttribute('position').clone());
    geometry.setAttribute('uv', plane.getAttribute('uv').clone());
    plane.dispose();
    const centers = new Float32Array(total * 3), colors = new Float32Array(total * 3);
    const scales = new Float32Array(total), angles = new Float32Array(total), seeds = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      const knot = knots[Math.floor(random() * knots.length)];
      const x = knot.x + gauss(random) * knot.spread;
      const y = knot.y + gauss(random) * knot.spread * .7;
      const z = knot.z + gauss(random) * knot.spread * 1.3;
      centers.set([x, y, z], i * 3);
      const color = dust ? new THREE.Color(.006, .007, .012) : colorAt(THREE.MathUtils.clamp((NEBULA.halfLength - z) / (2 * NEBULA.halfLength), 0, 1));
      colors.set([color.r, color.g, color.b], i * 3);
      scales[i] = (dust ? 120 : 150) + random() ** 1.6 * (dust ? 260 : 380);
      angles[i] = random() * Math.PI * 2;
      seeds[i] = random() * 100;
    }
    geometry.setAttribute('aCenter', new THREE.InstancedBufferAttribute(centers, 3));
    geometry.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 1));
    geometry.setAttribute('aAngle', new THREE.InstancedBufferAttribute(angles, 1));
    geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    geometry.instanceCount = total;
    const material = new THREE.ShaderMaterial({ vertexShader: nebulaVertex, fragmentShader: nebulaFragment,
      defines: dust ? { DUST: '' } : {}, uniforms: { uTime: shared.uTime, uOpacity: { value: 0 } },
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: dust ? THREE.NormalBlending : THREE.AdditiveBlending });
    return { geometry, material };
  };
  const gas = sprites(count, false), dust = sprites(Math.floor(count * .3), true);
  const data = allocateParticles(starCount);
  for (let i = 0; i < starCount; i++) {
    const knot = knots[Math.floor(random() * knots.length)];
    data.positions.set([knot.x + gauss(random) * knot.spread, knot.y + gauss(random) * knot.spread * .7, knot.z + gauss(random) * knot.spread * 1.3], i * 3);
    data.sizes[i] = 1.1 + random() ** 5 * 22.9;
    const color = colorAt(random()).lerp(new THREE.Color(1, 1, 1), .75);
    data.colors.set([color.r, color.g, color.b], i * 3);
    data.rands.set([random(), random(), random(), random()], i * 4);
  }
  const stars = { geometry: particleGeometry(data), material: particleMaterial({ twinkle: 1, minSize: 1.1, maxSize: 24, softness: 4.5, nearFade: 14 }) };
  return { gas, dust, stars };
}
export function Nebula({ count = 240, starCount = 1000 }: { count?: number; starCount?: number }) {
  const group = useRef<THREE.Group>(null);
  const cloud = useMemo(() => buildCloud(count, starCount), [count, starCount]);
  useEffect(() => () => Object.values(cloud).forEach(({ geometry, material }) => { geometry.dispose(); material.dispose(); }), [cloud]);
  useFrame(() => {
    if (group.current) group.current.visible = visibleAt(journey.ts, [6.6, 8.5], [11, 12]);
    const opacity = Math.max(pulse(journey.ts, 6.66, 7.14, 8.2, 8.5), smoothstep(11, 11.14, journey.ts)) * beforeCollapse(journey.ts);
    for (const { material } of Object.values(cloud)) material.uniforms.uOpacity.value = opacity;
  });
  return <group ref={group} position={NEBULA.center}>
    <mesh geometry={cloud.gas.geometry} material={cloud.gas.material} frustumCulled={false} />
    <mesh geometry={cloud.dust.geometry} material={cloud.dust.material} renderOrder={1} frustumCulled={false} />
    <points geometry={cloud.stars.geometry} material={cloud.stars.material} renderOrder={2} />
  </group>;
}
