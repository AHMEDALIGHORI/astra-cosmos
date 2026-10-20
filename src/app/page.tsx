import { Hero } from '@/components/sections/Hero';
import { SolarChapter, EarthChapter, OuterChapter } from '@/components/sections/SolarChapters';
import { ConstellationChapter, NumerologyChapter, NebulaChapter, BlackHoleChapter, ConsultationChapter, FinaleChapter } from '@/components/sections/DeepChapters';
import { ChartChapter } from '@/components/sections/ChartChapter';
import { CoursesChapter } from '@/components/sections/CoursesChapter';
import { Footer } from '@/components/sections/Footer';
import { COURSES } from '@/data/courses';
import { BRAND } from '@/lib/brand';
export default function HomePage() { const jsonLd = { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebSite', name: BRAND.name, url: BRAND.url, description: BRAND.description }, { '@type': 'ProfessionalService', name: BRAND.name, url: BRAND.url, offers: [{ '@type': 'Offer', name: 'Birth chart consultation' }, { '@type': 'Offer', name: 'Numerology reading' }] }, { '@type': 'ItemList', name: `${BRAND.name} courses`, itemListElement: COURSES.map((course, index) => ({ '@type': 'ListItem', position: index + 1, item: { '@type': 'Course', name: `${course.title[0]} ${course.title[1]}`, description: course.summary } })) }] }; return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><main><Hero /><SolarChapter /><EarthChapter /><OuterChapter /><ConstellationChapter /><NumerologyChapter /><ChartChapter /><NebulaChapter /><BlackHoleChapter /><CoursesChapter /><ConsultationChapter /><FinaleChapter /><Footer /></main></>; }
