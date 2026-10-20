'use client';

import { useCosmic } from '@/lib/store';
import { LIFE_PATH_COPY } from '@/lib/numerology';
import { ELEMENT_COPY, type Element } from '@/lib/astro/zodiac';
import { CosmicButton } from './CosmicButton';
import type { Reading } from '@/lib/astro/reading';

const ELEMENTS: Element[] = ['fire', 'earth', 'air', 'water'];

export function ReadingModules({ reading }: { reading: Reading }) {
  const openDialog = useCosmic((state) => state.openDialog);
  const life = LIFE_PATH_COPY[reading.lifePath.number];
  const element = ELEMENT_COPY[reading.dominantElement];
  return <div className="grid sm:grid-cols-2 gap-4 mt-10">
    <article className="instrument-panel p-6"><p className="eyebrow">Sun · {reading.sun.sign.name}</p><h3 className="display-md">{reading.sun.sign.name}</h3><p className="body-copy">{reading.sun.sign.sun}</p>{reading.sunOnCusp && <p className="instrument-note mt-3">The Sun changed sign on this day; your time of birth decides which.</p>}</article>
    <article className="instrument-panel p-6"><p className="eyebrow text-[var(--color-ice)]">Moon · {reading.moon.sign.name}</p><h3 className="display-md">{reading.moon.sign.name}</h3><p className="body-copy">{reading.moon.sign.moon}</p>{reading.moonUncertain && <p className="instrument-note mt-3">The Moon changed sign on this day; your time of birth decides which.</p>}</article>
    <article className="instrument-panel p-6"><p className="eyebrow">Life path · {reading.lifePath.working}</p><h3 className="display-md text-[var(--color-gold)]">{reading.lifePath.number}</h3><p className="body-copy">{life?.title}. {life?.line}</p></article>
    <article className="instrument-panel p-6"><p className="eyebrow">Elements · dominant {element.name}</p><h3 className="display-md">{element.name}</h3><p className="body-copy">{element.line}</p><p className="instrument-note mt-4">Ten bodies</p><div className="mt-3 grid gap-2">{ELEMENTS.map((name) => <div key={name} className="flex items-center gap-3"><span className="w-16 mono-copy">{name}</span><span className="h-px bg-[var(--color-gold)]" style={{ width: `${reading.elements[name] * 10}%` }} aria-label={`${reading.elements[name]} ${name} placements`} /></div>)}</div></article>
    <div className="sm:col-span-2 pt-4"><p className="instrument-note max-w-2xl">Cast for 12:00 UT with no place of birth, so the Ascendant and houses are left out. Positions are approximate. Astrology and numerology are interpretive traditions, not predictive sciences: read this as a starting point for reflection.</p><div className="mt-6"><CosmicButton onClick={() => openDialog({ kind: 'consultation', source: 'chart' })}>Read it with an astrologer</CosmicButton></div></div>
  </div>;
}
