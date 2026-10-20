'use client';
import { Chapter, Beat, Kinetic } from '@/components/cosmic/Chapter';
export function SolarChapter() {
  return <Chapter id="solar"><div className="stage-copy"><p className="chapter-number">01 / INNER WORLDS</p><Beat from={.02} to={.24} exit="approach"><Kinetic as="h2" className="display-lg">The Sun, then the first worlds.</Kinetic></Beat><Beat from={.28} to={.51} enter="track"><Kinetic as="h2" className="display-lg">Sun</Kinetic></Beat><Beat from={.54} to={.7} enter="track"><Kinetic as="h2" className="display-lg">Mercury</Kinetic></Beat><Beat from={.73} to={.96} enter="track"><Kinetic as="h2" className="display-lg">Venus</Kinetic></Beat></div></Chapter>;
}
export function EarthChapter() {
  return <Chapter id="earth"><div className="stage-copy ml-auto"><p className="chapter-number">N° 03 · Earth · 1.00 AU</p><Beat from={.06} to={.88} enter="focus" exit="recede"><Kinetic as="h2" className="display-lg">Not only a date.</Kinetic><p data-soft className="body-copy">A position, under one particular sky.</p><p data-soft className="instrument-note mt-8">φ latitude · λ longitude · t the moment</p></Beat></div></Chapter>;
}
export function OuterChapter() {
  return <Chapter id="outer"><div className="stage-copy"><p className="chapter-number">03 / OUTER WORLDS</p><Beat from={.02} to={.18} enter="track"><Kinetic as="h2" className="display-lg">Moon</Kinetic></Beat><Beat from={.19} to={.34} enter="track"><Kinetic as="h2" className="display-lg">Mars</Kinetic></Beat><Beat from={.35} to={.5} enter="track"><Kinetic as="h2" className="display-lg">Jupiter</Kinetic></Beat><Beat from={.51} to={.66} enter="track"><Kinetic as="h2" className="display-lg">Saturn</Kinetic></Beat><Beat from={.67} to={.8} enter="track"><Kinetic as="h2" className="display-lg">Uranus</Kinetic></Beat><Beat from={.81} to={.95} enter="track"><Kinetic as="h2" className="display-lg">Neptune</Kinetic><p data-soft className="body-copy">Astrology begins by reading that arrangement.</p></Beat></div></Chapter>;
}
