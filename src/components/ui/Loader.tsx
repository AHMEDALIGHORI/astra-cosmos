'use client';
import { useCallback,useEffect,useRef,useState } from 'react';
import gsap from 'gsap';
import { useCosmic } from '@/lib/store';
import { journey } from '@/lib/journey';
import { mulberry32 } from '@/lib/math';
export function Loader() {
  const progress=useCosmic(s=>s.progress),entered=useCosmic(s=>s.entered),enter=useCosmic(s=>s.enter),still=useCosmic(s=>s.reducedMotion);
  const [percent,setPercent]=useState(0),[done,setDone]=useState(entered);
  const veil=useRef<HTMLDivElement>(null),orbit=useRef<HTMLDivElement>(null),copy=useRef<HTMLDivElement>(null),point=useRef<HTMLSpanElement>(null),canvas=useRef<HTMLCanvasElement>(null),button=useRef<HTMLButtonElement>(null);
  const currentProgress=useRef(progress),leaving=useRef(false),timeline=useRef<gsap.core.Timeline|null>(null);
  currentProgress.current=progress;
  useEffect(()=>{
    if(done)return;
    const ctx=canvas.current?.getContext('2d');
    if(ctx&&canvas.current){const rnd=mulberry32(170);canvas.current.width=window.innerWidth;canvas.current.height=window.innerHeight;for(let i=0;i<170;i++){ctx.fillStyle=`rgba(237,235,229,${.1+rnd()*.35})`;ctx.beginPath();ctx.arc(rnd()*canvas.current.width,rnd()*canvas.current.height,.4+rnd(),0,Math.PI*2);ctx.fill();}}
    let frame=0,shown=0,previous=performance.now();const start=previous;
    const tick=(now:number)=>{const delta=now-previous;previous=now;const target=now-start>=12000?100:currentProgress.current*100;shown=Math.min(100,shown+Math.min(.055*delta,Math.max(.05,(target-shown)*.12),Math.max(0,target-shown)));if(target===100&&shown>99.7)shown=100;setPercent(Math.floor(shown));if(shown<100)frame=requestAnimationFrame(tick);};
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  },[done]);
  const leave=useCallback(()=>{
    if(leaving.current||done)return;
    leaving.current=true;
    if(still){enter();timeline.current=gsap.timeline({onComplete:()=>setDone(true)}).to(veil.current,{opacity:0,duration:.6});return;}
    const destination={x:window.innerWidth*.78,y:window.innerHeight*.56};
    timeline.current=gsap.timeline({onComplete:()=>setDone(true)})
      .to(copy.current,{opacity:0,y:-16,duration:.55},0)
      .to(orbit.current,{rotateX:0,rotation:0,scale:.015,duration:1.3,ease:'power3.inOut'},0)
      .set(point.current,{opacity:1},1.25)
      .call(()=>{enter();destination.x=(journey.sunScreen.visible?journey.sunScreen.x:.78)*window.innerWidth;destination.y=(journey.sunScreen.visible?journey.sunScreen.y:.56)*window.innerHeight;},[],1.4)
      .to(point.current,{x:()=>destination.x-window.innerWidth/2,y:()=>destination.y-window.innerHeight/2,duration:1.6,ease:'power3.inOut'},1.4)
      .to(veil.current,{backgroundColor:'rgba(5,5,7,0)',duration:1.6},1.4)
      .to(canvas.current,{opacity:0,duration:1.6},1.4)
      .to(point.current,{opacity:0,duration:.35},2.9);
  },[done,enter,still]);
  useEffect(()=>{if(percent===100){button.current?.focus();if(new URLSearchParams(window.location.search).has('skip'))leave();}},[percent,leave]);
  useEffect(()=>()=>{timeline.current?.kill();},[]);
  if(done)return null;
  return <div ref={veil} className="loading-veil"><canvas ref={canvas} className="absolute inset-0 pointer-events-none" aria-hidden="true"/><div className="loader-core"><div ref={orbit} className="loader-orbit" style={{perspective:900}}><svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1" pathLength="1" strokeDasharray="1" strokeDashoffset={1-percent/100} transform="rotate(-90 100 100)"/><g transform={`rotate(${percent*3.6} 100 100)`}><circle cx="100" cy="4" r="3" fill="currentColor"/></g></svg><div className="loader-percent">{String(percent).padStart(2,'0')}</div></div><div ref={copy} className="loader-label" role="status">{percent===100?<button ref={button} className="cta" onClick={leave}>Enter the cosmos</button>:'Initializing cosmic map'}</div></div><span ref={point} className="loader-point" aria-hidden="true"/></div>;
}
