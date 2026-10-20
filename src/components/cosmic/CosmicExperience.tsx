'use client';
import dynamic from 'next/dynamic';
import type { MouseEvent, ReactNode } from 'react';
import { useCosmic } from '@/lib/store';
import { CosmicCursor } from '@/components/ui/CosmicCursor';
import { Loader } from '@/components/ui/Loader';
import { Navigation } from '@/components/ui/Navigation';
import { ConsultationDialog } from '@/components/ui/ConsultationDialog';
import { Hud } from './Hud';
import { ConstellationLabels } from './ConstellationLabels';
import { ScrollController } from './ScrollController';
import { scrollToChapter } from '@/lib/scroll';
const CosmicCanvas = dynamic(() => import('./CosmicCanvas').then((module) => module.CosmicCanvas), { ssr: false });
export function CosmicExperience({ children }: { children: ReactNode }) { const webgl = useCosmic((s) => s.webgl); const entered = useCosmic((s) => s.entered); const enter = useCosmic((s) => s.enter); const skip = (event: MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); if (!entered) enter(); requestAnimationFrame(() => requestAnimationFrame(() => scrollToChapter('consultation', .42))); }; return <div className="site-shell"><a className="sr-only-focusable" href="#consultation" onClick={skip}>Skip the journey: go to consultation</a><ScrollController /><Loader /><Navigation /><div className={webgl === false ? 'cosmic-fallback' : 'cosmic-canvas'}>{webgl !== false && <CosmicCanvas />}</div><div className="haze" id="haze-sun" /><div className="haze" id="haze-venus" /><div className="haze" id="haze-ember" /><ConstellationLabels /><Hud />{children}<ConsultationDialog /><CosmicCursor /></div>; }

