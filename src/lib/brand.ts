export const BRAND = {
  name: 'ASTRA',
  wordmark: 'Astra',
  title: 'Your Journey Through the Cosmos',
  tagline: 'Your journey through the cosmos begins with you.',
  description: 'Explore astrology, numerology, birth charts and cosmic patterns through an immersive journey through the universe.',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  email: 'hello@astra.example',
  locale: 'en',
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'YouTube', href: 'https://www.youtube.com/' },
    { label: 'X', href: 'https://x.com/' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
} as const;

export type Brand = typeof BRAND;
