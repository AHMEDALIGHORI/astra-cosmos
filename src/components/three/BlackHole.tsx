'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BLACK_HOLE } from '@/data/world';
import { blackHoleFragment, blackHoleVertex } from '@/shaders/blackhole';
import { journey } from '@/lib/journey';
import { useCosmic } from '@/lib/store';
import { mulberry32, smoothstep } from '@/lib/math';
import { createNoiseTexture } from '@/lib/three/textures';
import { allocateParticles, particleGeometry, particleMaterial, shared, visibleAt, beforeCollapse } from './shared';

export function BlackHole() {
  const quality = useCosmic((s) => s.quality);
  const root = useRef<THREE.Group>(null);
  const system = useMemo(() => {
    const noise = createNoiseTexture();
    const lensGeometry = new THREE.SphereGeometry(BLACK_HOLE.rs * BLACK_HOLE.influence, 64, 48);
    const lensMaterial = new THREE.ShaderMaterial({
      vertexShader: blackHoleVertex, fragmentShader: blackHoleFragment,
      defines: { STEPS: quality.blackHoleSteps, STEP_SCALE: THREE.MathUtils.clamp(12 / quality.blackHoleSteps, .1, .26).toFixed(6) },
      transparent: true, depthTest: false, depthWrite: false, side: THREE.BackSide,
      uniforms: {
        uTime: shared.uTime, uOpacity: { value: 0 }, uSpin: { value: 1 }, uIntensity: { value: .72 }, uStarGain: { value: 1 },
        uRs: { value: BLACK_HOLE.rs }, uInner: { value: BLACK_HOLE.diskInner }, uOuter: { value: BLACK_HOLE.diskOuter },
        uInfluence: { value: BLACK_HOLE.influence }, uCentre: { value: new THREE.Vector3(...BLACK_HOLE.position) },
        uNoise: { value: noise }, uSky: shared.uSky, uSkyGain: shared.uSkyGain, uHasSky: shared.uHasSky,
      },
    });
    const random = mulberry32(93517), data = allocateParticles(quality.blackHoleParticles);
    for(let i = 0; i < quality.blackHoleParticles; i++) {
      const fraction = random() ** 1.4;
      const radius = BLACK_HOLE.rs * (6.2 + fraction * 10.8), angle = random() * Math.PI * 2;
      data.positions.set([Math.cos(angle) * radius, (random() - .5) * BLACK_HOLE.rs * .04, Math.sin(angle) * radius], i * 3);
      data.sizes[i] = 1 + random() * 8;
      const color = new THREE.Color(.45, .035, .008).lerp(new THREE.Color(1, .84, .61), 1 - fraction).multiplyScalar(1 - .8 * fraction);
      data.colors.set([color.r, color.g, color.b], i * 3);
      data.rands.set([random(), random(), random(), random()], i * 4);
    }
    return { noise, lensGeometry, lensMaterial, debrisGeometry: particleGeometry(data), debrisMaterial: particleMaterial({ orbit: true, occlude: true, nearFade: 60, minSize: 1, maxSize: 9, depthTest: false, extra: { uOcclude: { value: 5.6 * BLACK_HOLE.rs } } }) };
  }, [quality.blackHoleSteps, quality.blackHoleParticles]);
  useEffect(() => () => { system.noise.dispose(); system.lensGeometry.dispose(); system.lensMaterial.dispose(); system.debrisGeometry.dispose(); system.debrisMaterial.dispose(); }, [system]);
  useFrame(() => {
    const t = journey.ts;
    if(root.current) root.current.visible = visibleAt(t, [7.66, 8.72], [8.79, 12]);
    const reveal = smoothstep(7.66, 8, t) * beforeCollapse(t);
    const plunge = t > 8.75 ? 0 : smoothstep(8.2, 8.66, t);
    system.lensMaterial.uniforms.uOpacity.value = reveal;
    system.lensMaterial.uniforms.uSpin.value = 1 + 3.6 * plunge;
    system.debrisMaterial.uniforms.uOpacity.value = .8 * reveal;
    system.debrisMaterial.uniforms.uSpin.value = 1150 * (1 + 3.6 * plunge);
  });
  return <group ref={root} position={BLACK_HOLE.position}>
    <mesh geometry={system.lensGeometry} material={system.lensMaterial} renderOrder={4} />
    <points geometry={system.debrisGeometry} material={system.debrisMaterial} renderOrder={5} />
  </group>;
}
