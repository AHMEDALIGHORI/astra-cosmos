'use client';
import { useEffect,useMemo,useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SUN } from '@/data/world';
import { journey } from '@/lib/journey';
import { planetVertex,sunFragment,coronaVertex,coronaFragment } from '@/shaders/planet';
import { allocateParticles,particleGeometry,particleMaterial,shared,visibleAt,beforeCollapse } from './shared';
export function Sun({geometry}:{geometry:THREE.SphereGeometry}) {
  const surface=useRef<THREE.Mesh>(null),corona=useRef<THREE.Mesh>(null);
  const resources=useMemo(()=>{
    const material=new THREE.ShaderMaterial({vertexShader:planetVertex,fragmentShader:sunFragment,uniforms:{uTime:shared.uTime,uIntensity:{value:1.35}}});
    const coronaGeometry=new THREE.PlaneGeometry(1,1);
    const glow=new THREE.ShaderMaterial({vertexShader:coronaVertex,fragmentShader:coronaFragment,uniforms:{uTime:shared.uTime,uSize:{value:SUN.radius*2*8},uExtent:{value:8},uIntensity:{value:1.05}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    const data=allocateParticles(1);data.sizes[0]=SUN.radius*7;data.colors.set([1,.9,.74]);
    return{material,coronaGeometry,glow,flareGeometry:particleGeometry(data),flareMaterial:particleMaterial({flare:true,minSize:26,maxSize:300,keepSmall:true,depthTest:false})};
  },[]);
  useEffect(()=>()=>{resources.material.dispose();resources.coronaGeometry.dispose();resources.glow.dispose();resources.flareGeometry.dispose();resources.flareMaterial.dispose();},[resources]);
  useFrame(({camera})=>{
    const near=visibleAt(journey.ts,[0,4.9]);
    if(surface.current){surface.current.visible=near;surface.current.rotation.y=shared.uTime.value*.01;}
    if(corona.current)corona.current.visible=near;
    const distance=camera.position.length();
    const recede=THREE.MathUtils.smoothstep(distance,3*SUN.radius,16*SUN.radius);
    resources.glow.uniforms.uIntensity.value=1.05-.25*recede;
    resources.flareMaterial.uniforms.uOpacity.value=(near||journey.ts>=11?1:0)*recede*(journey.ts>=11?1:.85)*beforeCollapse(journey.ts);
  });
  return <group position={SUN.position}><mesh ref={surface} geometry={geometry} material={resources.material} scale={SUN.radius}/><mesh ref={corona} geometry={resources.coronaGeometry} material={resources.glow}/><points geometry={resources.flareGeometry} material={resources.flareMaterial} renderOrder={2}/></group>;
}
