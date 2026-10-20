'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { at, journey } from '@/lib/journey';
import { mulberry32, smoothstep } from '@/lib/math';
import { cameraPath } from '@/lib/camera/rig';
import { BODIES, CONSTELLATION_ZONE, GUIDE_STAR, NUMEROLOGY, WORLD_CENTER } from '@/data/world';
import { allocateParticles, particleGeometry, particleMaterial, lineMaterial, segmentGeometry } from './shared';
const SEGMENTS = 1100;
const OFFSETS = [[1,.4],[-1,-.6],[.8,.8],[-.9,-.3],[1,-.7],[-.8,.6],[.9,.2],[-1,-.8],[.7,.7],[-.9,.3],[1,-.5],[-.8,-.2]];
export function JourneyTrail() {
  const points = useRef<THREE.Points>(null);
  const system = useMemo(() => {
    const vertices: number[] = [];
    for(let i = 0; i <= SEGMENTS; i++) {
      const p = cameraPath(at('finale') * i / SEGMENTS);
      vertices.push(p.x,p.y,p.z);
    }
    const line = new THREE.Line(segmentGeometry(vertices), lineMaterial({ color: '#EDEBE5', opacity: 0, depthTest: false }));
    line.frustumCulled = false;
    const beacons = Object.values(BODIES).map((body) => ({ position: body.position, color: body.beacon, size: 70 }));
    OFFSETS.forEach(([x,y], i) => beacons.push({ position: [x * 44,y * 22,CONSTELLATION_ZONE.startZ - i * CONSTELLATION_ZONE.spacing], color: [.8,.86,1], size: 50 }));
    beacons.push({ position: NUMEROLOGY.hero, color: [1,.86,.62], size: 80 }, { position: GUIDE_STAR.position, color: [1,.94,.82], size: 90 });
    const data = allocateParticles(beacons.length), random = mulberry32(1100);
    beacons.forEach((beacon,i) => {
      data.positions.set(beacon.position,i*3); data.colors.set(beacon.color,i*3); data.sizes[i]=beacon.size;
      data.rands.set([random(),random(),random(),random()],i*4);
    });
    const origin = allocateParticles(1);
    origin.positions.set(WORLD_CENTER); origin.colors.set([1,.94,.82]); origin.sizes[0]=34;
    return { line, data, beaconGeometry: particleGeometry(data), beaconMaterial: particleMaterial({ minSize:2.4,maxSize:14,keepSmall:true,depthTest:false }), originGeometry: particleGeometry(origin), originMaterial: particleMaterial({ flare:true,minSize:34,maxSize:34,keepSmall:true,depthTest:false }) };
  }, []);
  useEffect(() => () => { system.line.geometry.dispose(); system.line.material.dispose(); system.beaconGeometry.dispose(); system.beaconMaterial.dispose(); system.originGeometry.dispose(); system.originMaterial.dispose(); }, [system]);
  useFrame(() => {
    const collapse=smoothstep(11.48,11.62,journey.ts);
    system.line.material.uniforms.uDraw.value=smoothstep(11.14,11.4,journey.ts);
    system.line.material.uniforms.uOpacity.value=.55*(1-collapse);
    system.beaconMaterial.uniforms.uOpacity.value=smoothstep(11.12,11.26,journey.ts)*(1-collapse);
    system.originMaterial.uniforms.uOpacity.value=smoothstep(11.5,11.64,journey.ts)*(.86+.14*Math.sin(1.3*journey.time));
    if(points.current) {
      points.current.scale.setScalar(1-collapse);
      points.current.position.set(WORLD_CENTER[0]*collapse,WORLD_CENTER[1]*collapse,WORLD_CENTER[2]*collapse);
    }
  });
  return <><primitive object={system.line}/><points ref={points} geometry={system.beaconGeometry} material={system.beaconMaterial} frustumCulled={false}/><points geometry={system.originGeometry} material={system.originMaterial} renderOrder={10} frustumCulled={false}/></>;
}
