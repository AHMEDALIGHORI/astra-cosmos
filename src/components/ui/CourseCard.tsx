'use client';

import type { CSSProperties } from 'react';
import { useCosmic } from '@/lib/store';
import { mulberry32 } from '@/lib/math';
import { useMagnetic } from '@/hooks/useMagnetic';
import type { Course } from '@/data/courses';

export function CourseCard({ course, index }: { course: Course; index: number }) {
  const openDialog = useCosmic((state) => state.openDialog);
  const magnetic = useMagnetic<HTMLButtonElement>();
  const style = {
    '--float-duration': `${10 + 1.7 * index}s`,
    '--float-delay': `${-2.3 * index}s`,
  } as CSSProperties;
  const description = `${course.numeral}, ${course.level}. ${course.title.join(' ')}. ${course.summary}. ${course.duration}, ${course.lessons}, ${course.format}. Reserve a place.`;

  return <button ref={magnetic.ref} className="course instrument-panel course-float" style={style} onPointerMove={magnetic.onPointerMove} onPointerLeave={magnetic.onPointerLeave} onClick={() => openDialog({ kind: 'course', source: 'course-card', courseSlug: course.slug })} aria-label={description} data-cursor="cta">
    <CourseEmblem course={course} index={index} />
    <div className="course-heading"><span className="course-number">{course.numeral}</span><span className="course-level">{course.level}</span></div>
    <span className="rule my-4" />
    <h3 className="course-title">{course.title[0]}<br />{course.title[1]}</h3>
    <div className="course-meta"><div><p className="course-summary">{course.summary}</p><p className="course-details mt-4">{course.duration} · {course.lessons} · {course.format}</p><span className="course-reserve">Reserve a place ↗</span></div></div>
  </button>;
}

function CourseEmblem({ course, index }: { course: Course; index: number }) {
  const random = mulberry32(570 + index * 31);
  const stars = Array.from({ length: 18 }, (_, i) => ({ x: 12 + random() * 216, y: 12 + random() * 216, r: .45 + random() * 1.1, opacity: .25 + random() * .55, i }));
  const ring = (radius: number, strong = false) => <circle key={radius} className={strong ? 'e-strong' : 'e-line'} cx="120" cy="120" r={radius} />;
  return <svg className="course-emblem" viewBox="0 0 240 240" aria-hidden="true">
    {stars.map((star) => <circle key={star.i} className="e-star" cx={star.x} cy={star.y} r={star.r} style={{ '--i': star.i, '--o': star.opacity } as CSSProperties} />)}
    {course.emblem === 'orrery' && <>
      {[34, 60, 86, 112].map((radius) => ring(radius, radius === 60))}
      {[34, 60, 86, 112].map((radius, orbit) => <g className="e-orbit" key={radius} style={{ '--orbit': `${7 + orbit * 4}s` } as CSSProperties}><circle className="e-dot" cx={120 + radius} cy="120" r={orbit === 3 ? 3.4 : 2.4} /></g>)}
    </>}
    {course.emblem === 'lattice' && <>
      {ring(98)}<path className="e-strong e-orbit" style={{ '--orbit': '38s' } as CSSProperties} d="M120 26 214 120 120 214 26 120Z" />
      {[80, 120, 160].map((x) => [80, 120, 160].map((y) => <g key={`${x}-${y}`}><circle className="e-dot" cx={x} cy={y} r="2" />{x !== 160 && <path className="e-line" d={`M${x} ${y}h40`} />}{y !== 160 && <path className="e-line" d={`M${x} ${y}v40`} />}</g>))}
      <path className="e-line" d="M80 80 160 160M160 80 80 160" />
    </>}
    {course.emblem === 'chart' && <>
      {ring(105)}{ring(84)}{ring(37, true)}
      {Array.from({ length: 12 }, (_, i) => <path className="e-line" key={i} d={`M120 16v20`} transform={`rotate(${i * 30} 120 120)`} />)}
      <path className="e-strong" d="M120 55 176 151 64 151Z" />
      <g className="e-orbit" style={{ '--orbit': '13s' } as CSSProperties}><circle className="e-dot" cx="120" cy="27" r="3.2" /></g>
      <g className="e-orbit" style={{ '--orbit': '19s' } as CSSProperties}><circle className="e-dot" cx="120" cy="53" r="2.6" /></g>
    </>}
    {course.emblem === 'cycles' && <>
      <path className="e-line" d="M30 120a90 90 0 0 1 180 0" />
      <path className="e-strong e-orbit" style={{ '--orbit': '30s' } as CSSProperties} d="M48 120a72 72 0 0 1 144 0" />
      <path className="e-line e-orbit" style={{ '--orbit': '19s' } as CSSProperties} d="M65 120a55 55 0 0 1 110 0" />
      <path className="e-strong" d="M25 153c18 0 18-24 36-24s18 24 36 24 18-24 36-24 18 24 36 24 18-24 46-24" />
    </>}
    <circle className="e-dot" cx="120" cy="120" r="2.3" />
  </svg>;
}
