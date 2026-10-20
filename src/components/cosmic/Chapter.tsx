'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fragment, useRef, type CSSProperties, type ReactNode } from 'react';
import { chapterById, type ChapterId } from '@/lib/journey';
import { buildBeat, type EnterMotion, type ExitMotion } from '@/lib/motion';
import { useCosmic } from '@/lib/store';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Chapter({ id, kind, children, className = '' }: { id: ChapterId; kind?: 'stage' | 'flow'; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useCosmic((state) => state.reducedMotion);
  const chapter = chapterById(id);
  const chapterKind = kind ?? chapter.kind;

  useGSAP(() => {
    const section = ref.current;
    if (!section || chapterKind !== 'stage') return;
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
    });
    timeline.to(section, { opacity: 1, duration: 1 }, 0);
    section.querySelectorAll<HTMLElement>('[data-beat]').forEach((beat) => buildBeat(timeline, beat, reducedMotion));
  }, { scope: ref, dependencies: [chapterKind, reducedMotion], revertOnUpdate: true });

  if (chapterKind === 'flow') {
    return <section ref={ref} id={id} data-chapter={id} className={`flow-section ${className}`}>{children}</section>;
  }

  return <section ref={ref} id={id} data-chapter={id} className={`stage ${className}`} style={{ height: `${chapter.length}lvh` }}>
    <div data-stage className="stage-inner">{children}</div>
  </section>;
}

export function Beat({ children, from = 0, to = 1, enter, exit = 'lift', dIn, dOut, style, className = '', interactive = false, initial = false }: { children: ReactNode; from?: number; to?: number; enter?: EnterMotion; exit?: ExitMotion; dIn?: number; dOut?: number; style?: CSSProperties; className?: string; interactive?: boolean; initial?: boolean }) {
  return <div className={`beat ${className}`} style={style} data-beat data-from={from} data-to={to} data-din={dIn} data-dout={dOut} data-enter={enter ?? (initial ? 'none' : 'mask')} data-exit={exit} data-interactive={interactive || undefined} data-initial={initial || undefined}>{children}</div>;
}

export function Kinetic({ children, as: Tag = 'span', className = '' }: { children: string; as?: 'span' | 'h1' | 'h2' | 'p'; className?: string }) {
  const lines = children.split('\n');
  return <Tag className={className} aria-label={children.replaceAll('\n', ' ')}>{lines.map((line, lineIndex) => <span className="k-line" key={`${line}-${lineIndex}`} aria-hidden="true"><span className="k-line-inner">{line.split(/(\s+)/).filter(Boolean).map((word, wordIndex) => /^\s+$/.test(word)
    ? <Fragment key={`${lineIndex}-space-${wordIndex}`}>{word}</Fragment>
    : <span className="k-word" key={`${lineIndex}-word-${wordIndex}`}>{Array.from(word).map((char, charIndex) => <span className="k-char" key={`${lineIndex}-${wordIndex}-${charIndex}`}>{char}</span>)}</span>)}</span></span>)}</Tag>;
}
