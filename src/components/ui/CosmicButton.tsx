'use client';
import type { ButtonHTMLAttributes,ReactNode } from 'react';
import { useMagnetic } from '@/hooks/useMagnetic';
export function CosmicButton({children,variant='frame',plain=false,className='',onPointerMove,onPointerLeave,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'frame'|'solid';plain?:boolean;children:ReactNode}) {
  const magnetic=useMagnetic<HTMLButtonElement>();
  return <button ref={magnetic.ref} className={`cta ${variant==='solid'?'cta-solid':''} ${className}`} data-cursor="cta" onPointerMove={event=>{magnetic.onPointerMove(event);onPointerMove?.(event);}} onPointerLeave={event=>{magnetic.onPointerLeave(event);onPointerLeave?.(event);}} {...props}><span className="cta-marks" aria-hidden="true"/><svg className="cta-frame" aria-hidden="true"><rect className="cta-orbit" x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" pathLength="1"/></svg><span>{children}</span>{!plain&&<svg width="18" height="8" viewBox="0 0 18 8" aria-hidden="true"><path d="M0 4h17m-4-3 4 3-4 3" fill="none" stroke="currentColor"/></svg>}</button>;
}
