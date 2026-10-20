'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useFrame, useThree } from '@react-three/fiber';
import { NUMEROLOGY } from '@/data/world';
import { journey } from '@/lib/journey';
import { mulberry32, smoothstep } from '@/lib/math';
import { ensureDisplayFont, sampleGlyph } from '@/lib/three/glyphs';
import { useCosmic } from '@/lib/store';
import { glyphVertex, glyphFragment } from '@/shaders/glyph';

const HEIGHTS = [18, -22, 8, -14, 24, -6, 16, -20, 4];

function createGlyphMaterial(color: string, size: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uForm: { value: 0 }, uMix: { value: 0 }, uOrbit: { value: 0 }, uDissolve: { value: 0 },
      uSize: { value: size }, uOpacity: { value: 0 }, uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Color(color) }, uAccent: { value: new THREE.Color(1, .8, .52) },
    },
    vertexShader: glyphVertex,
    fragmentShader: glyphFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

function makeCloud(count: number, seed: number, scale: number) {
  const random = mulberry32(seed);
  const start = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 18 + random() * 70;
    start[i * 3] = Math.cos(angle) * radius;
    start[i * 3 + 1] = Math.sin(angle) * radius;
    start[i * 3 + 2] = (random() - .5) * 40;
    scatter[i * 3] = (random() - .5) * 420;
    scatter[i * 3 + 1] = (random() - .5) * 260;
    scatter[i * 3 + 2] = (random() - .5) * 300;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(start.slice(), 3));
  geometry.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
  geometry.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3));
  const target = new Float32Array(count * 3);
  geometry.setAttribute('aGlyph', new THREE.BufferAttribute(target, 3));
  geometry.setAttribute('aMorph', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const orbit = new Float32Array(count * 3);
  const randoms = new Float32Array(count * 4);
  const orbitRandom = mulberry32(seed + 83);
  const radii = [.62, .9, 1.18, 1.46];
  for (let i = 0; i < count; i += 1) {
    const angle = orbitRandom() * Math.PI * 2;
    const radius = radii[Math.floor(orbitRandom() * radii.length)] * 150;
    orbit.set([Math.cos(angle) * radius, Math.sin(angle) * radius, (orbitRandom() - .5) * 18], i * 3);
    randoms.set([orbitRandom(), orbitRandom(), orbitRandom(), orbitRandom()], i * 4);
  }
  geometry.setAttribute('aOrbit', new THREE.BufferAttribute(orbit, 3));
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 4));
  geometry.userData.glyphScale = scale;
  return geometry;
}

function applyGlyph(geometry: THREE.BufferGeometry, text: string, seed: number) {
  const attribute = geometry.getAttribute('aGlyph') as THREE.BufferAttribute;
  const points = sampleGlyph(text, attribute.count, seed);
  const scale = Number(geometry.userData.glyphScale ?? 1);
  for (let i = 0; i < points.length; i += 1) points[i] *= scale;
  attribute.array.set(points);
  attribute.needsUpdate = true;
}

function applyMorphGlyph(geometry: THREE.BufferGeometry, text: string, seed: number) {
  const attribute = geometry.getAttribute('aMorph') as THREE.BufferAttribute;
  const points = sampleGlyph(text, attribute.count, seed);
  const scale = Number(geometry.userData.glyphScale ?? 1);
  for (let i = 0; i < points.length; i += 1) points[i] *= scale;
  attribute.array.set(points);
  attribute.needsUpdate = true;
}

export function NumerologyField({ count = 900, heroCount = 3200 }: { count?: number; heroCount?: number }) {
  const reading = useCosmic((state) => state.reading);
  const reducedMotion = useCosmic((state) => state.reducedMotion);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const [fontReady, setFontReady] = useState(false);
  const lastNumber = useRef(reading?.lifePath.number ?? 7);
  const lastBirth = useRef(reading ? `${reading.birth.day}/${reading.birth.month}/${reading.birth.year}` : null);
  const heroPoints = useRef<THREE.Points>(null);
  const heroMorph = useRef({ uMix: 0, uOrbit: 0 });
  const morphTimeline = useRef<gsap.core.Timeline | null>(null);
  const heroNumber = reading?.lifePath.number ?? 7;
  useEffect(() => { void ensureDisplayFont().then(() => setFontReady(true)); }, []);

  const digitClouds = useMemo(() => fontReady ? Array.from({ length: 9 }, (_, digit) => {
    const geometry = makeCloud(count, 700 + digit * 37, NUMEROLOGY.digitHeight);
    applyGlyph(geometry, String(digit + 1), digit + 1);
    return geometry;
  }) : [], [count, fontReady]);
  const digitMaterials = useMemo(() => Array.from({ length: 9 }, () => createGlyphMaterial('#ede8dc', 1.5)), []);
  const heroGeometry = useMemo(() => {
    if (!fontReady) return null;
    const geometry = makeCloud(heroCount, 1207, NUMEROLOGY.heroHeight);
    applyGlyph(geometry, '7', 7);
    applyMorphGlyph(geometry, '7', 7);
    return geometry;
  }, [fontReady, heroCount]);
  const heroMaterial = useMemo(() => createGlyphMaterial('#ede8dc', 1.5), []);
  const digitGroups = useRef<Array<THREE.Group | null>>([]);

  useEffect(() => {
    if (!heroGeometry || !fontReady) return;
    const birthKey = reading ? `${reading.birth.day}/${reading.birth.month}/${reading.birth.year}` : null;
    if (lastNumber.current !== heroNumber || lastBirth.current !== birthKey) {
      const firstTarget = heroGeometry.getAttribute('aGlyph') as THREE.BufferAttribute;
      const nextTarget = heroGeometry.getAttribute('aMorph') as THREE.BufferAttribute;
      // Snapshot the current interpolated glyph before retargeting. The orbit
      // amount is preserved and eased out, so repeated casts never snap.
      for (let i = 0; i < firstTarget.array.length; i++) {
        firstTarget.array[i] = THREE.MathUtils.lerp(firstTarget.array[i], nextTarget.array[i], heroMorph.current.uMix);
      }
      firstTarget.needsUpdate = true;
      applyMorphGlyph(heroGeometry, String(heroNumber), heroNumber);
      heroMorph.current.uMix = 0;
      morphTimeline.current?.kill();
      if (reducedMotion) {
        heroMorph.current.uMix = 1;
        heroMorph.current.uOrbit = 0;
      } else morphTimeline.current = gsap.timeline()
        .to(heroMorph.current, { uOrbit: 0, duration: .6 })
        .to(heroMorph.current, { uMix: 1, duration: 1.7, ease: 'power2.inOut' })
        .to(heroMorph.current, { uOrbit: 1, duration: 2.4 }, '+=.9');
    }
    lastNumber.current = heroNumber;
    lastBirth.current = birthKey;
  }, [fontReady, heroGeometry, heroNumber, reading, reducedMotion]);
  useEffect(() => () => { morphTimeline.current?.kill(); }, []);

  useEffect(() => () => { digitClouds.forEach((geometry) => geometry.dispose()); }, [digitClouds]);
  useEffect(() => () => { heroGeometry?.dispose(); }, [heroGeometry]);
  useEffect(() => () => { digitMaterials.forEach((material) => material.dispose()); heroMaterial.dispose(); }, [digitMaterials, heroMaterial]);

  useFrame(() => {
    if (!fontReady) return;
    const time = journey.ts;
    const formation = smoothstep(4.96, 5.24, time);
    digitClouds.forEach((geometry, digit) => {
      const releaseAt = 5.46 + ((digit * 4) % 9) * .014;
      const release = smoothstep(releaseAt, releaseAt + .16, time);
      const uniforms = (digitMaterials[digit] as THREE.ShaderMaterial).uniforms;
      uniforms.uForm.value = smoothstep(5, 5.26, time);
      uniforms.uDissolve.value = release;
      uniforms.uOpacity.value = .78 * formation * (1 - release);
      uniforms.uPixelRatio.value = gl.getPixelRatio();
      if (digitGroups.current[digit]) {
        const angle = digit / 9 * Math.PI * 2 + (time - 5) * 1.5 + (reducedMotion ? 0 : journey.time * .015);
        digitGroups.current[digit]!.position.set(Math.cos(angle) * NUMEROLOGY.ringRadius, HEIGHTS[digit], Math.sin(angle) * NUMEROLOGY.ringRadius);
        digitGroups.current[digit]!.quaternion.copy(camera.quaternion);
        digitGroups.current[digit]!.visible = journey.warm || (time >= 4.78 && time <= 5.82);
      }
    });

    if (heroGeometry) {
      const heroForm = smoothstep(5.44, 5.72, time);
      const heroRelease = smoothstep(6.88, 7.05, time);
      const uniforms = heroMaterial.uniforms;
      uniforms.uForm.value = heroForm;
      uniforms.uMix.value = heroMorph.current.uMix;
      uniforms.uOrbit.value = heroMorph.current.uOrbit;
      uniforms.uDissolve.value = heroRelease;
      const settle = smoothstep(5.72, 6, time);
      const chartOpacity = journey.viewport.height > journey.viewport.width ? .26 : .5;
      uniforms.uOpacity.value = THREE.MathUtils.lerp(.86, chartOpacity, settle) * heroForm * (1 - heroRelease);
      uniforms.uSize.value = THREE.MathUtils.lerp(1.5, .85, settle);
      uniforms.uPixelRatio.value = gl.getPixelRatio();
      if (heroPoints.current) {
        heroPoints.current.quaternion.copy(camera.quaternion);
        heroPoints.current.scale.setScalar(THREE.MathUtils.lerp(1, .62, settle));
        heroPoints.current.visible = journey.warm || (time >= 4.78 && time <= 7.12);
      }
    }
  });

  if (!fontReady) return null;
  return <group position={NUMEROLOGY.center}>
    {digitClouds.map((geometry, index) => <group key={index} ref={(node) => { digitGroups.current[index] = node; }}><points geometry={geometry} material={digitMaterials[index]} /></group>)}
    {heroGeometry && <points ref={heroPoints} geometry={heroGeometry} material={heroMaterial} frustumCulled={false} position={[NUMEROLOGY.hero[0] - NUMEROLOGY.center[0], NUMEROLOGY.hero[1] - NUMEROLOGY.center[1], NUMEROLOGY.hero[2] - NUMEROLOGY.center[2]]} />}
  </group>;
}
