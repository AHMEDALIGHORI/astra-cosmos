'use client';
import { useEffect,useRef } from 'react';
import gsap from 'gsap';
import { useCosmic } from '@/lib/store';
import { BRAND } from '@/lib/brand';
import { NAV_LINKS,BEGIN_TARGET } from '@/data/navigation';
import { scrollToChapter,scrollState } from '@/lib/scroll';
import { CosmicButton } from './CosmicButton';
export function Navigation() {
  const chapter=useCosmic(s=>s.chapter),navMode=useCosmic(s=>s.navMode),menuOpen=useCosmic(s=>s.menuOpen),setMenuOpen=useCosmic(s=>s.setMenuOpen),entered=useCosmic(s=>s.entered),dialog=useCosmic(s=>s.dialog);
  const menu=useRef<HTMLDivElement>(null),toggle=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(!menuOpen||!menu.current)return;
    const previous=document.activeElement as HTMLElement|null;
    const oldOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';scrollState.lenis?.stop();
    const focusables=()=>Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled]),a[href]')??[]);
    focusables()[0]?.focus();
    const context=gsap.context(()=>{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)gsap.fromTo('[data-menu-link]',{yPercent:110},{yPercent:0,duration:.9,stagger:.06,ease:'expo.out'});},menu);
    const keydown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setMenuOpen(false);}
      if(event.key==='Tab'){const items=focusables(),first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
    };
    document.addEventListener('keydown',keydown);
    return()=>{context.revert();document.removeEventListener('keydown',keydown);document.body.style.overflow=oldOverflow;scrollState.lenis?.start();previous?.focus();};
  },[menuOpen,setMenuOpen]);
  const travel=(id:typeof BEGIN_TARGET.chapter,local=0)=>{setMenuOpen(false);requestAnimationFrame(()=>scrollToChapter(id,local));};
  return <><nav className="nav" data-mode={navMode} data-hidden={!entered||Boolean(dialog)||menuOpen}><button className="nav-brand bg-transparent border-0" onClick={()=>scrollToChapter('hero')}>{BRAND.name}</button><div className="nav-links">{NAV_LINKS.map(link=><button key={link.label} className="nav-link bg-transparent border-0" aria-current={link.covers.includes(chapter)?'page':undefined} onClick={()=>scrollToChapter(link.chapter,link.local)}>{link.label}</button>)}</div><div className="nav-action"><CosmicButton plain onClick={()=>scrollToChapter(BEGIN_TARGET.chapter,BEGIN_TARGET.local)}>Begin your journey</CosmicButton></div><button ref={toggle} className="nav-toggle" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={()=>setMenuOpen(true)}><span/><span/></button></nav>{menuOpen&&<div ref={menu} id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label={`${BRAND.name} · Explore`}><button className="mobile-menu-close" aria-label="Close menu" onClick={()=>setMenuOpen(false)}>×</button><p className="eyebrow">{BRAND.name} · Explore</p><div className="grid gap-5 my-8">{NAV_LINKS.map((link,index)=><div className="overflow-hidden" key={link.label}><button data-menu-link className="mobile-menu-link" onClick={()=>travel(link.chapter,link.local)}><small>{String(index+1).padStart(2,'0')}</small> {link.label}</button></div>)}</div><div className="chapter-rule"/><CosmicButton onClick={()=>travel(BEGIN_TARGET.chapter,BEGIN_TARGET.local)}>Begin your journey</CosmicButton></div>}</>;
}
