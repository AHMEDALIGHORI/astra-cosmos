'use client';

import { useEffect, useRef } from 'react';
import { CONSTELLATIONS } from '@/data/constellations';
import { constellationLabels } from '@/lib/labels';

export function ConstellationLabels() {
  return (
    <div className="constellation-labels" aria-hidden="true">
      {CONSTELLATIONS.map((constellation) => (
        <ConstellationLabel key={constellation.id} constellation={constellation} />
      ))}
    </div>
  );
}

function ConstellationLabel({ constellation }: { constellation: (typeof CONSTELLATIONS)[number] }) {
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = element.current;
    if (!node) return;
    constellationLabels.set(constellation.id, node);
    return () => { constellationLabels.delete(constellation.id); };
  }, [constellation.id]);

  return (
    <div ref={element} className="constellation-label">
      <i aria-hidden="true" />
      <span>{constellation.name}</span>
      <small>α {constellation.alpha} · {constellation.ra} · {constellation.dec}</small>
      <small>{constellation.dates}</small>
    </div>
  );
}
