'use client';
import { useCallback,useEffect,useRef,type PointerEvent } from 'react';
import gsap from 'gsap';
export function useMagnetic<T extends HTMLElement>(strength=.28) {
  const ref=useRef<T>(null);
  useEffect(()=>()=>{if(ref.current)gsap.killTweensOf(ref.current);},[]);
  const onPointerMove=useCallback((event:PointerEvent<T>)=>{
    if(event.pointerType!=='mouse'||!window.matchMedia('(pointer: fine)').matches)return;
    const element=event.currentTarget,bounds=element.getBoundingClientRect();
    const x=(event.clientX-bounds.left)/bounds.width-.5,y=(event.clientY-bounds.top)/bounds.height-.5;
    element.style.setProperty('--mx',`${(x+.5)*100}%`);element.style.setProperty('--my',`${(y+.5)*100}%`);
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    element.style.setProperty('--rx',`${-y*12}deg`);element.style.setProperty('--ry',`${x*16}deg`);
    gsap.to(element,{x:x*bounds.width*strength,y:y*bounds.height*strength*1.3,duration:.6,ease:'power3.out',overwrite:'auto'});
  },[strength]);
  const onPointerLeave=useCallback((event:PointerEvent<T>)=>{
    event.currentTarget.style.setProperty('--rx','0deg');event.currentTarget.style.setProperty('--ry','0deg');
    gsap.to(event.currentTarget,{x:0,y:0,duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:1.1,ease:'elastic.out(1,.45)',overwrite:'auto'});
  },[]);
  return{ref,onPointerMove,onPointerLeave};
}
