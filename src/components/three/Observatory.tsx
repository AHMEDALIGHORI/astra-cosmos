'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { GUIDE_STAR } from '@/data/world';
import { pulse } from '@/lib/math';
import { journey } from '@/lib/journey';
import { allocateParticles, particleGeometry, particleMaterial, shared } from './shared';

const RADIUS = 800;

function makeGrid() {
  const vertices: number[] = [];
  const add = (a: THREE.Vector3, b: THREE.Vector3) => { vertices.push(...a.toArray(), ...b.toArray()); };
  for (let longitude = 0; longitude < 360; longitude += 30) {
    const lon = THREE.MathUtils.degToRad(longitude);
    for (let latitude = -78; latitude < 78; latitude += 4) {
      const a = THREE.MathUtils.degToRad(latitude);
      const b = THREE.MathUtils.degToRad(latitude + 4);
      add(new THREE.Vector3(RADIUS * Math.cos(a) * Math.cos(lon), RADIUS * Math.sin(a), RADIUS * Math.cos(a) * Math.sin(lon)), new THREE.Vector3(RADIUS * Math.cos(b) * Math.cos(lon), RADIUS * Math.sin(b), RADIUS * Math.cos(b) * Math.sin(lon)));
    }
  }
  for (const latitude of [-60, -30, 0, 30, 60]) {
    const lat = THREE.MathUtils.degToRad(latitude);
    for (let longitude = 0; longitude < 360; longitude += 4) {
      const a = THREE.MathUtils.degToRad(longitude);
      const b = THREE.MathUtils.degToRad(longitude + 4);
      add(new THREE.Vector3(RADIUS * Math.cos(lat) * Math.cos(a), RADIUS * Math.sin(lat), RADIUS * Math.cos(lat) * Math.sin(a)), new THREE.Vector3(RADIUS * Math.cos(lat) * Math.cos(b), RADIUS * Math.sin(lat), RADIUS * Math.cos(lat) * Math.sin(b)));
    }
  }
  for (let longitude = 0; longitude < 360; longitude += 2) {
    const a = THREE.MathUtils.degToRad(longitude);
    const length = longitude % 10 === 0 ? 1.5 : .6;
    const lat = THREE.MathUtils.degToRad(length / 2);
    add(new THREE.Vector3(RADIUS * Math.cos(lat) * Math.cos(a), -RADIUS * Math.sin(lat), RADIUS * Math.cos(lat) * Math.sin(a)), new THREE.Vector3(RADIUS * Math.cos(lat) * Math.cos(a), RADIUS * Math.sin(lat), RADIUS * Math.cos(lat) * Math.sin(a)));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return geometry;
}

export function Observatory() {
  const camera = useThree((s) => s.camera);
  const grid = useRef<THREE.LineSegments>(null);
  const guide = useRef<THREE.Points>(null);
  const geometry = useMemo(makeGrid, []);
  const guideGeometry = useMemo(() => {
    const data = allocateParticles(1);
    data.sizes[0] = 34;
    data.colors.set([1, .93, .8]);
    data.rands.set([.3, .7, .2, .9]);
    return particleGeometry(data);
  }, []);
  const guideMaterial = useMemo(() => particleMaterial({ flare: true, minSize: 16, maxSize: 180, twinkle: .5, keepSmall: true }), []);
  useEffect(() => () => { geometry.dispose(); guideGeometry.dispose(); guideMaterial.dispose(); }, [geometry, guideGeometry, guideMaterial]);

  useFrame(({ clock }, delta) => {
    if (grid.current) {
      grid.current.position.copy(camera.position);
      grid.current.rotation.set(.41, .3 + shared.uTime.value * .004, .12);
      (grid.current.material as THREE.LineBasicMaterial).opacity = .1 * pulse(journey.ts, 8.88, 9.4, 11.02, 11.18);
    }
    if (guide.current) {
      const t = shared.uTime.value;
      guide.current.position.set(GUIDE_STAR.position[0] + Math.sin(t * .07) * 42, GUIDE_STAR.position[1] + Math.sin(t * .11) * 22, GUIDE_STAR.position[2]);
      guideMaterial.uniforms.uOpacity.value = pulse(journey.ts, 9.55, 10.12, 11.12, 11.36);
    }
    void delta;
  });

  return <>
    <lineSegments ref={grid} geometry={geometry} renderOrder={-80}>
      <lineBasicMaterial color="#B7C4DA" transparent opacity={0} depthTest={false} depthWrite={false} />
    </lineSegments>
    <points ref={guide} geometry={guideGeometry} material={guideMaterial} position={GUIDE_STAR.position} renderOrder={-79} />
  </>;
}
