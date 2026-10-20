import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';
export default function manifest(): MetadataRoute.Manifest { return { name: `${BRAND.name} — ${BRAND.title}`, short_name: BRAND.name, description: BRAND.description, start_url: '/', display: 'standalone', background_color: '#050507', theme_color: '#050507', icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }] }; }
