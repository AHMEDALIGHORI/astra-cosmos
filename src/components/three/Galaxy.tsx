'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GALAXY } from '@/data/world';
import { journey } from '@/lib/journey';
import { gauss, mulberry32, smoothstep } from '@/lib/math';
import { allocateParticles, particleGeometry, particleMaterial, beforeCollapse, shared } from './shared';
export function Galaxy({ count = 16000 }: { count?: number }) {
  const group=useRef<THREE.Group>(null);
  const system=useMemo(() => {
    const random=mulberry32(31415), data=allocateParticles(count), R=GALAXY.radius;
    for(let i=0;i<count;i++) {
      const bulge=random()<.2;
      const radius=(bulge?random()**.7*.24:.08+random()**.75*.92)*R;
      const angle=bulge?random()*Math.PI*2:(i%2)*Math.PI+2.25*Math.log(radius/(.08*R))+gauss(random)*.16;
      data.positions.set([Math.cos(angle)*radius,gauss(random)*R*(bulge?.065:.018),Math.sin(angle)*radius],i*3);
      const color=new THREE.Color(1,.82,.62).lerp(new THREE.Color(.4,.62,1),radius/R);
      if(random()<.045) color.setRGB(1,.32,.48);
      data.colors.set([color.r,color.g,color.b],i*3);
      const r=random(); data.sizes[i]=5+8*r+26*r**9;
      data.rands.set([random(),random(),random(),random()],i*4);
    }
    const core=allocateParticles(1); core.sizes[0]=.55*R; core.colors.set([1,.82,.62]);
    return { geometry:particleGeometry(data),material:particleMaterial({minSize:1,maxSize:16,softness:3}),coreGeometry:particleGeometry(core),coreMaterial:particleMaterial({maxSize:520,softness:2.2}) };
  },[count]);
  useEffect(()=>()=>{system.geometry.dispose();system.material.dispose();system.coreGeometry.dispose();system.coreMaterial.dispose();},[system]);
  useFrame(()=>{
    const t=journey.ts;
    const opacity=Math.max(smoothstep(7.55,7.95,t)*(1-smoothstep(8.5,8.64,t)),smoothstep(11,11.14,t)*.55)*beforeCollapse(t);
    system.material.uniforms.uOpacity.value=opacity*.6; system.coreMaterial.uniforms.uOpacity.value=opacity*.22;
    if(group.current) group.current.rotation.y=.2+shared.uTime.value*.006;
  });
  return <group ref={group} position={GALAXY.position} rotation={[1.02,.2,.5]}><points geometry={system.geometry} material={system.material}/><points geometry={system.coreGeometry} material={system.coreMaterial}/></group>;
}
