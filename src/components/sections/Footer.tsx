'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { journey } from '@/lib/journey';
import { BRAND } from '@/lib/brand';
import { NAV_LINKS } from '@/data/navigation';
import { scrollToChapter } from '@/lib/scroll';
import { useCosmic } from '@/lib/store';
export function Footer() { const openDialog = useCosmic((s) => s.openDialog); const root = useRef<HTMLElement>(null);
useGSAP(() => {
  const footer = root.current;
  const statement = document.getElementById('finale-statement');
  const beat = statement?.parentElement;
  if (!footer || !statement || !beat) return;
  const lift = () => {
    const bottom = beat.offsetTop + beat.offsetHeight;
    const clear = window.innerHeight - footer.offsetHeight - 28;
    const room = beat.offsetTop - 150;
    return Math.max(0, Math.min(bottom - clear, room));
  };
  const trigger = { trigger: footer, start: 'top bottom', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true };
  gsap.to(statement, { y: () => -lift(), ease: 'none', scrollTrigger: trigger });
  gsap.to(journey, { finaleLift: () => lift() / (window.innerHeight / 2), ease: 'none', scrollTrigger: { ...trigger } });
}, { scope: root });
return <footer ref={root} className="footer"><div className="footer-grid"><div><p className="eyebrow">Look up.</p><h2 className="display-md">Look within.</h2><p className="body-copy">{BRAND.tagline}</p></div><div><p className="eyebrow">Explore</p><div className="grid gap-3 mt-5">{NAV_LINKS.map((link) => <button key={link.label} className="text-left bg-transparent border-0 p-0" onClick={() => scrollToChapter(link.chapter, link.local)}>{link.label}</button>)}</div></div><div><p className="eyebrow">Begin</p><div className="grid gap-3 mt-5"><button className="text-left bg-transparent border-0 p-0" onClick={() => openDialog({ kind: 'consultation', source: 'footer' })}>Book a consultation</button><button className="text-left bg-transparent border-0 p-0" onClick={() => scrollToChapter('courses')}>Explore courses</button><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></div></div><div><p className="eyebrow">Follow</p><div className="grid gap-3 mt-5">{BRAND.social.map((item) => <a key={item.label} href={item.href}>{item.label}</a>)}</div></div></div><div className="footer-bottom flex flex-wrap justify-between gap-4"><span>© {new Date().getFullYear()} {BRAND.wordmark}. Astrology and numerology are interpretive practices, offered for reflection.</span><span className="flex gap-4">{BRAND.legal.map((item) => <Link href={item.href} key={item.label}>{item.label}</Link>)}</span></div></footer>; }

