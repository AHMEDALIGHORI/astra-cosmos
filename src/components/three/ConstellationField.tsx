'use client';
import { useEffect,useMemo,useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CONSTELLATIONS,type ConstellationDef } from '@/data/constellations';
import { CONSTELLATION_ZONE } from '@/data/world';
import { constellationLabels } from '@/lib/labels';
import { gauss,mulberry32,smoothstep } from '@/lib/math';
import { journey } from '@/lib/journey';
import { allocateParticles,particleGeometry,particleMaterial,lineMaterial,segmentGeometry,visibleAt } from './shared';
const SIDES=[[1,.4],[-1,-.6],[.8,.8],[-.9,-.3],[1,-.7],[-.8,.6],[.9,.2],[-1,-.8],[.7,.7],[-.9,.3],[1,-.5],[-.8,-.2]];
export function ConstellationField(){return <group>{CONSTELLATIONS.map((constellation,index)=><Constellation key={constellation.id} constellation={constellation} index={index}/>)}</group>;}
function Constellation({constellation,index}:{constellation:ConstellationDef;index:number}) {
  const group=useRef<THREE.Group>(null),anchor=useMemo(()=>new THREE.Vector3(),[]);
  const system=useMemo(()=>{
    const random=mulberry32(410+index*101),[sx,sy]=SIDES[index],scale=CONSTELLATION_ZONE.scale;
    const position=new THREE.Vector3(sx*44,sy*22,CONSTELLATION_ZONE.startZ-index*CONSTELLATION_ZONE.spacing);
    const rotation=new THREE.Euler(-sy*.12,-sx*.22,(random()*2-1)*.15);
    const count=constellation.stars.length+44,data=allocateParticles(count);
    let lowest=Infinity;
    constellation.stars.forEach(([x,y,magnitude],i)=>{
      const brightness=THREE.MathUtils.clamp(1-(magnitude-.9)/4.2,0,1);
      data.positions.set([x*scale,y*scale,gauss(random)*14],i*3);lowest=Math.min(lowest,y*scale);
      data.sizes[i]=1.6+4.2*brightness;data.colors.set([.84,.9,1],i*3);
      data.rands.set([random(),random(),random(),random()],i*4);
    });
    for(let i=constellation.stars.length;i<count;i++){
      data.positions.set([(random()*2-1)*scale*1.8,(random()*2-1)*scale*1.8,gauss(random)*18],i*3);
      data.sizes[i]=.8+random()*1.2;data.colors.set([.35,.42,.55],i*3);data.rands.set([random(),random(),random(),random()],i*4);
    }
    const vertices:number[]=[],order:number[]=[];let length=0;
    for(const [from,to] of constellation.lines){
      const a=new THREE.Vector3().fromArray(data.positions,from*3),b=new THREE.Vector3().fromArray(data.positions,to*3),direction=b.clone().sub(a);
      const gap=Math.min(direction.length()*.2,5.5);direction.normalize();a.addScaledVector(direction,gap);b.addScaledVector(direction,-gap);
      vertices.push(...a.toArray(),...b.toArray());order.push(length);length+=a.distanceTo(b);order.push(length);
    }
    return{position,rotation,lowest,starGeometry:particleGeometry(data),stars:particleMaterial({dissolve:true,twinkle:.8,minSize:1.2,maxSize:30,softness:5.5,nearFade:18,extra:{uSpread:{value:170}}}),lineGeometry:segmentGeometry(vertices,order.map(t=>t/Math.max(length,.001))),lines:lineMaterial({color:'#D9DEEA',nearFade:26})};
  },[constellation,index]);
  useEffect(()=>()=>{system.starGeometry.dispose();system.stars.dispose();system.lineGeometry.dispose();system.lines.dispose();},[system]);
  useFrame(({camera,size})=>{
    if(!group.current)return;
    const ahead=camera.position.z-system.position.z;
    const active=visibleAt(journey.ts,[3.72,5.35])&&(journey.warm||(ahead>=-100&&ahead<=480));
    group.current.visible=active;
    journey.targets=journey.targets.filter(target=>target.id!==`constellation:${constellation.id}`);
    const label=constellationLabels.get(constellation.id);
    if(!active){if(label)label.style.visibility='hidden';return;}
    const reveal=smoothstep(450,250,ahead),draw=smoothstep(310,150,ahead),dissolve=smoothstep(46,-46,ahead);
    system.stars.uniforms.uReveal.value=reveal;system.stars.uniforms.uDissolve.value=dissolve;
    system.lines.uniforms.uDraw.value=draw;system.lines.uniforms.uOpacity.value=.6*reveal*(1-smoothstep(0,.7,dissolve));
    group.current.updateWorldMatrix(true,false);
    anchor.set(0,system.lowest-20,0);group.current.localToWorld(anchor);anchor.project(camera);
    const x=THREE.MathUtils.clamp((anchor.x*.5+.5)*size.width,72,size.width-72),y=THREE.MathUtils.clamp((.5-anchor.y*.5)*size.height,52,size.height-36);
    const visibility=smoothstep(235,170,ahead)*(1-smoothstep(95,50,ahead));
    const inFrame=anchor.z>=-1&&anchor.z<=1;
    if(label){label.style.transform=`translate3d(${x}px,${y}px,0) translateX(-50%)`;label.style.opacity=String(visibility);label.style.visibility=visibility>.001&&inFrame?'visible':'hidden';}
    if(visibility>.6&&inFrame)journey.targets.push({id:`constellation:${constellation.id}`,label:constellation.name,x,y,r:90});
  });
  return <group ref={group} position={system.position} rotation={system.rotation}><lineSegments geometry={system.lineGeometry} material={system.lines}/><points geometry={system.starGeometry} material={system.stars}/></group>;
}
