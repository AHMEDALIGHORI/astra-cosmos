'use client';
import { useEffect,useRef } from 'react';
import gsap from 'gsap';
import { journey } from '@/lib/journey';
export function CosmicCursor() {
  const dot=useRef<HTMLSpanElement>(null),ring=useRef<HTMLSpanElement>(null),label=useRef<HTMLSpanElement>(null);
  useEffect(()=>{
    const media=window.matchMedia('(pointer: fine)');
    if(!media.matches)return;
    document.documentElement.classList.add('has-cursor');
    const dx=gsap.quickTo(dot.current,'x',{duration:.12}),dy=gsap.quickTo(dot.current,'y',{duration:.12});
    const rx=gsap.quickTo(ring.current,'x',{duration:.55}),ry=gsap.quickTo(ring.current,'y',{duration:.55});
    let x=-100,y=-100,interactive:Element|null=null,frame=0;
    const move=(event:PointerEvent)=>{x=event.clientX;y=event.clientY;interactive=(event.target as Element).closest('a,button,summary,select,[data-cursor]');dx(x);dy(y);rx(x);ry(y);};
    const tick=()=>{
      let nearest:typeof journey.targets[number]|undefined, distance=Infinity;
      if(!interactive)for(const target of journey.targets){const d=Math.hypot(x-target.x,y-target.y);if(d<target.r&&d<distance){nearest=target;distance=d;}}
      if(ring.current)ring.current.dataset.state=interactive?(interactive.getAttribute('data-cursor')==='cta'?'cta':'link'):nearest?'body':'idle';
      if(label.current)label.current.textContent=nearest?.label??'';
      frame=requestAnimationFrame(tick);
    };
    const leave=()=>{if(ring.current)ring.current.style.opacity='0';if(dot.current)dot.current.style.opacity='0';};
    const enter=()=>{if(ring.current)ring.current.style.opacity='1';if(dot.current)dot.current.style.opacity='1';};
    window.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerleave',leave);document.addEventListener('pointerenter',enter);
    frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);[dx,dy,rx,ry].forEach(t=>t.tween.kill());window.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);document.removeEventListener('pointerenter',enter);document.documentElement.classList.remove('has-cursor');};
  },[]);
  return <><span ref={dot} className="cosmic-cursor-dot" aria-hidden="true"/><span ref={ring} className="cosmic-cursor-ring" data-state="idle" aria-hidden="true"><span ref={label} className="cosmic-cursor-label"/></span></>;
}
