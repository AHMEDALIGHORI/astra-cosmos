import Link from 'next/link';
import { Document } from '@/components/ui/Document';

export default function NotFound() {
  return <Document eyebrow="404 · uncharted" title="The coordinates slipped."><p>The page you were looking for is not on the map.</p><Link className="link mt-8" href="/">Return to the beginning of the journey ↗</Link></Document>;
}
