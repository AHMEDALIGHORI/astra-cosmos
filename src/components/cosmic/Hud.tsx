'use client';
import { CHAPTERS } from '@/lib/journey';
import { useCosmic } from '@/lib/store';
export function Hud() { const chapter = useCosmic((s) => s.chapter); const current = CHAPTERS.find((item) => item.id === chapter) ?? CHAPTERS[0]; return <><div className="hud" aria-hidden="true"><span>{String(current.index + 1).padStart(2, '0')} / {CHAPTERS.length} · {current.label}</span><span>From the Sun · <span data-hud-distance>5.60 AU</span></span></div><div className="hud-rail" aria-hidden="true"><span className="hud-rail-fill" /></div></>; }
