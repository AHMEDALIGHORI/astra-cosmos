import type Lenis from 'lenis';
import { CHAPTERS, chapterIndex, type ChapterId } from './journey';
import { clamp } from './math';
export interface SectionMeasure { top: number; height: number; }
export const scrollState = { lenis: null as Lenis | null, sections: [] as SectionMeasure[], locked: false };
export function measureSections(): SectionMeasure[] {
  if (typeof window === 'undefined') return scrollState.sections;
  const scrollY = window.scrollY;
  scrollState.sections = CHAPTERS.map((chapter) => {
    const el = document.querySelector(`[data-chapter="${chapter.id}"]`);
    if (!el) return { top: 0, height: 1 };
    const rect = el.getBoundingClientRect();
    return { top: rect.top + scrollY, height: Math.max(rect.height, 1) };
  });
  return scrollState.sections;
}
export function timeForScroll(scroll: number): number {
  if (!scrollState.sections.length) measureSections();
  if (!scrollState.sections.length) return 0;
  let index = 0;
  for (let i = scrollState.sections.length - 1; i >= 0; i -= 1) if (scroll >= scrollState.sections[i].top - 0.5) { index = i; break; }
  const section = scrollState.sections[index];
  const max = index === scrollState.sections.length - 1 ? 1.5 : 1;
  return index + clamp((scroll - section.top) / section.height, 0, max);
}
export function scrollForTime(t: number): number {
  if (!scrollState.sections.length) measureSections();
  const index = clamp(Math.floor(t), 0, Math.max(scrollState.sections.length - 1, 0));
  const section = scrollState.sections[index] ?? { top: 0, height: 1 };
  return section.top + (t - index) * section.height;
}
export function scrollToChapter(id: ChapterId, local = 0, options: { immediate?: boolean; duration?: number } = {}) {
  const target = Math.round(scrollForTime(chapterIndex(id) + local));
  if (scrollState.lenis) scrollState.lenis.scrollTo(target, { immediate: options.immediate, duration: options.duration ?? 2.4, force: true });
  else window.scrollTo({ top: target, behavior: options.immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
export function scrollToElement(element: Element, offset = 0) {
  const target = element.getBoundingClientRect().top + window.scrollY + offset;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (scrollState.lenis) scrollState.lenis.scrollTo(target, { immediate: still, duration: 1.4, force: true });
  else window.scrollTo({ top: target, behavior: still ? 'auto' : 'smooth' });
}
