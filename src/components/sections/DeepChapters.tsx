'use client';
import { Chapter, Beat, Kinetic } from '@/components/cosmic/Chapter';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { useCosmic } from '@/lib/store';
import { CONSTELLATIONS } from '@/data/constellations';
import { BRAND } from '@/lib/brand';
import { scrollToChapter } from '@/lib/scroll';
export function ConstellationChapter() {
  return <Chapter id="constellations"><div className="stage-copy ml-auto"><p className="chapter-number">04 / CONSTELLATIONS</p><Beat from={.02} to={.28} exit="dissolve"><Kinetic as="h2" className="display-lg">The sky starts drawing itself.</Kinetic><p data-soft className="body-copy">For thousands of years, people have read it for meaning.</p></Beat><Beat from={.74} to={.98} enter="focus" exit="dissolve"><p className="body-copy">A language for patterns, not a forecast.</p></Beat></div><ul className="sr-only">{CONSTELLATIONS.map(c=><li key={c.id}>{c.name}, {c.dates}. Brightest star {c.alpha}, right ascension {c.ra}, declination {c.dec}.</li>)}</ul></Chapter>;
}
export function NumerologyChapter() {
  return <Chapter id="numerology"><div className="stage-copy"><p className="chapter-number">05 / NUMEROLOGY</p><Beat from={.02} to={.43} exit="dissolve"><Kinetic as="h2" className="display-lg">Nine numbers enter. One remains.</Kinetic></Beat><Beat from={.56} to={.92} enter="focus" exit="recede"><p className="body-copy">Patterns become meaningful when they become personal.</p></Beat></div></Chapter>;
}
export function NebulaChapter() {
  const openDialog=useCosmic(s=>s.openDialog);
  return <Chapter id="nebula"><div className="stage-copy"><p className="chapter-number">07 / NEBULA</p><Beat from={.04} to={.48} enter="focus" exit="dissolve"><Kinetic as="h2" className="display-lg">Gas, dust, and the distance between.</Kinetic></Beat><Beat from={.5} to={.93} enter="focus" exit="recede" interactive><p className="body-copy">A reading is a conversation between a chart and the person it belongs to.</p><div className="mt-8" data-soft><CosmicButton onClick={()=>openDialog({kind:'consultation',source:'nebula'})}>Book a personal reading</CosmicButton></div></Beat></div></Chapter>;
}
export function BlackHoleChapter() {
  return <Chapter id="blackhole"><div className="stage-copy ml-auto"><Beat from={.03} to={.59} enter="track" exit="dark" dOut={.18}><p data-soft className="chapter-number">08 / SINGULARITY</p><Kinetic as="h2" className="display-lg">Approach the edge.</Kinetic></Beat></div></Chapter>;
}
export function ConsultationChapter() {
  const openDialog=useCosmic(s=>s.openDialog);
  return <Chapter id="consultation"><div className="stage-copy"><Beat from={.04} to={.95} enter="focus" exit="recede" interactive><p data-soft className="eyebrow">One to one</p><Kinetic as="h2" className="display-lg">Make the map a conversation.</Kinetic><p data-soft className="body-copy">Explore your birth chart, numbers and cosmic patterns with a personalised consultation.</p><div data-soft className="mt-8 flex flex-wrap gap-4"><CosmicButton onClick={()=>openDialog({kind:'consultation',source:'consultation'})}>Book a consultation</CosmicButton><CosmicButton onClick={()=>scrollToChapter('courses')}>Explore courses</CosmicButton></div></Beat></div></Chapter>;
}
export function FinaleChapter() {
  const openDialog=useCosmic(s=>s.openDialog);
  return <Chapter id="finale"><div className="stage-copy text-center mx-auto"><Beat from={.63} to={1} enter="focus" exit="none" interactive><div id="finale-statement"><Kinetic as="h2" className="display-lg">And it all started with you.</Kinetic><div data-soft className="mt-10"><CosmicButton onClick={()=>openDialog({kind:'consultation',source:'finale'})}>Begin your journey</CosmicButton></div><p data-soft className="instrument-note mt-8">{BRAND.tagline}</p></div></Beat></div></Chapter>;
}
