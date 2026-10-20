'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Chapter, Kinetic } from '@/components/cosmic/Chapter';
import { CourseCard } from '@/components/ui/CourseCard';
import { COURSES } from '@/data/courses';
import { useCosmic } from '@/lib/store';
const OFFSETS=['lg:mt-0','lg:mt-28','lg:mt-10','lg:mt-40'];
export function CoursesChapter() {
  const root=useRef<HTMLDivElement>(null),still=useCosmic(s=>s.reducedMotion);
  useGSAP(()=>{
    const header=gsap.timeline({scrollTrigger:{trigger:root.current?.querySelector('[data-courses-header]'),start:'top 68%',toggleActions:'play none none reverse'}});
    if(still)header.fromTo('[data-courses-header]',{opacity:0},{opacity:1,duration:.8});
    else header.fromTo('[data-courses-header] .k-line-inner',{yPercent:118},{yPercent:0,duration:1.5,stagger:.13,ease:'expo.out'},0).fromTo('[data-courses-soft]',{opacity:0,y:18},{opacity:1,y:0,duration:1.2,stagger:.14,ease:'power2.out'},.5);
    root.current?.querySelectorAll('[data-course]').forEach((card,i)=>gsap.fromTo(card,{opacity:0,y:still?0:70},{opacity:1,y:0,duration:1.5,delay:(i%4)*.09,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 90%',toggleActions:'play none none reverse'}}));
  },{scope:root,dependencies:[still],revertOnUpdate:true});
  return <Chapter id="courses" kind="flow"><div ref={root} className="max-w-6xl mx-auto"><header data-courses-header><p data-courses-soft className="chapter-number">The observatory · Courses</p><Kinetic as="h2" className="display-lg">The observatory.</Kinetic><p data-courses-soft className="body-copy">Four courses, taught the way a language is: vocabulary first, then grammar, then fluency.</p></header><div className="course-grid">{COURSES.map((course,index)=><div data-course className={OFFSETS[index]} key={course.slug}><CourseCard course={course} index={index}/></div>)}</div></div></Chapter>;
}
