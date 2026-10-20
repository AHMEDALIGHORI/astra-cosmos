'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BODIES, type PlanetKind } from '@/data/world';
import { journey } from '@/lib/journey';
import { Planet } from './Planet';
import { Sun } from './Sun';
import { lineMaterial, segmentGeometry, shared } from './shared';

function makeInstrumentRing(radius: number, ticks: number) {
  const vertices: number[] = [];
  const segments = 180;
  for (let i = 0; i < segments; i += 1) {
    const a = i / segments * Math.PI * 2;
    const b = (i + 1) / segments * Math.PI * 2;
    vertices.push(Math.cos(a) * radius, Math.sin(a) * radius, 0, Math.cos(b) * radius, Math.sin(b) * radius, 0);
  }
  for (let i = 0; i < ticks; i += 1) {
    const angle = i / ticks * Math.PI * 2;
    const major = i % (ticks === 72 ? 6 : 3) === 0;
    const inner = radius;
    const outer = radius + (major ? .07 : .03) * BODIES.earth.radius;
    vertices.push(Math.cos(angle) * inner, Math.sin(angle) * inner, 0, Math.cos(angle) * outer, Math.sin(angle) * outer, 0);
  }
  return segmentGeometry(vertices);
}

function EarthInstrumentRing({ radius, ticks, rotation, direction }: { radius: number; ticks: number; rotation: [number, number, number]; direction: number }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => makeInstrumentRing(radius * BODIES.earth.radius, ticks), [radius, ticks]);
  const material = useMemo(() => lineMaterial({ color: '#EDEBE5', opacity: 0, nearFade: 6 }), []);
  const vertices = (180 + ticks) * 2;
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  useFrame(() => {
    const draw = THREE.MathUtils.smoothstep(journey.ts, 2.46, 2.66);
    const fade = 1 - THREE.MathUtils.smoothstep(journey.ts, 2.9, 3.04);
    material.uniforms.uDraw.value = draw;
    material.uniforms.uOpacity.value = .42 * fade;
    if (group.current) {
      group.current.visible = journey.warm || (journey.ts >= 2.42 && journey.ts <= 3.06);
      group.current.rotation.z = rotation[2] + direction * shared.uTime.value * .035;
    }
  });
  return <group ref={group} rotation={rotation}>
    <lineSegments geometry={geometry} material={material} />
  </group>;
}

function EarthInstrument() {
  return <group position={BODIES.earth.position}>
    <EarthInstrumentRing radius={1.7} ticks={72} rotation={[.42, 0, .12]} direction={1} />
    <EarthInstrumentRing radius={2.15} ticks={36} rotation={[-.5, .6, 1.02]} direction={-1} />
  </group>;
}

export function SolarSystem({ segments = 64, detail = 4 }: { segments?: number; detail?: number }) {
  const geometry = useMemo(() => new THREE.SphereGeometry(1, segments, Math.floor(segments * .66)), [segments]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <>
    <Sun geometry={geometry} />
    {(Object.keys(BODIES) as PlanetKind[]).map((name) => <Planet key={name} name={name} geometry={geometry} detail={detail} />)}
    <EarthInstrument />
  </>;
}
