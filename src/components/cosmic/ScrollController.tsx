'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CHAPTERS, chapterById, type ChapterId } from '@/lib/journey';
import { journey } from '@/lib/journey';
import { measureSections, scrollState, timeForScroll } from '@/lib/scroll';
import { detectQuality, hasWebGL } from '@/lib/quality';
import { useCosmic } from '@/lib/store';
import { cosmicEvents } from '@/lib/events';
import { distanceLabel } from '@/lib/distance';

export function ScrollController() {
  const setEnvironment = useCosmic((state) => state.setEnvironment);
  const setTask = useCosmic((state) => state.setTask);
  const setChapter = useCosmic((state) => state.setChapter);
  const entered = useCosmic((state) => state.entered);
  const reducedMotion = useCosmic((state) => state.reducedMotion);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => { const webgl = hasWebGL(); document.documentElement.dataset.webgl = webgl ? 'on' : 'off'; setEnvironment({ webgl, quality: detectQuality(), reducedMotion: reduced.matches }); };
    apply();
    const onMotionChange = () => apply();
    reduced.addEventListener?.('change', onMotionChange);
    document.fonts?.ready.then(() => setTask('fonts', 1));
    window.history.scrollRestoration = 'manual';
    if (!entered) document.documentElement.classList.add('is-locked');
    else document.documentElement.classList.remove('is-locked');
    if (!entered) window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = 'auto';
    ScrollTrigger.config({ ignoreMobileResize: true });

    const lenis = reduced.matches ? null : new Lenis({ lerp: .085, wheelMultiplier: .9, touchMultiplier: 1.4, smoothWheel: true });
    scrollState.lenis = lenis;
    let previousId: ChapterId | null = null;
    let previousPhase = entered ? 'INTRO' : 'LOADING';
    const update = (scroll: number) => {
      if (!entered) return;
      journey.t = timeForScroll(scroll);
      const journeyProgress = Math.min(1, journey.t / 11.64);
      document.documentElement.style.setProperty('--journey-progress', `${journeyProgress * 100}%`);
      const distance = document.querySelector<HTMLElement>('[data-hud-distance]');
      const distanceText = distanceLabel(journey.t);
      if (distance && distance.textContent !== distanceText) distance.textContent = distanceText;
      const index = Math.min(CHAPTERS.length - 1, Math.max(0, Math.floor(journey.t)));
      const chapter = CHAPTERS[index];
      if (chapter.id !== previousId) {
        const old = previousId ? chapterById(previousId) : null;
        if (old) cosmicEvents.emit('sectionExit', { id: old.id, index: old.index });
        cosmicEvents.emit('sectionEnter', { id: chapter.id, index: chapter.index });
        previousId = chapter.id;
      }
      if (chapter.phase !== previousPhase) {
        cosmicEvents.emit('phaseChange', { phase: chapter.phase });
        previousPhase = chapter.phase;
      }
      setChapter(chapter.id, chapter.phase, chapter.nav);
      document.documentElement.dataset.currentChapter = chapter.id;
      document.documentElement.dataset.phase = chapter.phase;
    };
    const onScroll = ({ scroll, velocity }: { scroll: number; velocity: number }) => {
      journey.scrollVelocity = velocity;
      update(scroll);
      ScrollTrigger.update();
    };
    lenis?.on('scroll', onScroll);
    const native = () => { update(window.scrollY); ScrollTrigger.update(); };
    if (!lenis) window.addEventListener('scroll', native, { passive: true });
    let frame = 0;
    const tick = (time: number) => {
      lenis?.raf(time);
      if (lenis) { update(lenis.animatedScroll); ScrollTrigger.update(); }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    let resizeTimer = 0;
    const resize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        measureSections();
        ScrollTrigger.refresh();
      }, 160);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(document.body);
    window.addEventListener('resize', resize);
    measureSections();
    if (entered) requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimer);
      observer.disconnect();
      lenis?.destroy();
      scrollState.lenis = null;
      window.removeEventListener('scroll', native);
      window.removeEventListener('resize', resize);
      reduced.removeEventListener?.('change', onMotionChange);
      document.documentElement.classList.remove('is-locked');
    };
  }, [entered, reducedMotion, setEnvironment, setTask, setChapter]);
  return null;
}
