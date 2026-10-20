'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Chapter } from '@/components/cosmic/Chapter';
import { BirthChart } from '@/components/ui/BirthChart';
import { DateCoordinates } from '@/components/ui/DateCoordinates';
import { ReadingModules } from '@/components/ui/ReadingModules';
import { useCosmic } from '@/lib/store';
import { scrollToElement } from '@/lib/scroll';
export function ChartChapter() {
  const reading=useCosmic(s=>s.reading),reducedMotion=useCosmic(s=>s.reducedMotion);
  const root=useRef<HTMLDivElement>(null),instrument=useRef<HTMLDivElement>(null),tilt=useRef<HTMLDivElement>(null),results=useRef<HTMLDivElement>(null);
  useGSAP(()=>{
    gsap.fromTo('[data-arrive]',{opacity:0,y:reducedMotion?0:40},{opacity:1,y:0,duration:1.3,stagger:.14,ease:'power3.out',scrollTrigger:{trigger:root.current,start:'top 62%',toggleActions:'play none none reverse'}});
    if(reducedMotion||!window.matchMedia('(pointer: fine)').matches)return;
    const rx=gsap.quickTo(tilt.current,'rotationX',{duration:1.2,ease:'power3.out'}),ry=gsap.quickTo(tilt.current,'rotationY',{duration:1.2,ease:'power3.out'});
    const move=(event:PointerEvent)=>{rx(-((event.clientY/window.innerHeight)*2-1)*5);ry(((event.clientX/window.innerWidth)*2-1)*7);};
    window.addEventListener('pointermove',move,{passive:true});
    return()=>window.removeEventListener('pointermove',move);
  },{scope:root,dependencies:[reducedMotion],revertOnUpdate:true});
  const onPlotted=()=>window.setTimeout(()=>{const wide=window.matchMedia('(min-width:1024px)').matches;const target=wide?results.current:instrument.current;if(target)scrollToElement(target,wide?0:-72);},120);
  return <Chapter id="chart" kind="flow"><div ref={root} className="flow-grid"><div><div data-arrive><p className="chapter-number">06 / BIRTH CHART</p><h2 className="display-lg">Your own coordinates.</h2><p className="body-copy">Enter your date of birth to explore your chart and Life Path number. Calculated for noon UT, without a birthplace; houses and the Ascendant are not included.</p><div className="mt-10"><DateCoordinates onPlotted={onPlotted}/></div></div>{reading&&<div ref={results} id="chart-reading"><ReadingModules reading={reading}/></div>}</div><div ref={instrument} data-arrive className="sticky-instrument chart-wrap" style={{perspective:1000}}><div ref={tilt} className="w-full"><BirthChart reading={reading}/></div></div></div><div className="h-[30svh]" aria-hidden="true"/></Chapter>;
}
