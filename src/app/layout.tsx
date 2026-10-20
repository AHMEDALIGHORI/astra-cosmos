import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import type { ReactNode } from 'react';
import { BRAND } from '@/lib/brand';
import { CosmicExperience } from '@/components/cosmic/CosmicExperience';
import './globals.css';

const display = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], variable: '--face-display', display: 'swap' });
const sans = Geist({ subsets: ['latin'], variable: '--face-sans', display: 'swap' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--face-mono', display: 'swap' });
const title = `${BRAND.title} | ${BRAND.name}`;

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: { default: title, template: `%s | ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  keywords: ['astrology', 'numerology', 'birth chart', 'natal chart', 'life path number', 'astrology consultation', 'astrology course', 'numerology course', 'zodiac constellations'],
  alternates: { canonical: '/' },
  openGraph: { type: 'website', url: '/', siteName: BRAND.name, title, description: BRAND.description, locale: 'en_US' },
  twitter: { card: 'summary_large_image', title, description: BRAND.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: '#050507', colorScheme: 'dark', width: 'device-width', initialScale: 1 };

const NO_SCRIPT_CSS = `
  .loading-veil { display: none !important; }
  [data-chapter] { height: auto !important; }
  [data-stage] { position: static !important; height: auto !important; min-height: 0 !important; padding: 12vh var(--gutter); }
  [data-beat] { position: static !important; opacity: 1 !important; visibility: visible !important; margin-bottom: 9vh; transform: none !important; translate: none !important; }
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang={BRAND.locale} className={`${display.variable} ${sans.variable} ${mono.variable}`}><head><noscript><style>{NO_SCRIPT_CSS}</style></noscript></head><body><CosmicExperience>{children}</CosmicExperience></body></html>;
}
