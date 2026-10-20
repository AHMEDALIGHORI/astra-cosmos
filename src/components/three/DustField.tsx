'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { journey } from '@/lib/journey';
import { mulberry32, pulse } from '@/lib/math';
import { useCosmic } from '@/lib/store';

const HALF_BOX = 310;
const wrap = (value: number) => THREE.MathUtils.euclideanModulo(value + HALF_BOX, HALF_BOX * 2) - HALF_BOX;

export function DustField({ count = 1600, streakCount = 480 }: { count?: number; streakCount?: number }) {
  const group = useRef<THREE.Group>(null);
  const streaks = useRef<THREE.LineSegments>(null);
  const camera = useThree((s) => s.camera);
  const reducedMotion = useCosmic((s) => s.reducedMotion);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const previous = useRef<THREE.Vector3 | null>(null);
  const shift = useMemo(() => new THREE.Vector3(), []);
  const positions = useMemo(() => {
    const random = mulberry32(404);
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) values.set([(random() * 2 - 1) * HALF_BOX, (random() * 2 - 1) * HALF_BOX, (random() * 2 - 1) * HALF_BOX], i * 3);
    return values;
  }, [count]);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    return g;
  }, [positions]);
  const material = useMemo(() => new THREE.PointsMaterial({ color: '#9fd3de', size: .42, transparent: true, opacity: .5, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }), []);
  const streakGeometry = useMemo(() => {
    const random = mulberry32(808);
    const values = new Float32Array(streakCount * 2 * 3);
    for (let i = 0; i < streakCount; i += 1) {
      const x = (random() * 2 - 1) * HALF_BOX;
      const y = (random() * 2 - 1) * HALF_BOX;
      const z = (random() * 2 - 1) * HALF_BOX;
      values.set([x, y, z, x, y, z], i * 6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(values, 3).setUsage(THREE.DynamicDrawUsage));
    return g;
  }, [streakCount]);
  const streakMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: '#d3eaf0', transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }), []);
  useEffect(() => () => { geometry.dispose(); streakGeometry.dispose(); }, [geometry, streakGeometry]);
  useEffect(() => () => { material.dispose(); streakMaterial.dispose(); }, [material, streakMaterial]);

  useFrame((_, delta) => {
    if (group.current) group.current.position.copy(camera.position);
    direction.set(journey.camera.vx, journey.camera.vy, journey.camera.vz);
    if (previous.current) shift.copy(camera.position).sub(previous.current);
    else previous.current = camera.position.clone();
    previous.current.copy(camera.position);
    const speed = direction.length();
    if (speed > 0) direction.normalize();
    else camera.getWorldDirection(direction).negate();

    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    {
      const shiftX = shift.x;
      const shiftY = shift.y;
      const shiftZ = shift.z;
      for (let i = 0; i < positionAttribute.count; i += 1) {
        let x = positionAttribute.getX(i) - shiftX;
        let y = positionAttribute.getY(i) - shiftY;
        let z = positionAttribute.getZ(i) - shiftZ;
        positionAttribute.setXYZ(i, wrap(x), wrap(y), wrap(z));
      }
      positionAttribute.needsUpdate = true;
    }

    const constellations = pulse(journey.ts, 3.95, 4.05, 5.3, 5.4);
    const nebula = pulse(journey.ts, 7, 7.12, 7.8, 8);
    const consultation = pulse(journey.ts, 9.75, 10, 11.1, 11.16);
    const finale = THREE.MathUtils.smoothstep(journey.ts, 11.12, 11.16);
    const opacity = (.42 + .4 * constellations + .2 * nebula) * (1 - .55 * consultation) * (1 - finale);
    material.opacity = opacity;

    const linePositions = streakGeometry.getAttribute('position') as THREE.BufferAttribute;
    const length = THREE.MathUtils.smoothstep(speed, 70, 520) * 24;
    for (let i = 0; i < streakCount; i += 1) {
      const x = wrap(linePositions.getX(i * 2) - shift.x);
      const y = wrap(linePositions.getY(i * 2) - shift.y);
      const z = wrap(linePositions.getZ(i * 2) - shift.z);
      linePositions.setXYZ(i * 2, x, y, z);
      linePositions.setXYZ(i * 2 + 1, x + direction.x * length, y + direction.y * length, z + direction.z * length);
    }
    linePositions.needsUpdate = true;
    streakMaterial.opacity = reducedMotion ? 0 : THREE.MathUtils.smoothstep(speed, 70, 520) * .55 * Math.min(2 * opacity, 1);
    if (streaks.current) streaks.current.visible = !reducedMotion && speed > 70;
  });

  return <group ref={group}>
    <points geometry={geometry} material={material} />
    <lineSegments ref={streaks} geometry={streakGeometry} material={streakMaterial} renderOrder={-1} />
  </group>;
}
