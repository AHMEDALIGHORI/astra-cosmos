import Link from 'next/link';
import type { ReactNode } from 'react';
import { BRAND } from '@/lib/brand';
export function Document({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) { return <main className="flow-section"><div className="max-w-5xl mx-auto"><header className="flex items-center justify-between gap-4 mb-24"><Link href="/" className="nav-brand">{BRAND.name}</Link><Link href="/" className="nav-link">Return to the journey ↗</Link></header><article className="max-w-2xl"><p className="eyebrow">{eyebrow}</p><h1 className="display-lg">{title}</h1><div className="body-copy space-y-8">{children}</div></article></div></main>; }
