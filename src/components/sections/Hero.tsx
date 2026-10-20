'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useCosmic } from '@/lib/store';
import { Chapter, Beat, Kinetic } from '@/components/cosmic/Chapter';
import { BRAND } from '@/lib/brand';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { scrollToChapter } from '@/lib/scroll';
export function Hero() {
  const entered = useCosmic((s) => s.entered);
  const reducedMotion = useCosmic((s) => s.reducedMotion);
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!entered) return;
    if (reducedMotion) {
      gsap.fromTo('[data-intro]', { opacity: 0 }, { opacity: 1, duration: .8, delay: .3 });
      return;
    }
    gsap.timeline({ delay: .75 })
      .fromTo('.k-line-inner', { yPercent: 118 }, { yPercent: 0, duration: 1.7, stagger: .16, ease: 'expo.out' }, 0)
      .fromTo('.k-line-inner', { '--spread': '.16em' }, { '--spread': '0em', duration: 2.4, ease: 'expo.out' }, 0)
      .fromTo('[data-intro]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.4, stagger: .16, ease: 'power2.out' }, .8);
  }, { scope, dependencies: [entered, reducedMotion], revertOnUpdate: true });
  return <Chapter id="hero" className="hero">
    <div ref={scope} className="stage-copy">
      <Beat initial from={0} to={.65} exit="spread" dOut={.65}>
        <p data-intro className="eyebrow">Astrology · Numerology · Cosmic guidance</p>
        <Kinetic as="h1" className="display-xl">{BRAND.title}</Kinetic>
        <p data-intro className="body-copy">Yours is already being written.</p>
      </Beat>
      <Beat initial interactive from={0} to={.3} enter="none" exit="fade">
        <div data-intro className="mt-10"><CosmicButton onClick={() => scrollToChapter('solar')}>Scroll to enter</CosmicButton></div>
      </Beat>
    </div>
  </Chapter>;
}
