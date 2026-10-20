'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BODIES, type PlanetKind, type V3 } from '@/data/world';
import { journey } from '@/lib/journey';
import { planetVertex, rockyFragment, earthFragment, gasFragment, atmosphereVertex, atmosphereFragment, ringVertex, ringFragment } from '@/shaders/planet';
import { shared, visibleAt } from './shared';
const ROCK: Partial<Record<PlanetKind, { a:V3;b:V3;dark:V3;crater:number;bump:number;maria:number;polar:number;ridge:number }>> = {
  mercury:{a:[.3,.28,.26],b:[.52,.47,.42],dark:[.2,.19,.18],crater:1,bump:.22,maria:.25,polar:0,ridge:0},
  moon:{a:[.42,.41,.4],b:[.6,.59,.57],dark:[.17,.17,.18],crater:.9,bump:.2,maria:.9,polar:0,ridge:0},
  mars:{a:[.42,.15,.07],b:[.66,.3,.14],dark:[.14,.07,.05],crater:.3,bump:.16,maria:.75,polar:1,ridge:.12},
};
const GAS: Partial<Record<PlanetKind,{palette:V3[];band:number;turbulence:number;contrast:number;wrap:number;streaks:number;storm?:{position:V3;size:[number,number];color:V3}}>> = {
  venus:{palette:[[.74,.62,.4],[.55,.42,.23],[.82,.74,.56],[.47,.34,.17],[.7,.58,.37]],band:5,turbulence:3.2,contrast:.9,wrap:.3,streaks:0},
  jupiter:{palette:[[.4,.24,.15],[.66,.45,.29],[.84,.75,.61],[.7,.42,.25],[.9,.85,.77]],band:15,turbulence:1.6,contrast:1,wrap:.06,streaks:0,storm:{position:[-.72,-.37,.58],size:[.2,.115],color:[.62,.25,.14]}},
  saturn:{palette:[[.88,.8,.62],[.8,.7,.5],[.93,.88,.73],[.72,.62,.45],[.84,.74,.55]],band:12,turbulence:.8,contrast:.45,wrap:.08,streaks:0},
  uranus:{palette:[[.4,.66,.71],[.46,.72,.75],[.38,.64,.7],[.5,.76,.78],[.42,.68,.73]],band:6,turbulence:.5,contrast:.15,wrap:.12,streaks:0},
  neptune:{palette:[[.035,.09,.36],[.06,.16,.54],[.045,.11,.42],[.09,.22,.64],[.05,.13,.47]],band:9,turbulence:1.2,contrast:.5,wrap:.1,streaks:1,storm:{position:[.5,-.3,.8],size:[.16,.09],color:[.03,.07,.28]}},
};
export function Planet({name,geometry,detail}:{name:PlanetKind;geometry:THREE.SphereGeometry;detail:number}) {
  const body=BODIES[name], group=useRef<THREE.Group>(null),surface=useRef<THREE.Mesh>(null);
  const inverse=useMemo(()=>new THREE.Quaternion(),[]), sun=useMemo(()=>new THREE.Vector3(),[]), eye=useMemo(()=>new THREE.Vector3(),[]);
  const resources=useMemo(()=>{
    const rock=ROCK[name],gas=GAS[name];
    const uniforms:Record<string,THREE.IUniform>={uSunDir:{value:new THREE.Vector3()},uCamPos:{value:new THREE.Vector3()},uTime:shared.uTime,uSeed:{value:body.position[2]*.013+body.radius},uLight:{value:1},uDetail:{value:1}};
    if(rock)Object.assign(uniforms,{uAlbedoA:{value:new THREE.Color(...rock.a)},uAlbedoB:{value:new THREE.Color(...rock.b)},uAlbedoDark:{value:new THREE.Color(...rock.dark)},uCrater:{value:rock.crater},uBump:{value:rock.bump},uMaria:{value:rock.maria},uPolar:{value:rock.polar},uRidge:{value:rock.ridge}});
    if(gas)Object.assign(uniforms,{uPalette:{value:gas.palette.map(c=>new THREE.Color(...c))},uBandFreq:{value:gas.band},uTurbulence:{value:gas.turbulence},uContrast:{value:gas.contrast},uWrap:{value:gas.wrap},uStreaks:{value:gas.streaks},uStorm:{value:gas.storm?1:0},uStormPos:{value:new THREE.Vector3(...(gas.storm?.position??[0,1,0]))},uStormSize:{value:new THREE.Vector2(...(gas.storm?.size??[1,1]))},uStormColor:{value:new THREE.Color(...(gas.storm?.color??[1,1,1]))},uRingInner:{value:body.rings?.inner??0},uRingOuter:{value:body.rings?.outer??0}});
    const material=new THREE.ShaderMaterial({vertexShader:planetVertex,fragmentShader:name==='earth'?earthFragment:gas?gasFragment:rockyFragment,defines:{OCTAVES:detail,...(body.rings?.style===0?{HAS_RINGS:'',RING_STYLE:0}:{})},uniforms});
    const frame={uSunDir:{value:new THREE.Vector3()},uCamPos:{value:new THREE.Vector3()},uLight:uniforms.uLight};
    const atmosphere=body.atmosphere?new THREE.ShaderMaterial({vertexShader:atmosphereVertex,fragmentShader:atmosphereFragment,uniforms:{...frame,uShell:{value:body.atmosphere.shell},uColor:{value:new THREE.Color(...body.atmosphere.color)},uSunsetColor:{value:new THREE.Color(...body.atmosphere.sunset)},uDensity:{value:body.atmosphere.density},uFalloff:{value:body.atmosphere.falloff},uMie:{value:body.atmosphere.mie}},side:THREE.BackSide,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending}):null;
    const ringGeometry=body.rings?new THREE.RingGeometry(body.rings.inner,body.rings.outer,180):null;
    const ring=body.rings?new THREE.ShaderMaterial({vertexShader:ringVertex,fragmentShader:ringFragment,defines:{RING_STYLE:body.rings.style},uniforms:{...frame,uInner:{value:body.rings.inner},uOuter:{value:body.rings.outer},uTintA:{value:body.rings.style===0?new THREE.Color(.78,.69,.56):new THREE.Color(.3,.36,.38)},uTintB:{value:body.rings.style===0?new THREE.Color(.93,.87,.76):new THREE.Color(.48,.55,.57)}},transparent:true,side:THREE.DoubleSide,depthWrite:false}):null;
    return{material,atmosphere,ringGeometry,ring,frame};
  },[body,detail,name]);
  useEffect(()=>()=>{resources.material.dispose();resources.atmosphere?.dispose();resources.ringGeometry?.dispose();resources.ring?.dispose();},[resources]);
  useFrame(({camera})=>{
    if(!group.current||!surface.current)return;
    group.current.visible=visibleAt(journey.ts,body.visible);
    if(!group.current.visible)return;
    surface.current.rotation.y=(journey.ts-(body.focus??(body.visible[0]+body.visible[1])*.5))*1.1*Math.sign(body.spin)+shared.uTime.value*body.spin*.25;
    group.current.updateWorldMatrix(true,true);
    group.current.getWorldQuaternion(inverse).invert();
    sun.set(...body.position).negate().normalize().applyQuaternion(inverse);
    eye.copy(camera.position).sub(group.current.position).divideScalar(body.radius).applyQuaternion(inverse);
    resources.frame.uSunDir.value.copy(sun);resources.frame.uCamPos.value.copy(eye);
    surface.current.getWorldQuaternion(inverse).invert();
    resources.material.uniforms.uSunDir.value.set(...body.position).negate().normalize().applyQuaternion(inverse);
    resources.material.uniforms.uCamPos.value.copy(camera.position).sub(group.current.position).divideScalar(body.radius).applyQuaternion(inverse);
    resources.material.uniforms.uLight.value=1.16-.16*THREE.MathUtils.smoothstep(group.current.position.length(),100,2700);
    const pixels=body.radius*shared.uScale.value/Math.max(1,camera.position.distanceTo(group.current.position));
    resources.material.uniforms.uDetail.value=THREE.MathUtils.smoothstep(pixels,12,120);
  });
  return <group ref={group} position={body.position} rotation={[THREE.MathUtils.degToRad(body.tilt),0,0]} scale={body.radius}>
    <mesh ref={surface} geometry={geometry} material={resources.material}/>
    {resources.atmosphere&&<mesh geometry={geometry} material={resources.atmosphere} scale={body.atmosphere!.shell} renderOrder={1}/>}
    {resources.ring&&resources.ringGeometry&&<mesh geometry={resources.ringGeometry} material={resources.ring} rotation={[-Math.PI/2,0,0]} renderOrder={2}/>}
  </group>;
}
