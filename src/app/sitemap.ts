import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: BRAND.url, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 }, { url: `${BRAND.url}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: .3 }, { url: `${BRAND.url}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: .3 }]; }
