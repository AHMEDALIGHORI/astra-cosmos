import gsap from 'gsap';

export type EnterMotion = 'none' | 'mask' | 'focus' | 'track' | 'rise' | 'fade';
export type ExitMotion = 'none' | 'lift' | 'spread' | 'approach' | 'dissolve' | 'dark' | 'recede' | 'fade';

export function buildBeat(timeline: gsap.core.Timeline, beat: HTMLElement, reducedMotion: boolean) {
  const from = Number(beat.dataset.from ?? 0);
  const to = Number(beat.dataset.to ?? 1);
  const span = to - from;
  let enter = (beat.dataset.enter ?? 'mask') as EnterMotion;
  let exit = (beat.dataset.exit ?? 'lift') as ExitMotion;
  if (reducedMotion) {
    enter = enter === 'none' ? 'none' : 'fade';
    exit = exit === 'none' ? 'none' : 'fade';
  }
  const dIn = Math.min(Number(beat.dataset.din ?? .07), span * .36);
  const dOut = Math.min(Number(beat.dataset.dout ?? .06), span * (enter === 'none' ? 1 : .36));
  const lines = beat.querySelectorAll<HTMLElement>('.k-line-inner');
  const chars = beat.querySelectorAll<HTMLElement>('.k-char');
  const soft = beat.querySelectorAll<HTMLElement>('[data-soft]');
  const rules = beat.querySelectorAll<HTMLElement>('[data-rule]');
  const interactive = beat.hasAttribute('data-interactive');
  const shown = interactive ? { autoAlpha: 1 } : { opacity: 1 };
  const hidden = interactive ? { autoAlpha: 0 } : { opacity: 0 };
  if (enter !== 'none') {
    timeline.set(beat, shown, Math.max(from, .0005));
    if (enter === 'mask' && lines.length) timeline.fromTo(lines, { yPercent: 118 }, { yPercent: 0, duration: dIn, stagger: dIn * .2, ease: 'power3.out' }, from);
    if (enter === 'track' && lines.length) timeline.fromTo(lines, { '--spread': '.55em', opacity: 0 }, { '--spread': '0em', opacity: 1, duration: dIn, stagger: dIn * .15, ease: 'power3.out' }, from);
    if (enter === 'rise') timeline.fromTo(beat, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: dIn, ease: 'power2.out' }, from);
    if (enter === 'focus') {
      timeline.fromTo(beat, { filter: 'blur(16px)' }, { filter: 'blur(0px)', duration: dIn, ease: 'power2.out' }, from);
      if (chars.length) timeline.fromTo(chars, { opacity: 0 }, { opacity: 1, duration: dIn * .5, stagger: { amount: dIn * .5, from: 'random' } }, from);
      else timeline.fromTo(beat, { opacity: 0 }, { opacity: 1, duration: dIn }, from);
    }
    if (enter === 'fade') timeline.fromTo(beat, { opacity: 0 }, { opacity: 1, duration: dIn }, from);
    if (soft.length && !reducedMotion) timeline.fromTo(soft, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: dIn * .8, stagger: dIn * .18, ease: 'power2.out' }, from + dIn * .5);
    if (rules.length && !reducedMotion) timeline.fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: dIn, ease: 'power2.inOut' }, from + dIn * .2);
  }
  if (exit === 'none') return;
  const out = to - dOut;
  switch (exit) {
    case 'lift':
      if (lines.length) timeline.to(lines, { yPercent: -118, duration: dOut, stagger: dOut * .14, ease: 'power2.in' }, out);
      if (soft.length) timeline.to(soft, { opacity: 0, duration: dOut * .6 }, out);
      timeline.to(beat, { opacity: 0, duration: dOut * .4 }, out + dOut * .6);
      break;
    case 'spread':
      if (lines.length) timeline.to(lines, { '--spread': '.62em', duration: dOut, ease: 'power1.in' }, out);
      timeline.to(beat, { opacity: 0, scale: 1.07, filter: 'blur(10px)', duration: dOut, ease: 'power1.in' }, out);
      break;
    case 'approach':
      timeline.to(beat, { scale: 2.7, opacity: 0, filter: 'blur(14px)', duration: dOut, ease: 'power2.in' }, out);
      break;
    case 'dissolve':
      if (chars.length) timeline.to(chars, { opacity: 0, x: () => gsap.utils.random(-70, 70), y: () => gsap.utils.random(-60, 34), rotation: () => gsap.utils.random(-28, 28), duration: dOut * .65, stagger: { amount: dOut * .35, from: 'random' }, ease: 'power1.in' }, out);
      if (soft.length) timeline.to(soft, { opacity: 0, duration: dOut * .5 }, out);
      timeline.to(beat, { filter: 'blur(6px)', duration: dOut, ease: 'power1.in' }, out);
      break;
    case 'dark':
      if (chars.length) timeline.to(chars, { opacity: 0, duration: dOut * .35, stagger: { amount: dOut * .65, from: 'end' } }, out);
      if (soft.length) timeline.to(soft, { opacity: 0, duration: dOut * .5 }, out);
      break;
    case 'recede':
      timeline.to(beat, { scale: .8, opacity: 0, filter: 'blur(7px)', duration: dOut, ease: 'power1.in' }, out);
      break;
    case 'fade': timeline.to(beat, { opacity: 0, duration: dOut }, out); break;
  }
  timeline.set(beat, hidden, Math.min(to, .9995));
}
